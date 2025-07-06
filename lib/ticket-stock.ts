import { connectToDatabase } from "@/lib/mongodb"

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

    // Get all finished payments (completed tickets)
    const soldTickets = await db.collection("kaspa_birthday_tickets").find({ paymentStatus: "finished" }).toArray()

    // Count sold tickets by type
    const soldCounts: Record<string, number> = {}

    soldTickets.forEach((ticket) => {
      const ticketType = ticket.ticketName || ticket.ticketType
      if (ticketType) {
        soldCounts[ticketType] = (soldCounts[ticketType] || 0) + (ticket.quantity || 1)
      }
    })

    // Create stock array
    const stockData: TicketStock[] = Object.entries(TICKET_LIMITS).map(([ticketType, totalAvailable]) => {
      const sold = soldCounts[ticketType] || 0
      const remaining = Math.max(0, totalAvailable - sold)

      return {
        ticketType,
        totalAvailable,
        sold,
        remaining,
      }
    })

    return stockData
  } catch (error) {
    console.error("Error fetching ticket stock:", error)
    // Return default stock data on error
    return Object.entries(TICKET_LIMITS).map(([ticketType, totalAvailable]) => ({
      ticketType,
      totalAvailable,
      sold: 0,
      remaining: totalAvailable,
    }))
  }
}

export async function isTicketAvailable(ticketType: string, quantity = 1): Promise<boolean> {
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

export async function reserveTickets(ticketType: string, quantity: number): Promise<boolean> {
  try {
    const available = await isTicketAvailable(ticketType, quantity)
    if (!available) {
      return false
    }

    // In a real system, you'd implement proper reservation logic here
    // For now, we'll just check availability at purchase time
    return true
  } catch (error) {
    console.error("Error reserving tickets:", error)
    return false
  }
}
