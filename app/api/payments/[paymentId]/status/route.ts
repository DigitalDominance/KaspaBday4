import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { NOWPaymentsAPI } from "@/lib/nowpayments"
import { EmailService } from "@/lib/email"
import { generateQRCodeDataURL } from "@/lib/qr-generator"

export async function GET(request: NextRequest, { params }: { params: { paymentId: string } }) {
  try {
    const paymentId = params.paymentId

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get payment status from NOWPayments using list endpoint (more reliable)
    let paymentData = null

    try {
      // Try list endpoint first (more reliable)
      const listResponse = await NOWPaymentsAPI.getPaymentsList({
        limit: 100,
        sortBy: "created_at",
        orderBy: "desc",
      })

      if (listResponse.success && listResponse.data) {
        paymentData = listResponse.data.find((payment: any) => payment.payment_id.toString() === paymentId)
      }

      // Fallback to individual payment endpoint
      if (!paymentData) {
        const individualResponse = await NOWPaymentsAPI.getPaymentStatus(paymentId)
        if (individualResponse.success) {
          paymentData = individualResponse.data
        }
      }
    } catch (error) {
      console.error("Error fetching payment status from NOWPayments:", error)
    }

    // Find ticket in database
    const ticket = await db.collection("kaspa_birthday_tickets").findOne({
      paymentId: paymentId,
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Update ticket status if payment data is available
    if (paymentData && paymentData.payment_status !== ticket.paymentStatus) {
      console.log(`Updating payment status from ${ticket.paymentStatus} to ${paymentData.payment_status}`)

      await db.collection("kaspa_birthday_tickets").updateOne(
        { paymentId: paymentId },
        {
          $set: {
            paymentStatus: paymentData.payment_status,
            actuallyPaid: paymentData.actually_paid,
            payinHash: paymentData.payin_hash,
            updatedAt: new Date(),
          },
        },
      )

      // If payment is finished and no QR code exists, generate ticket
      if (paymentData.payment_status === "finished" && !ticket.qrCode) {
        console.log("Payment finished, generating ticket and sending email...")

        // Generate QR code
        const qrData = JSON.stringify({
          orderId: ticket.orderId,
          customerName: ticket.customerName,
          ticketType: ticket.ticketName,
          quantity: ticket.quantity,
          event: "Kaspa 4th Birthday Celebration",
          date: "November 7-9, 2025",
          venue: "Kaspa Community Center, Liverpool, NY",
          verified: true,
          timestamp: Date.now(),
        })

        const qrCodeDataUrl = await generateQRCodeDataURL(qrData)

        // Update ticket with QR code
        await db.collection("kaspa_birthday_tickets").updateOne(
          { paymentId: paymentId },
          {
            $set: {
              qrCode: qrCodeDataUrl,
              ticketGenerated: true,
              ticketGeneratedAt: new Date(),
            },
          },
        )

        // Send ticket email
        const emailSent = await EmailService.sendTicketEmail({
          ticket: { ...ticket, qrCode: qrCodeDataUrl },
          qrCodeDataUrl,
        })

        if (emailSent) {
          console.log("✅ Ticket email sent successfully")
          await db.collection("kaspa_birthday_tickets").updateOne(
            { paymentId: paymentId },
            {
              $set: {
                emailSent: true,
                emailSentAt: new Date(),
              },
            },
          )
        }

        // Update ticket object for response
        ticket.qrCode = qrCodeDataUrl
        ticket.ticketGenerated = true
        ticket.emailSent = emailSent
      }

      // Update ticket object for response
      ticket.paymentStatus = paymentData.payment_status
      ticket.actuallyPaid = paymentData.actually_paid
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentId: ticket.paymentId,
        orderId: ticket.orderId,
        paymentStatus: ticket.paymentStatus,
        customerName: ticket.customerName,
        customerEmail: ticket.customerEmail,
        ticketName: ticket.ticketName,
        quantity: ticket.quantity,
        totalAmount: ticket.totalAmount,
        payCurrency: ticket.payCurrency,
        qrCode: ticket.qrCode,
        ticketGenerated: ticket.ticketGenerated || false,
        emailSent: ticket.emailSent || false,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      },
    })
  } catch (error) {
    console.error("Error fetching payment status:", error)
    return NextResponse.json({ error: "Failed to fetch payment status" }, { status: 500 })
  }
}
