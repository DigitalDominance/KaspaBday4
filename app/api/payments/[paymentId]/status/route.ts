import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"
import { EmailService } from "@/lib/email"
import { generateTicketQR } from "@/lib/qr-generator"

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
      const listResponse = await nowPayments.getPaymentsList({
        limit: 100,
        sortBy: "created_at",
        orderBy: "desc",
      })

      if (listResponse.data && Array.isArray(listResponse.data)) {
        paymentData = listResponse.data.find((p: any) => p.payment_id.toString() === paymentId.toString())
        if (paymentData) {
          console.log(`✅ Found payment in list: ${paymentData.payment_status}`)
        }
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

    if (!paymentData || paymentData.error) {
      console.log("❌ Payment not found in NOWPayments")
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Get current ticket from database
    const currentTicket = await KaspaBirthdayTicketsModel.findByPaymentId(paymentId)
    if (!currentTicket) {
      console.log("❌ Ticket not found in database")
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
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

      // If payment is now finished, generate and send ticket
      if (newStatus === "finished" && currentStatus !== "finished") {
        console.log("🎫 Payment completed! Generating ticket...")

        try {
          // Generate QR code
          const qrData = generateTicketQR({
            orderId: currentTicket.orderId,
            customerName: currentTicket.customerName,
            customerEmail: currentTicket.customerEmail,
            ticketType: currentTicket.ticketType,
            quantity: currentTicket.quantity,
            eventDate: "November 7-9, 2025",
          })

          // Update ticket with QR code
          await KaspaBirthdayTicketsModel.updatePaymentStatus(paymentId, {
            qrCode: qrData.qrCodeDataUrl,
            ticketData: qrData.ticketInfo,
          })

          // Send ticket email
          const emailSent = await EmailService.sendTicketEmail({
            ticket: { ...currentTicket, paymentStatus: newStatus },
            qrCodeDataUrl: qrData.qrCodeDataUrl,
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
    }

    // Return updated status
    return NextResponse.json({
      paymentId,
      paymentStatus: newStatus,
      actuallyPaid: paymentData.actually_paid,
      payAmount: paymentData.pay_amount,
      payCurrency: paymentData.pay_currency,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Payment status check error:", error)
    return NextResponse.json({ error: "Failed to check payment status" }, { status: 500 })
  }
}
