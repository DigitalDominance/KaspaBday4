import { NextResponse } from "next/server"
import { TicketStockModel } from "@/lib/models/TicketStock"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"

export async function POST() {
  try {
    // Clean up expired reservations in stock model
    const expiredCount = await TicketStockModel.cleanupExpiredReservations()

    // Also clean up expired orders
    const expiredOrders = await KaspaBirthdayTicketsModel.getExpiredOrders()

    for (const order of expiredOrders) {
      await KaspaBirthdayTicketsModel.updateOrder(order._id.toString(), {
        status: "expired",
        paymentStatus: "expired",
        updatedAt: new Date(),
      })
    }

    console.log(`🧹 Cleaned up ${expiredCount} expired reservations and ${expiredOrders.length} expired orders`)

    return NextResponse.json({
      success: true,
      expiredReservations: expiredCount,
      expiredOrders: expiredOrders.length,
    })
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 })
  }
}
