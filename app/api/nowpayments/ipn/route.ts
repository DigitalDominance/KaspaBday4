import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"
import { TicketStockModel } from "@/lib/models/TicketStock"
import { sendTicketEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-nowpayments-sig")

    // Verify IPN signature
    if (!signature || !process.env.NOWPAYMENTS_IPN_SECRET) {
      console.error("Missing signature or IPN secret")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const expectedSignature = crypto.createHmac("sha512", process.env.NOWPAYMENTS_IPN_SECRET).update(body).digest("hex")

    if (signature !== expectedSignature) {
      console.error("Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const data = JSON.parse(body)
    console.log("IPN received:", data)

    const { payment_id, payment_status, order_id } = data

    if (!payment_id) {
      return NextResponse.json({ error: "Missing payment_id" }, { status: 400 })
    }

    // Find the ticket record
    const ticket = await KaspaBirthdayTicketsModel.findByPaymentId(payment_id)
    if (!ticket) {
      console.error("Ticket not found for payment:", payment_id)
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Update payment status
    await KaspaBirthdayTicketsModel.updatePaymentStatus(payment_id, {
      paymentStatus: payment_status,
      notes: `IPN update: ${payment_status}`,
    })

    // Handle different payment statuses
    switch (payment_status) {
      case "finished":
        // Confirm the sale in stock system
        await TicketStockModel.confirmSale(ticket.ticketType, ticket.quantity, ticket.orderId)

        // Send ticket email
        try {
          await sendTicketEmail({
            customerName: ticket.customerName,
            customerEmail: ticket.customerEmail,
            ticketType: ticket.ticketType,
            ticketName: ticket.ticketName,
            quantity: ticket.quantity,
            orderId: ticket.orderId,
            paymentId: payment_id,
          })
          console.log(`✅ Ticket email sent for order ${ticket.orderId}`)
        } catch (emailError) {
          console.error("Failed to send ticket email:", emailError)
        }
        break

      case "failed":
      case "cancelled":
      case "expired":
        // Release the reservation
        await TicketStockModel.releaseReservation(ticket.ticketType, ticket.quantity, ticket.orderId)
        console.log(`🔄 Released reservation for failed/cancelled payment: ${payment_id}`)
        break

      case "waiting":
      case "confirming":
      case "confirmed":
      case "sending":
      case "partially_paid":
        // These are intermediate states, no action needed
        console.log(`Payment ${payment_id} status updated to: ${payment_status}`)
        break

      default:
        console.log(`Unknown payment status: ${payment_status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("IPN processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
