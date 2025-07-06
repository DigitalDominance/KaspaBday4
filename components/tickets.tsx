"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Star, Sparkles, Crown, Zap } from "lucide-react"
import { TicketPurchaseModal } from "./ticket-purchase-modal"

interface TicketStock {
  type: string
  available: number
  reserved: number
  total: number
  sold: number
  soldOut: boolean
}

const ticketTypes = [
  {
    id: "1-day",
    name: "1-Day Pass",
    price: 75,
    originalPrice: null,
    description: "Perfect for single day attendance",
    icon: <Calendar className="w-6 h-6" />,
    color: "from-blue-500 to-blue-600",
    features: [
      "Access to one full day (Nov 7, 8, or 9)",
      "All workshops and presentations",
      "Complimentary meals and beverages",
      "5 raffle entries for daily prizes",
      "Access to vendor marketplace",
      "Networking opportunities",
      "Event swag bag",
    ],
  },
  {
    id: "2-day",
    name: "2-Day Pass",
    price: 125,
    originalPrice: 150,
    description: "Great value for extended experience",
    icon: <Clock className="w-6 h-6" />,
    color: "from-purple-500 to-purple-600",
    popular: true,
    features: [
      "Access to any 2 days",
      "All workshops and presentations",
      "Complimentary meals and beverages",
      "10 raffle entries for daily prizes",
      "Access to vendor marketplace",
      "Networking opportunities",
      "Event swag bag",
      "Priority seating",
    ],
  },
  {
    id: "3-day",
    name: "3-Day Pass",
    price: 175,
    originalPrice: 225,
    description: "Complete celebration experience",
    icon: <Star className="w-6 h-6" />,
    color: "from-green-500 to-green-600",
    features: [
      "Full access to all 3 days (Nov 7-9)",
      "All workshops and presentations",
      "Complimentary meals and beverages",
      "30 raffle entries + guaranteed prize",
      "Access to vendor marketplace",
      "Exclusive meet & greet with speakers",
      "1-on-1 networking opportunities",
      "Premium VIP swag package",
    ],
  },
  {
    id: "vip",
    name: "VIP Pass",
    price: 299,
    originalPrice: null,
    description: "Premium experience with exclusive perks",
    icon: <Crown className="w-6 h-6" />,
    color: "from-yellow-500 to-yellow-600",
    vip: true,
    features: [
      "Full access to all 3 days (Nov 7-9)",
      "All workshops and presentations",
      "Complimentary meals and beverages",
      "30 raffle entries + guaranteed prize",
      "Access to vendor marketplace",
      "Exclusive meet & greet with speakers",
      "1-on-1 networking opportunities",
      "Premium VIP swag package",
      "Exclusive VIP dinner (Nov 8)",
    ],
  },
]

export function Tickets() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [stockData, setStockData] = useState<TicketStock[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch stock data
  const fetchStockData = async () => {
    try {
      const response = await fetch("/api/tickets/stock")
      if (response.ok) {
        const data = await response.json()
        setStockData(data.stock || [])
      }
    } catch (error) {
      console.error("Failed to fetch stock data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and periodic updates
  useEffect(() => {
    fetchStockData()

    // Update stock every 30 seconds
    const interval = setInterval(fetchStockData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Get stock info for a ticket type
  const getStockInfo = (ticketId: string) => {
    const stock = stockData.find((s) => s.type === ticketId)
    return stock || { available: 0, reserved: 0, total: 0, sold: 0, soldOut: true }
  }

  // Handle successful purchase
  const handlePurchaseSuccess = () => {
    // Refresh stock data after purchase
    fetchStockData()
  }

  return (
    <section id="tickets" className="py-20 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Get Your Tickets</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join us for an unforgettable celebration of Kaspa's 4th birthday. Choose the pass that works best for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {ticketTypes.map((ticket) => {
            const stock = getStockInfo(ticket.id)
            const isLowStock = stock.available <= 5 && stock.available > 0
            const showReserved = stock.reserved > 0

            return (
              <Card
                key={ticket.id}
                className={`relative overflow-hidden bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-300 ${
                  ticket.popular ? "ring-2 ring-purple-500" : ""
                } ${ticket.vip ? "ring-2 ring-yellow-500" : ""}`}
              >
                {ticket.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-purple-600 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}

                {ticket.vip && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-600 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      VIP
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${ticket.color} flex items-center justify-center text-white`}
                  >
                    {ticket.icon}
                  </div>
                  <CardTitle className="text-2xl text-white">{ticket.name}</CardTitle>
                  <CardDescription className="text-gray-400">{ticket.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-bold text-white">${ticket.price}</span>
                      {ticket.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">${ticket.originalPrice}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">per person</p>
                  </div>

                  {/* Stock Information */}
                  <div className="space-y-2">
                    {loading ? (
                      <div className="text-center text-gray-400">Loading availability...</div>
                    ) : stock.soldOut ? (
                      <Badge variant="destructive" className="w-full justify-center">
                        Sold Out
                      </Badge>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Available:</span>
                          <span className={`font-medium ${isLowStock ? "text-yellow-400" : "text-green-400"}`}>
                            {stock.available} / {stock.total}
                          </span>
                        </div>
                        {showReserved && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Reserved:</span>
                            <span className="text-blue-400">{stock.reserved}</span>
                          </div>
                        )}
                        {isLowStock && (
                          <Badge variant="outline" className="w-full justify-center text-yellow-400 border-yellow-400">
                            <Zap className="w-3 h-3 mr-1" />
                            Only {stock.available} left!
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2 text-sm">
                    {ticket.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => setSelectedTicket(ticket.id)}
                    disabled={stock.soldOut || loading}
                    className={`w-full bg-gradient-to-r ${ticket.color} hover:opacity-90 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {stock.soldOut ? "Sold Out" : `Buy ${ticket.name}`}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Event Details */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 text-gray-300">
              <Calendar className="w-6 h-6 text-blue-400" />
              <div>
                <div className="font-semibold">November 7-9, 2025</div>
                <div className="text-sm text-gray-400">3 Days of Celebration</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-300">
              <MapPin className="w-6 h-6 text-blue-400" />
              <div>
                <div className="font-semibold">Kaspa Community Center, Liverpool, NY</div>
                <div className="text-sm text-gray-400">All tickets include meals and beverages</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-300">
              <Users className="w-6 h-6 text-blue-400" />
              <div>
                <div className="font-semibold">Daily raffle prizes for all attendees</div>
                <div className="text-sm text-gray-400">Tickets are transferable but non-refundable</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {selectedTicket && (
        <TicketPurchaseModal
          ticketType={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </section>
  )
}
