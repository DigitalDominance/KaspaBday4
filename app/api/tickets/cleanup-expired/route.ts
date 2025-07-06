import { NextResponse } from "next/server"
import { TicketStockModel } from "@/lib/models/TicketStock"

export async function POST() {
  try {
    const cleanedCount = await TicketStockModel.cleanupExpiredReservations()

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired reservations`,
      cleanedCount,
    })
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json({ error: "Failed to cleanup expired reservations" }, { status: 500 })
  }
}
