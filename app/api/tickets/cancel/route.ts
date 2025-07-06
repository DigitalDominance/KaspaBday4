import { NextResponse } from "next/server"
import { TicketStockModel } from "@/lib/models/TicketStock"
import { TicketReservationModel } from "@/lib/models/TicketReservation"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    // Get the reservation
    const reservation = await TicketReservationModel.getByPaymentId(paymentId)
    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    // Check if reservation is still active
    if (reservation.status !== "active") {
      return NextResponse.json({ error: "Reservation is not active" }, { status: 400 })
    }

    // Cancel the reservation
    const cancelled = await TicketReservationModel.cancelReservation(paymentId)
    if (!cancelled) {
      return NextResponse.json({ error: "Failed to cancel reservation" }, { status: 500 })
    }

    // Release the reserved tickets
    await TicketStockModel.releaseReservation(reservation.ticketType, reservation.quantity)

    // Update the ticket record status
    await KaspaBirthdayTicketsModel.updatePaymentStatus(paymentId, "cancelled")

    console.log(`❌ Cancelled reservation for payment ${paymentId}`)

    return NextResponse.json({
      success: true,
      message: "Reservation cancelled successfully",
    })
  } catch (error) {
    console.error("Cancel reservation error:", error)
    return NextResponse.json({ error: "Failed to cancel reservation" }, { status: 500 })
  }
}
