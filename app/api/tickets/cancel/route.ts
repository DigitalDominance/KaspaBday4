import { NextResponse } from "next/server"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"
import { TicketStockModel } from "@/lib/models/TicketStock"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { paymentId, orderId } = body

    if (!paymentId && !orderId) {
      return NextResponse.json({ error: "Payment ID or Order ID required" }, { status: 400 })
    }

    // Find the ticket record
    const ticket = paymentId
      ? await KaspaBirthdayTicketsModel.findByPaymentId(paymentId)
      : await KaspaBirthdayTicketsModel.findByOrderId(orderId)

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Only allow cancellation if payment is still waiting
    if (ticket.paymentStatus !== "waiting") {
      return NextResponse.json(
        {
          error: "Cannot cancel payment that is not in waiting status",
        },
        { status: 400 },
      )
    }

    // Release the reservation
    await TicketStockModel.releaseReservation(ticket.ticketType, ticket.quantity)

    // Update ticket status to cancelled
    await KaspaBirthdayTicketsModel.updatePaymentStatus(ticket.paymentId, {
      paymentStatus: "cancelled",
      notes: "Cancelled by user",
    })

    return NextResponse.json({
      success: true,
      message: "Payment cancelled and reservation released",
    })
  } catch (error) {
    console.error("Cancel payment error:", error)
    return NextResponse.json({ error: "Failed to cancel payment" }, { status: 500 })
  }
}
