import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"
import { TicketStockModel } from "@/lib/models/TicketStock"

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    // Find the ticket order
    const ticketOrder = await KaspaBirthdayTicketsModel.findOne({ paymentId })
    if (!ticketOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Only allow cancellation if payment is still waiting
    if (ticketOrder.paymentStatus !== "waiting") {
      return NextResponse.json({ error: "Cannot cancel this payment" }, { status: 400 })
    }

    // Update order status
    ticketOrder.paymentStatus = "cancelled"
    ticketOrder.updatedAt = new Date()
    await ticketOrder.save()

    // Release the reservation
    if (ticketOrder.reservationId) {
      await TicketStockModel.releaseReservation(ticketOrder.reservationId)
      console.log("Released reservation:", ticketOrder.reservationId)
    }

    return NextResponse.json({
      success: true,
      message: "Payment cancelled successfully",
    })
  } catch (error) {
    console.error("Cancel error:", error)
    return NextResponse.json({ error: "Failed to cancel payment" }, { status: 500 })
  }
}
