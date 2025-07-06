import clientPromise from "@/lib/mongodb"

const TICKET_LIMITS = {
  "1-day": 50,
  "2-day": 30,
  "3-day": 20,
  vip: 10,
}

export async function getTicketStock() {
  try {
    const client = await clientPromise
    const db = client.db("kaspa_birthday")
    const ticketsCollection = db.collection("kaspa_birthday_tickets")

    const results = []

    for (const [ticketType, totalLimit] of Object.entries(TICKET_LIMITS)) {
      // Count sold tickets (only finished payments)
      const soldCount = await ticketsCollection.countDocuments({
        ticketType,
        paymentStatus: "finished",
      })

      const available = Math.max(0, totalLimit - soldCount)
      const soldOut = available === 0

      results.push({
        type: ticketType,
        total: totalLimit,
        sold: soldCount,
        available,
        soldOut,
      })
    }

    return results
  } catch (error) {
    console.error("Error fetching ticket stock:", error)
    // Return default stock if error
    return Object.entries(TICKET_LIMITS).map(([type, total]) => ({
      type,
      total,
      sold: 0,
      available: total,
      soldOut: false,
    }))
  }
}

export async function isTicketAvailable(ticketType: string, quantity = 1): Promise<boolean> {
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

export async function reserveTickets(ticketType: string, quantity: number): Promise<boolean> {
  // This function would be used for temporary reservations during checkout
  // For now, we'll just check availability
  return await isTicketAvailable(ticketType, quantity)
}
