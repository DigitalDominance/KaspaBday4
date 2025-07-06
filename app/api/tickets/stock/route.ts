import { NextResponse } from "next/server"
import { getAllTicketStock } from "@/lib/ticket-stock"

export async function GET() {
  try {
    const stock = getAllTicketStock()
    return NextResponse.json(stock)
  } catch (error) {
    console.error("Ticket stock error:", error)
    return NextResponse.json({ error: "Failed to get ticket stock" }, { status: 500 })
  }
}
