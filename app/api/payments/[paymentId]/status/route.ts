import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"
import { TicketStockModel } from "@/lib/models/TicketStock"
import { EmailService } from "@/lib/email"
import { generateTicketQR, generateQRCodeDataURL } from "@/lib/qr-generator"

export async function GET(request: Request, { params }: { params: { paymentId: string } }) {
  try {
    const { paymentId } = params

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    console.log(`🔍 Checking status for payment: ${paymentId}`)

    const nowPayments = new NOWPaymentsAPI()

    // Method 1: Try to get payment from list (more reliable)
    let paymentData = null
    try {
      console.log("📋 Fetching from payments list...")
      paymentData = await nowPayments.getPaymentStatusFromList(paymentId)
      if (paymentData) {
        console.log(`✅ Found payment in list: ${paymentData.payment_status}`)
      }
    } catch (listError) {
      console.log("⚠️ List method failed, trying individual endpoint...")
    }

    // Method 2: Fallback to individual payment endpoint
    if (!paymentData) {
      try {
        console.log("🔍 Fetching individual payment...")
        paymentData = await nowPayments.getPaymentStatus(paymentId)
        if (paymentData && !paymentData.error) {
          console.log(`✅ Found individual payment: ${paymentData.payment_status}`)
        }
      } catch (individualError) {
        console.error("❌ Individual payment fetch failed:", individualError)
      }
    }

    // Get current ticket from database
    const currentTicket = await KaspaBirthdayTicketsModel.findByPaymentId(paymentId)
    if (!currentTicket) {
      console.log("❌ Ticket not found in database")
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // If we can't get payment data from NOWPayments, return current database status
    if (!paymentData || paymentData.error) {
      console.log("⚠️ Using database status as fallback")
      return NextResponse.json({
        paymentId,
        paymentStatus: currentTicket.paymentStatus || "waiting",
        payAddress: currentTicket.payAddress,
        payAmount: currentTicket.payAmount,
        payCurrency: currentTicket.payCurrency,
        actuallyPaid: currentTicket.actuallyPaid || 0,
        expiresAt: currentTicket.reservationExpiresAt?.toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    const newStatus = paymentData.payment_status
    const currentStatus = currentTicket.paymentStatus

    console.log(`📊 Status comparison: ${currentStatus} → ${newStatus}`)

    // Update database if status changed
    if (newStatus !== currentStatus) {
      console.log(`🔄 Updating payment status: ${currentStatus} → ${newStatus}`)

      const updateData: any = {
        paymentStatus: newStatus,
        actuallyPaid: paymentData.actually_paid,
      }

      await KaspaBirthdayTicketsModel.updatePaymentStatus(paymentId, updateData)

      // If payment is now finished, confirm the sale and generate ticket
      if (newStatus === "finished" && currentStatus !== "finished") {
        console.log("🎫 Payment completed! Confirming sale and generating ticket...")

        try {
          // Confirm the sale in stock system
          await TicketStockModel.confirmSale(currentTicket.ticketType, currentTicket.quantity)

          // Generate QR code
          const qrResult = generateTicketQR({
            orderId: currentTicket.orderId,
            customerName: currentTicket.customerName,
            customerEmail: currentTicket.customerEmail,
            ticketType: currentTicket.ticketType,
            quantity: currentTicket.quantity,
            eventDate: "November 7-9, 2025",
          })

          const qrCodeDataUrl = await generateQRCodeDataURL(qrResult.qrString)

          // Update ticket with QR code
          await KaspaBirthdayTicketsModel.updatePaymentStatus(paymentId, {
            qrCode: qrCodeDataUrl,
            ticketData: qrResult.ticketInfo,
          })

          // Send ticket email
          const emailSent = await EmailService.sendTicketEmail({
            ticket: { ...currentTicket, paymentStatus: newStatus },
            qrCodeDataUrl,
          })

          if (emailSent) {
            await KaspaBirthdayTicketsModel.updatePaymentStatus(paymentId, {
              emailSent: true,
            })
            console.log("✅ Ticket email sent successfully")
          } else {
            console.log("⚠️ Failed to send ticket email")
          }
        } catch (ticketError) {
          console.error("❌ Error generating/sending ticket:", ticketError)
        }
      }

      // If payment failed/expired, release the reservation
      if ((newStatus === "failed" || newStatus === "expired") && currentStatus !== newStatus) {
        console.log("🔄 Payment failed/expired, releasing reservation...")
        await TicketStockModel.releaseReservation(currentTicket.ticketType, currentTicket.quantity)
      }
    }

    // Return updated status with payment details
    return NextResponse.json({
      paymentId: currentTicket.paymentId,
      orderId: currentTicket.orderId,
      paymentStatus: newStatus,
      payAddress: currentTicket.payAddress || paymentData.pay_address,
      payAmount: currentTicket.payAmount || paymentData.pay_amount,
      payCurrency: currentTicket.payCurrency || paymentData.pay_currency,
      actuallyPaid: paymentData.actually_paid || 0,
      expiresAt: currentTicket.reservationExpiresAt?.toISOString(),
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Payment status check error:", error)
    return NextResponse.json({ error: "Failed to check payment status" }, { status: 500 })
  }
}
