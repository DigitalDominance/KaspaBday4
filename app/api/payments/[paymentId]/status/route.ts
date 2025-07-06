import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"

export async function GET(request: Request, { params }: { params: { paymentId: string } }) {
  try {
    const { paymentId } = params

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID required" }, { status: 400 })
    }

    console.log(`🔍 Checking payment status for: ${paymentId}`)

    const nowPayments = new NOWPaymentsAPI()

    // Try to get real-time status from NOWPayments using the payments list endpoint (more reliable)
    let paymentStatus
    try {
      paymentStatus = await nowPayments.getPaymentStatusFromList(paymentId)
    } catch (listError) {
      console.warn(`⚠️ Failed to get status from payments list, trying individual endpoint:`, listError)
      // Fallback to individual payment endpoint
      paymentStatus = await nowPayments.getPaymentStatus(paymentId)
    }

    if (paymentStatus.error) {
      console.error(`❌ NOWPayments API error:`, paymentStatus.error)
      return NextResponse.json({ error: paymentStatus.error }, { status: 400 })
    }

    console.log(`📊 NOWPayments status for ${paymentId}:`, {
      payment_status: paymentStatus.payment_status,
      actually_paid: paymentStatus.actually_paid,
      pay_amount: paymentStatus.pay_amount,
      created_at: paymentStatus.created_at,
      updated_at: paymentStatus.updated_at,
    })

    // Update our database with the latest status
    const ticket = await KaspaBirthdayTicketsModel.findByPaymentId(paymentId)
    if (ticket && ticket.paymentStatus !== paymentStatus.payment_status) {
      console.log(`🔄 Updating ticket status from ${ticket.paymentStatus} to ${paymentStatus.payment_status}`)

      await KaspaBirthdayTicketsModel.updatePaymentStatus(paymentId, {
        paymentStatus: paymentStatus.payment_status,
        actuallyPaid: paymentStatus.actually_paid,
        updatedAt: new Date(),
      })

      // If payment is finished and we haven't sent the ticket yet, trigger ticket generation
      if (paymentStatus.payment_status === "finished" && !ticket.emailSent) {
        console.log(`🎫 Payment finished, triggering ticket generation for ${paymentId}`)

        // Import email service and generate ticket
        try {
          const { EmailService } = await import("@/lib/email")
          const { generateTicketQR } = await import("@/lib/qr-generator")

          const ticketData = generateTicketQR({
            orderId: ticket.orderId,
            customerName: ticket.customerName,
            customerEmail: ticket.customerEmail,
            ticketType: ticket.ticketType,
            quantity: ticket.quantity,
            eventDate: "November 7-9, 2025",
          })

          // Update ticket with QR code
          await KaspaBirthdayTicketsModel.updatePaymentStatus(paymentId, {
            qrCode: ticketData.qrCodeDataUrl,
            ticketData: ticketData.ticketInfo,
          })

          // Get updated ticket record
          const updatedTicket = await KaspaBirthdayTicketsModel.findByPaymentId(paymentId)

          if (updatedTicket) {
            // Send ticket email
            const emailSent = await EmailService.sendTicketEmail({
              ticket: updatedTicket,
              qrCodeDataUrl: ticketData.qrCodeDataUrl,
            })

            if (emailSent) {
              await KaspaBirthdayTicketsModel.updatePaymentStatus(paymentId, {
                emailSent: true,
              })
              console.log(`✅ Ticket email sent successfully for ${paymentId}`)
            } else {
              console.error(`❌ Failed to send ticket email for ${paymentId}`)
            }
          }
        } catch (emailError) {
          console.error(`❌ Error generating/sending ticket for ${paymentId}:`, emailError)
        }
      }

      // Send payment confirmation email for confirmed status (if not sent yet)
      if (
        (paymentStatus.payment_status === "confirmed" || paymentStatus.payment_status === "partially_paid") &&
        !ticket.paymentConfirmationEmailSent
      ) {
        try {
          const { EmailService } = await import("@/lib/email")
          await EmailService.sendPaymentConfirmationEmail(ticket)
          await KaspaBirthdayTicketsModel.updatePaymentStatus(paymentId, {
            paymentConfirmationEmailSent: true,
          })
          console.log(`✅ Payment confirmation email sent for ${paymentId}`)
        } catch (emailError) {
          console.error(`❌ Failed to send payment confirmation email:`, emailError)
        }
      }
    }

    // Return the real-time status from NOWPayments
    return NextResponse.json({
      payment_id: paymentStatus.payment_id,
      payment_status: paymentStatus.payment_status,
      pay_address: paymentStatus.pay_address,
      pay_amount: paymentStatus.pay_amount,
      pay_currency: paymentStatus.pay_currency,
      price_amount: paymentStatus.price_amount,
      price_currency: paymentStatus.price_currency,
      actually_paid: paymentStatus.actually_paid,
      order_id: paymentStatus.order_id,
      order_description: paymentStatus.order_description,
      created_at: paymentStatus.created_at,
      updated_at: paymentStatus.updated_at,
      outcome_amount: paymentStatus.outcome_amount,
      outcome_currency: paymentStatus.outcome_currency,
      // Add source info for debugging
      _source: "payments_list_endpoint",
      _fetched_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Payment status check error:", error)
    return NextResponse.json(
      {
        error: "Failed to get payment status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
