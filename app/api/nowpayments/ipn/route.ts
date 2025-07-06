import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"
import { generateTicketQR } from "@/lib/qr-generator"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"
import { EmailService } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-nowpayments-sig")
    const body = await request.json()

    if (!signature) {
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    const nowPayments = new NOWPaymentsAPI()

    // Verify IPN signature
    if (!nowPayments.verifyIPN(signature, body)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Process payment status update
    const { payment_id, payment_status, order_id, actually_paid, actually_paid_at_fiat, pay_currency } = body

    console.log(`Payment ${payment_id} status: ${payment_status}`)

    // Find the ticket record
    const ticket = await KaspaBirthdayTicketsModel.findByPaymentId(payment_id)
    if (!ticket) {
      console.error(`Ticket not found for payment ID: ${payment_id}`)
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Update payment status
    const updateData: any = {
      paymentStatus: payment_status,
      actuallyPaid: actually_paid,
    }

    // Send payment confirmation email for partially_paid or confirmed status
    if (payment_status === "partially_paid" || payment_status === "confirmed") {
      try {
        await EmailService.sendPaymentConfirmationEmail(ticket)
        console.log(`Payment confirmation email sent for order: ${ticket.orderId}`)
      } catch (error) {
        console.error("Failed to send payment confirmation email:", error)
      }
    }

    // If payment is finished, generate ticket QR code and send ticket email
    if (payment_status === "finished") {
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

      // Update the ticket record first
      await KaspaBirthdayTicketsModel.updatePaymentStatus(payment_id, updateData)

      // Get the updated ticket record
      const updatedTicket = await KaspaBirthdayTicketsModel.findByPaymentId(payment_id)

      if (updatedTicket) {
        try {
          // Send the ticket email with QR code
          const emailSent = await EmailService.sendTicketEmail({
            ticket: updatedTicket,
            qrCodeDataUrl: ticketData.qrCodeDataUrl,
          })

          if (emailSent) {
            // Mark email as sent
            await KaspaBirthdayTicketsModel.updatePaymentStatus(payment_id, { emailSent: true })
            console.log(`Ticket email sent successfully for order: ${ticket.orderId}`)
          } else {
            console.error(`Failed to send ticket email for order: ${ticket.orderId}`)
          }
        } catch (error) {
          console.error("Failed to send ticket email:", error)
        }
      }

      console.log(`Ticket generated for order: ${ticket.orderId}`)
    } else {
      // Update the ticket record for non-finished payments
      await KaspaBirthdayTicketsModel.updatePaymentStatus(payment_id, updateData)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("IPN error:", error)
    return NextResponse.json({ error: "IPN processing failed" }, { status: 500 })
  }
}
