import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"
import { generateTicketQR } from "@/lib/qr-generator"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"
import { TicketStockModel } from "@/lib/models/TicketStock"
import { TicketReservationModel } from "@/lib/models/TicketReservation"
import { EmailService } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-nowpayments-sig")
    const body = await request.json()

    console.log(`🔔 IPN received:`, {
      signature: signature ? "present" : "missing",
      payment_id: body.payment_id,
      payment_status: body.payment_status,
      order_id: body.order_id,
      actually_paid: body.actually_paid,
    })

    if (!signature) {
      console.error("❌ No signature provided in IPN")
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    const nowPayments = new NOWPaymentsAPI()

    // Verify IPN signature
    if (!nowPayments.verifyIPN(signature, body)) {
      console.error("❌ Invalid IPN signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log("✅ IPN signature verified")

    // Process payment status update
    const {
      payment_id,
      payment_status,
      order_id,
      actually_paid,
      actually_paid_at_fiat,
      pay_currency,
      outcome_amount,
      outcome_currency,
    } = body

    console.log(`🔄 Processing IPN for payment ${payment_id} with status: ${payment_status}`)

    // Find the ticket record
    const ticket = await KaspaBirthdayTicketsModel.findByPaymentId(payment_id)
    if (!ticket) {
      console.error(`❌ Ticket not found for payment ID: ${payment_id}`)
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    console.log(`📋 Found ticket: ${ticket.orderId} for customer: ${ticket.customerName}`)

    // Update payment status
    const updateData: any = {
      paymentStatus: payment_status,
      actuallyPaid: actually_paid,
      updatedAt: new Date(),
    }

    // Send payment confirmation email for partially_paid or confirmed status
    if (
      (payment_status === "partially_paid" || payment_status === "confirmed") &&
      !ticket.paymentConfirmationEmailSent
    ) {
      try {
        console.log(`📧 Sending payment confirmation email for order: ${ticket.orderId}`)
        await EmailService.sendPaymentConfirmationEmail(ticket)
        updateData.paymentConfirmationEmailSent = true
        console.log(`✅ Payment confirmation email sent for order: ${ticket.orderId}`)
      } catch (error) {
        console.error("❌ Failed to send payment confirmation email:", error)
      }
    }

    // If payment is finished, generate ticket and send email
    if (payment_status === "finished" && !ticket.emailSent) {
      console.log(`🎫 Payment finished, generating ticket for order: ${ticket.orderId}`)

      try {
        const ticketData = generateTicketQR({
          orderId: ticket.orderId,
          customerName: ticket.customerName,
          customerEmail: ticket.customerEmail,
          ticketType: ticket.ticketType,
          quantity: ticket.quantity,
          eventDate: "November 7-9, 2025",
        })

        updateData.qrCode = ticketData.qrCodeDataUrl
        updateData.ticketData = ticketData.ticketInfo
        updateData.paidAt = new Date()

        // Confirm the reservation and update stock
        await TicketReservationModel.confirmReservation(payment_id)
        await TicketStockModel.confirmSale(ticket.ticketType, ticket.quantity)

        // Update the ticket record first
        await KaspaBirthdayTicketsModel.updatePaymentStatus(payment_id, updateData)
        console.log(`✅ Ticket record updated for payment: ${payment_id}`)

        // Get the updated ticket record
        const updatedTicket = await KaspaBirthdayTicketsModel.findByPaymentId(payment_id)

        if (updatedTicket) {
          try {
            // Send the ticket email
            console.log(`📧 Sending ticket email to: ${updatedTicket.customerEmail}`)
            const emailSent = await EmailService.sendTicketEmail({
              ticket: updatedTicket,
            })

            if (emailSent) {
              // Mark email as sent
              await KaspaBirthdayTicketsModel.updatePaymentStatus(payment_id, { emailSent: true })
              console.log(`✅ Ticket email sent successfully for order: ${ticket.orderId}`)
            } else {
              console.error(`❌ Failed to send ticket email for order: ${ticket.orderId}`)
            }
          } catch (error) {
            console.error("❌ Failed to send ticket email:", error)
          }
        }

        console.log(`✅ Ticket generated and processed for order: ${ticket.orderId}`)
      } catch (error) {
        console.error("❌ Error generating ticket:", error)
        // Still update the payment status even if ticket generation fails
        await KaspaBirthdayTicketsModel.updatePaymentStatus(payment_id, updateData)
      }
    } else if (payment_status === "failed" || payment_status === "expired") {
      // Payment failed - release the reservation
      console.log(`❌ Payment ${payment_status}, releasing reservation for payment: ${payment_id}`)
      await TicketReservationModel.cancelReservation(payment_id)
      await TicketStockModel.releaseReservation(ticket.ticketType, ticket.quantity)
    } else {
      // Update the ticket record for non-finished payments
      await KaspaBirthdayTicketsModel.updatePaymentStatus(payment_id, updateData)
      console.log(`✅ Payment status updated to: ${payment_status} for order: ${ticket.orderId}`)
    }

    return NextResponse.json({
      success: true,
      message: "IPN processed successfully",
      payment_id,
      payment_status,
    })
  } catch (error) {
    console.error("❌ IPN processing error:", error)
    return NextResponse.json(
      {
        error: "IPN processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
