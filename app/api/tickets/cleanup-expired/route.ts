import { NextResponse } from "next/server"
import { TicketStockModel } from "@/lib/models/TicketStock"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"

export async function POST() {
  try {
    console.log("🧹 Starting cleanup of expired reservations...")

    // Clean up expired reservations in stock model
    const expiredCount = await TicketStockModel.cleanupExpiredReservations()

    // Also update expired orders in the tickets collection
    const expiredOrders = await KaspaBirthdayTicketsModel.findExpiredOrders()

    for (const order of expiredOrders) {
      await KaspaBirthdayTicketsModel.updateByOrderId(order.orderId, {
        paymentStatus: "expired",
        updatedAt: new Date(),
      })
    }

    console.log(`✅ Cleaned up ${expiredCount} expired reservations and ${expiredOrders.length} expired orders`)

    return NextResponse.json({
      success: true,
      expiredReservations: expiredCount,
      expiredOrders: expiredOrders.length,
    })
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json(
      {
        error: "Failed to cleanup expired reservations",
      },
      { status: 500 },
    )
  }
}
