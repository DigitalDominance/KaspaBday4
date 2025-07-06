import { NextResponse } from "next/server"
import { getTicketStock } from "@/lib/ticket-stock"

export async function GET() {
  try {
    const stock = await getTicketStock()

    return NextResponse.json(stock, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error fetching ticket stock:", error)

    return NextResponse.json({ error: "Failed to fetch ticket stock" }, { status: 500 })
  }
}
