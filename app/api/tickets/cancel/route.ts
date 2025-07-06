import { NextResponse } from "next/server"
import { TicketReservationModel } from "@/lib/models/TicketReservation"
import { TicketStockModel } from "@/lib/models/TicketStock"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json()

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
      return NextResponse.json({ error: "Reservation is no longer active" }, { status: 400 })
    }

    // Cancel the reservation
    const cancelled = await TicketReservationModel.cancelReservation(paymentId)
    if (!cancelled) {
      return NextResponse.json({ error: "Failed to cancel reservation" }, { status: 500 })
    }

    // Release the reserved tickets back to stock
    await TicketStockModel.releaseReservation(reservation.ticketType, reservation.quantity)

    // Update the ticket record status
    await KaspaBirthdayTicketsModel.updatePaymentStatus(paymentId, { paymentStatus: "cancelled" })

    console.log(`✅ Successfully cancelled reservation for payment: ${paymentId}`)

    return NextResponse.json({
      success: true,
      message: "Reservation cancelled successfully",
    })
  } catch (error) {
    console.error("Cancel reservation error:", error)
    return NextResponse.json({ error: "Failed to cancel reservation" }, { status: 500 })
  }
}
