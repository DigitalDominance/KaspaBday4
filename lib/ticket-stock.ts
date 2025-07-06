import { connectToDatabase } from "./mongodb"

export interface TicketStock {
  ticketType: string
  totalAvailable: number
  sold: number
  remaining: number
}

const TICKET_LIMITS = {
  "1-day": 50,
  "2-day": 30,
  "3-day": 20,
  vip: 10,
}

export async function getTicketStock(): Promise<TicketStock[]> {
  try {
    const { db } = await connectToDatabase()

    // Get all finished payments grouped by ticket type
    const soldTickets = await db
      .collection("kaspa_birthday_tickets")
      .aggregate([
        {
          $match: {
            paymentStatus: "finished",
          },
        },
        {
          $group: {
            _id: "$ticketType",
            totalSold: { $sum: "$quantity" },
          },
        },
      ])
      .toArray()

    // Create stock array for all ticket types
    const stockData: TicketStock[] = Object.entries(TICKET_LIMITS).map(([ticketType, totalAvailable]) => {
      const soldData = soldTickets.find((item) => item._id === ticketType)
      const sold = soldData ? soldData.totalSold : 0

      return {
        ticketType,
        totalAvailable,
        sold,
        remaining: Math.max(0, totalAvailable - sold),
      }
    })

    return stockData
  } catch (error) {
    console.error("Error getting ticket stock:", error)
    // Return default stock data on error
    return Object.entries(TICKET_LIMITS).map(([ticketType, totalAvailable]) => ({
      ticketType,
      totalAvailable,
      sold: 0,
      remaining: totalAvailable,
    }))
  }
}

export async function checkTicketAvailability(ticketType: string, quantity: number): Promise<boolean> {
  try {
    const stock = await getTicketStock()
    const ticketStock = stock.find((s) => s.ticketType === ticketType)

    if (!ticketStock) {
      return false
    }

    return ticketStock.remaining >= quantity
  } catch (error) {
    console.error("Error checking ticket availability:", error)
    return false
  }
}
