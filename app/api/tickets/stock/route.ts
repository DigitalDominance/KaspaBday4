import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { TicketStock } from "@/lib/models/TicketStock"

export async function GET() {
  try {
    await connectToDatabase()

    // Initialize stock if it doesn't exist
    const ticketTypes = [
      { ticketType: "1-day", totalAvailable: 50 },
      { ticketType: "2-day", totalAvailable: 30 },
      { ticketType: "3-day", totalAvailable: 20 },
      { ticketType: "vip", totalAvailable: 10 },
    ]

    for (const ticket of ticketTypes) {
      await TicketStock.findOneAndUpdate(
        { ticketType: ticket.ticketType },
        {
          $setOnInsert: {
            ...ticket,
            sold: 0,
            reserved: 0,
            remaining: ticket.totalAvailable,
            lastUpdated: new Date(),
          },
        },
        { upsert: true, new: true },
      )
    }

    const stock = await TicketStock.find({})

    return NextResponse.json({
      success: true,
      stock: stock.reduce(
        (acc, item) => {
          acc[item.ticketType] = {
            total: item.totalAvailable,
            sold: item.sold,
            reserved: item.reserved,
            remaining: item.remaining,
          }
          return acc
        },
        {} as Record<string, any>,
      ),
    })
  } catch (error) {
    console.error("Stock fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stock" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { ticketType, action, quantity = 1 } = await request.json()

    await connectToDatabase()

    const stock = await TicketStock.findOne({ ticketType })
    if (!stock) {
      return NextResponse.json({ success: false, error: "Ticket type not found" }, { status: 404 })
    }

    switch (action) {
      case "reserve":
        if (stock.remaining < quantity) {
          return NextResponse.json({ success: false, error: "Not enough tickets available" }, { status: 400 })
        }
        stock.reserved += quantity
        break

      case "confirm":
        stock.reserved = Math.max(0, stock.reserved - quantity)
        stock.sold += quantity
        break

      case "release":
        stock.reserved = Math.max(0, stock.reserved - quantity)
        break

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    stock.remaining = stock.totalAvailable - stock.sold - stock.reserved
    stock.lastUpdated = new Date()
    await stock.save()

    return NextResponse.json({
      success: true,
      stock: {
        total: stock.totalAvailable,
        sold: stock.sold,
        reserved: stock.reserved,
        remaining: stock.remaining,
      },
    })
  } catch (error) {
    console.error("Stock update error:", error)
    return NextResponse.json({ success: false, error: "Failed to update stock" }, { status: 500 })
  }
}
