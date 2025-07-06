import { NextResponse } from "next/server"
import { TicketStockModel } from "@/lib/models/TicketStock"

export async function GET() {
  try {
    // Clean up expired reservations first to get accurate counts
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

// Initialize stock if needed
export async function POST() {
  try {
    await TicketStockModel.initializeStock()

    return NextResponse.json({
      success: true,
      message: "Stock initialized successfully",
    })
  } catch (error) {
    console.error("Stock initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize stock" }, { status: 500 })
  }
}
