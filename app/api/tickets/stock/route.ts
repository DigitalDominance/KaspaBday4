import { NextResponse } from "next/server"
import { TicketStockModel } from "@/lib/models/TicketStock"

export async function GET() {
  try {
    // Initialize stock if not exists
    await TicketStockModel.initializeStock()

    // Get current stock info
    const stockInfo = await TicketStockModel.getStockInfo()

    return NextResponse.json(stockInfo)
  } catch (error) {
    console.error("Error fetching ticket stock:", error)
    return NextResponse.json({ error: "Failed to fetch ticket stock" }, { status: 500 })
  }
}
