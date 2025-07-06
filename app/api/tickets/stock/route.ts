import { NextResponse } from "next/server"
import { TicketStockModel } from "@/lib/models/TicketStock"

export async function GET() {
  try {
    // Initialize stock if it doesn't exist
    await TicketStockModel.initializeStock()

    // Clean up expired reservations first
    await TicketStockModel.cleanupExpiredReservations()

    // Get current stock info
    const stockInfo = await TicketStockModel.getStockInfo()

    return NextResponse.json({
      success: true,
      stock: stockInfo,
    })
  } catch (error) {
    console.error("Stock fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch stock information" }, { status: 500 })
  }
}
