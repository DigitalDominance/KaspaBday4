"use client"

import { useState, useEffect } from "react"

interface TicketAvailability {
  available: number
  total: number
  soldOut: boolean
}

const Tickets = () => {
  const [ticketStock, setTicketStock] = useState<any[]>([])
  const [stockLoading, setStockLoading] = useState(true)

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await fetch("/api/tickets/stock")
        const data = await response.json()
        if (data.success) {
          setTicketStock(data.stock)
        }
      } catch (error) {
        console.error("Failed to fetch stock:", error)
      } finally {
        setStockLoading(false)
      }
    }

    // Initial fetch
    fetchStock()

    // Poll every 5 seconds for stock updates
    const interval = setInterval(fetchStock, 5000)

    return () => clearInterval(interval)
  }, [])

  const getTicketAvailability = (ticketType: string): TicketAvailability => {
    const stock = ticketStock.find((s) => s.type === ticketType)
    if (!stock) return { available: 0, total: 0, soldOut: true }

    return {
      available: stock.available,
      total: stock.total,
      soldOut: stock.soldOut || stock.available === 0,
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Tickets</h1>

      {stockLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Ticket Card 1 */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-2">1-Day Pass</h2>
            <p className="text-gray-700 mb-2">Enjoy a full day of access to all attractions.</p>
            {(() => {
              const availability = getTicketAvailability("1-day")
              return (
                <div className="text-sm text-muted-foreground">
                  {availability.available} of {availability.total} available
                </div>
              )
            })()}
          </div>

          {/* Ticket Card 2 */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-2">2-Day Pass</h2>
            <p className="text-gray-700 mb-2">Get two days of fun and adventure.</p>
            {(() => {
              const availability = getTicketAvailability("2-day")
              return (
                <div className="text-sm text-muted-foreground">
                  {availability.available} of {availability.total} available
                </div>
              )
            })()}
          </div>

          {/* Ticket Card 3 */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-2">VIP Pass</h2>
            <p className="text-gray-700 mb-2">Exclusive access and perks for a premium experience.</p>
            {(() => {
              const availability = getTicketAvailability("vip")
              return (
                <div className="text-sm text-muted-foreground">
                  {availability.available} of {availability.total} available
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default Tickets
