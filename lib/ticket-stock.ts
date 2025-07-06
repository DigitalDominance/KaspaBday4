import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"

const TICKET_LIMITS = {
  "1-day": 50,
  "2-day": 30,
  "3-day": 20,
  vip: 10,
}

export async function getTicketStock(ticketType: string) {
  const stats = await KaspaBirthdayTicketsModel.getTicketStats()
  const ticketStat = stats.find((stat) => stat._id === ticketType)
  const sold = ticketStat?.paidTickets || 0
  const max = TICKET_LIMITS[ticketType as keyof typeof TICKET_LIMITS] || 0

  return { max, sold, available: max - sold }
}

export async function isTicketAvailable(ticketType: string, quantity = 1) {
  const stock = await getTicketStock(ticketType)
  return stock.sold + quantity <= stock.max
}

export async function getAllTicketStock() {
  const stats = await KaspaBirthdayTicketsModel.getTicketStats()

  return Object.entries(TICKET_LIMITS).map(([type, max]) => {
    const stat = stats.find((s) => s._id === type)
    const sold = stat?.paidTickets || 0
    return {
      type,
      available: max - sold,
      total: max,
      soldOut: sold >= max,
    }
  })
}
