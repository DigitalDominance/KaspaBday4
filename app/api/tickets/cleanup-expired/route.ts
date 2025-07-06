import { NextResponse } from "next/server"
import { TicketStockModel } from "@/lib/models/TicketStock"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"

export async function POST() {
  try {
    console.log("🧹 Starting cleanup of expired reservations...")

    // Clean up expired reservations in the stock model
    const expiredCount = await TicketStockModel.cleanupExpiredReservations()

    // Also find and update any expired tickets in the main collection
    const expiredTickets = await KaspaBirthdayTicketsModel.findExpiredReservations()

    // Update their status
    for (const ticket of expiredTickets) {
      await KaspaBirthdayTicketsModel.updatePaymentStatus(ticket.paymentId, {
        paymentStatus: "expired",
        notes: "Expired due to timeout",
      })
    }

    console.log(`✅ Cleanup complete: ${expiredCount} reservations, ${expiredTickets.length} tickets expired`)

    return NextResponse.json({
      success: true,
      expiredReservations: expiredCount,
      expiredTickets: expiredTickets.length,
    })
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json({ error: "Failed to cleanup expired items" }, { status: 500 })
  }
}
