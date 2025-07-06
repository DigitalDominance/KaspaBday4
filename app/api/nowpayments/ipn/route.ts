import { NextResponse } from "next/server"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"
import { TicketStockModel } from "@/lib/models/TicketStock"
import { TicketReservationModel } from "@/lib/models/TicketReservation"
import { sendTicketConfirmationEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-nowpayments-sig")

    // Verify the signature
    const expectedSignature = crypto
      .createHmac("sha512", process.env.NOWPAYMENTS_IPN_SECRET!)
      .update(body)
      .digest("hex")

    if (signature !== expectedSignature) {
      console.error("Invalid IPN signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const data = JSON.parse(body)
    console.log("📨 IPN received:", data)

    const { payment_id, payment_status, order_id } = data

    if (!payment_id || !payment_status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update the ticket record
    const updated = await KaspaBirthdayTicketsModel.updatePaymentStatus(payment_id, payment_status)

    if (!updated) {
      console.error("Failed to update payment status for:", payment_id)
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }

    // Handle different payment statuses
    switch (payment_status) {
      case "finished":
        // Payment completed - confirm the sale
        const ticket = await KaspaBirthdayTicketsModel.findByPaymentId(payment_id)
        if (ticket) {
          // Confirm the reservation and update stock
          await TicketReservationModel.confirmReservation(payment_id)
          await TicketStockModel.confirmSale(ticket.ticketType, ticket.quantity)

          // Send confirmation email
          try {
            await sendTicketConfirmationEmail({
              customerName: ticket.customerName,
              customerEmail: ticket.customerEmail,
              ticketType: ticket.ticketType,
              ticketName: ticket.ticketName,
              quantity: ticket.quantity,
              totalAmount: Number.parseFloat(ticket.totalAmount),
              orderId: ticket.orderId,
              paymentId: ticket.paymentId,
            })
            console.log("✅ Confirmation email sent for order:", order_id)
          } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError)
          }
        }
        break

      case "failed":
      case "expired":
        // Payment failed - release the reservation
        const failedTicket = await KaspaBirthdayTicketsModel.findByPaymentId(payment_id)
        if (failedTicket) {
          await TicketReservationModel.cancelReservation(payment_id)
          await TicketStockModel.releaseReservation(failedTicket.ticketType, failedTicket.quantity)
          console.log(`❌ Released reservation for failed payment: ${payment_id}`)
        }
        break

      case "waiting":
      case "confirming":
      case "confirmed":
      case "sending":
        // These are intermediate states - just update the status
        console.log(`🔄 Payment ${payment_id} status updated to: ${payment_status}`)
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("IPN processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
