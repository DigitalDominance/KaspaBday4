import { NextResponse } from "next/server"
import { TicketStockModel } from "@/lib/models/TicketStock"

export async function GET() {
  try {
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
