import { connectToDatabase } from "./mongodb"

export interface TicketStock {
  type: string
  available: number
  total: number
  soldOut: boolean
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
    const stockData: TicketStock[] = Object.entries(TICKET_LIMITS).map(([ticketType, totalLimit]) => {
      const soldData = soldTickets.find((item) => item._id === ticketType)
      const sold = soldData ? soldData.totalSold : 0
      const available = Math.max(0, totalLimit - sold)

      return {
        type: ticketType,
        available,
        total: totalLimit,
        soldOut: available === 0,
      }
    })

    return stockData
  } catch (error) {
    console.error("Error getting ticket stock:", error)
    // Return default stock data on error
    return Object.entries(TICKET_LIMITS).map(([ticketType, totalLimit]) => ({
      type: ticketType,
      available: totalLimit,
      total: totalLimit,
      soldOut: false,
    }))
  }
}

export async function checkTicketAvailability(ticketType: string, quantity: number): Promise<boolean> {
  try {
    const stock = await getTicketStock()
    const ticketStock = stock.find((s) => s.type === ticketType)

    if (!ticketStock) {
      return false
    }

    return ticketStock.available >= quantity
  } catch (error) {
    console.error("Error checking ticket availability:", error)
    return false
  }
}

// Legacy function for backward compatibility
export async function getAllTicketStock() {
  return await getTicketStock()
}

export async function getTicketStock_old(ticketType: string) {
  const stock = await getTicketStock()
  const ticketStock = stock.find((s) => s.type === ticketType)

  if (!ticketStock) {
    const max = TICKET_LIMITS[ticketType as keyof typeof TICKET_LIMITS] || 0
    return { max, sold: 0, available: max }
  }

  return {
    max: ticketStock.total,
    sold: ticketStock.total - ticketStock.available,
    available: ticketStock.available,
  }
}
