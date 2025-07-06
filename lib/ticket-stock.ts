// In-memory stock management (in production, use a database)
const TICKET_STOCK = {
  "1-day": { max: 50, sold: 0 },
  "2-day": { max: 30, sold: 0 },
  "3-day": { max: 20, sold: 0 },
  vip: { max: 10, sold: 0 },
}

export function getTicketStock(ticketType: string) {
  return TICKET_STOCK[ticketType as keyof typeof TICKET_STOCK] || { max: 0, sold: 0 }
}

export function isTicketAvailable(ticketType: string, quantity = 1) {
  const stock = getTicketStock(ticketType)
  return stock.sold + quantity <= stock.max
}

export function reserveTickets(ticketType: string, quantity: number) {
  const stock = TICKET_STOCK[ticketType as keyof typeof TICKET_STOCK]
  if (stock && isTicketAvailable(ticketType, quantity)) {
    stock.sold += quantity
    return true
  }
  return false
}

export function releaseTickets(ticketType: string, quantity: number) {
  const stock = TICKET_STOCK[ticketType as keyof typeof TICKET_STOCK]
  if (stock) {
    stock.sold = Math.max(0, stock.sold - quantity)
  }
}

export function getAllTicketStock() {
  return Object.entries(TICKET_STOCK).map(([type, stock]) => ({
    type,
    available: stock.max - stock.sold,
    total: stock.max,
    soldOut: stock.sold >= stock.max,
  }))
}
