import { NextResponse } from "next/server"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"
import { TicketStockModel } from "@/lib/models/TicketStock"

export async function POST(request: Request) {
  try {
    // Find all expired reservations that are still waiting
    const expiredTickets = await KaspaBirthdayTicketsModel.findExpiredReservations()

    let releasedCount = 0

    for (const ticket of expiredTickets) {
      try {
        // Release the reservation
        await TicketStockModel.releaseReservation(ticket.ticketType, ticket.quantity)

        // Update ticket status to expired
        await KaspaBirthdayTicketsModel.updatePaymentStatus(ticket.paymentId, {
          paymentStatus: "expired",
          notes: "Reservation expired after 30 minutes",
        })

        releasedCount++
      } catch (error) {
        console.error(`Failed to release reservation for ticket ${ticket.orderId}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Released ${releasedCount} expired reservations`,
      releasedCount,
    })
  } catch (error) {
    console.error("Cleanup expired reservations error:", error)
    return NextResponse.json({ error: "Failed to cleanup expired reservations" }, { status: 500 })
  }
}
