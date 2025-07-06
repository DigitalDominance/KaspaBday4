import { NextResponse } from "next/server"
import { TicketStockModel } from "@/lib/models/TicketStock"

export async function GET() {
  try {
    // Initialize stock if it doesn't exist
    await TicketStockModel.initializeStock()

    // Get current stock info (this will also clean up expired reservations)
    const stockInfo = await TicketStockModel.getStockInfo()

    return NextResponse.json({
      success: true,
      stock: stockInfo,
    })
  } catch (error) {
    console.error("Stock API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch stock information",
      },
      { status: 500 },
    )
  }
}

// Also handle POST for manual cleanup
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
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cleanup expired reservations",
      },
      { status: 500 },
    )
  }
}
