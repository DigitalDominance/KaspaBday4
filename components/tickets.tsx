"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Crown, Calendar, Users, MapPin, Clock, Ticket } from "lucide-react"
import { Space_Grotesk } from "next/font/google"
import { cn } from "@/lib/utils"
import { TicketPurchaseModal } from "./ticket-purchase-modal"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })

interface StockInfo {
  type: string
  available: number
  reserved: number
  total: number
  sold: number
  soldOut: boolean
}

interface TicketType {
  id: string
  name: string
  price: number
  originalPrice?: number
  description: string
  features: string[]
  icon: React.ReactNode
  gradient: string
  borderColor: string
  popular?: boolean
}

const ticketTypes: TicketType[] = [
  {
    id: "1-day",
    name: "1-Day Pass",
    price: 75,
    description: "Perfect for a single day experience",
    features: [
      "Access to one full day (Nov 7-9)",
      "All workshops and presentations",
      "Complimentary meals and beverages",
      "Networking opportunities",
      "5 raffle entries for daily prizes",
      "Access to vendor marketplace",
    ],
    icon: <Calendar className="h-6 w-6" />,
    gradient: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-500/20",
  },
  {
    id: "2-day",
    name: "2-Day Pass",
    price: 125,
    originalPrice: 150,
    description: "Great value for two days",
    features: [
      "Access to any 2 days (Nov 7-9)",
      "All workshops and presentations",
      "Complimentary meals and beverages",
      "Networking opportunities",
      "10 raffle entries + guaranteed prize",
      "Access to vendor marketplace",
      "Exclusive meet & greet with speakers",
    ],
    icon: <Users className="h-6 w-6" />,
    gradient: "from-green-500 to-emerald-500",
    borderColor: "border-green-500/20",
    popular: true,
  },
  {
    id: "3-day",
    name: "3-Day Pass",
    price: 175,
    originalPrice: 225,
    description: "Full access to all three days",
    features: [
      "Full access to all 3 days (Nov 7-9)",
      "All workshops and presentations",
      "Complimentary meals and beverages",
      "Networking opportunities",
      "15 raffle entries + guaranteed prize",
      "Access to vendor marketplace",
      "Exclusive meet & greet with speakers",
      "Premium networking opportunities",
      "Exclusive VIP swag package",
    ],
    icon: <Star className="h-6 w-6" />,
    gradient: "from-purple-500 to-pink-500",
    borderColor: "border-purple-500/20",
  },
  {
    id: "vip",
    name: "VIP Pass",
    price: 299,
    description: "Premium experience with exclusive perks",
    features: [
      "Full access to all 3 days (Nov 7-9)",
      "All workshops and presentations",
      "Complimentary meals and beverages",
      "30 raffle entries + guaranteed prize",
      "Access to vendor marketplace",
      "Exclusive meet & greet with speakers",
      "Premium networking opportunities",
      "Premium VIP swag package",
      "Exclusive VIP dinner (Nov 8)",
      "Priority seating",
    ],
    icon: <Crown className="h-6 w-6" />,
    gradient: "from-amber-500 to-orange-500",
    borderColor: "border-amber-500/20",
  },
]

export function Tickets() {
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stockInfo, setStockInfo] = useState<StockInfo[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch stock information
  const fetchStock = async () => {
    try {
      const response = await fetch("/api/tickets/stock")
      const data = await response.json()
      if (data.success) {
        setStockInfo(data.stock)
      }
    } catch (error) {
      console.error("Failed to fetch stock:", error)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and periodic updates
  useEffect(() => {
    fetchStock()

    // Update stock every 30 seconds
    const interval = setInterval(fetchStock, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStockForTicket = (ticketId: string) => {
    return stockInfo.find((stock) => stock.type === ticketId)
  }

  const handlePurchaseClick = (ticket: TicketType) => {
    const stock = getStockForTicket(ticket.id)
    if (stock?.soldOut) return

    setSelectedTicket(ticket)
    setIsModalOpen(true)
  }

  const getStockBadge = (ticket: TicketType) => {
    const stock = getStockForTicket(ticket.id)
    if (!stock) return null

    if (stock.soldOut) {
      return <Badge variant="destructive">Sold Out</Badge>
    }

    if (stock.available <= 5) {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          Only {stock.available} Left!
        </Badge>
      )
    }

    return <Badge variant="secondary">{stock.available} Available</Badge>
  }

  const getStockText = (ticket: TicketType) => {
    const stock = getStockForTicket(ticket.id)
    if (!stock) return ""

    if (stock.reserved > 0) {
      return `${stock.available} available • ${stock.reserved} reserved • ${stock.sold} sold`
    }

    return `${stock.available} of ${stock.total} available • ${stock.sold} sold`
  }

  return (
    <section
      id="tickets"
      className="py-20 bg-gradient-to-br from-background via-blue-50/30 to-purple-50/30 dark:from-background dark:via-blue-950/10 dark:to-purple-950/10"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={cn("text-4xl md:text-5xl font-bold mb-6", spaceGrotesk.className)}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Get Your Tickets
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join us for three days of innovation, networking, and celebration in the heart of Kaspa's community
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Austin, Texas</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>November 7-9, 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>3 Days of Events</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {ticketTypes.map((ticket, index) => {
            const stock = getStockForTicket(ticket.id)
            const isSoldOut = stock?.soldOut || false

            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105",
                    ticket.borderColor,
                    isSoldOut ? "opacity-75" : "",
                    ticket.popular ? "ring-2 ring-green-500/50" : "",
                  )}
                >
                  {ticket.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5", ticket.gradient)} />

                  <CardHeader className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className={cn("p-2 rounded-lg bg-gradient-to-br", ticket.gradient)}>
                        <div className="text-white">{ticket.icon}</div>
                      </div>
                      {getStockBadge(ticket)}
                    </div>
                    <CardTitle className="text-xl font-bold">{ticket.name}</CardTitle>
                    <CardDescription className="text-sm">{ticket.description}</CardDescription>

                    {/* Stock Information */}
                    {!loading && stock && (
                      <div className="text-xs text-muted-foreground mt-2">{getStockText(ticket)}</div>
                    )}
                  </CardHeader>

                  <CardContent className="relative">
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">${ticket.price}</span>
                        {ticket.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through">${ticket.originalPrice}</span>
                        )}
                      </div>
                      {ticket.originalPrice && (
                        <span className="text-sm text-green-600 font-medium">
                          Save ${ticket.originalPrice - ticket.price}
                        </span>
                      )}
                    </div>

                    <ul className="space-y-2">
                      {ticket.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="relative">
                    <Button
                      onClick={() => handlePurchaseClick(ticket)}
                      disabled={isSoldOut || loading}
                      className={cn(
                        "w-full font-semibold transition-all duration-300",
                        isSoldOut
                          ? "bg-gray-400 cursor-not-allowed"
                          : `bg-gradient-to-r ${ticket.gradient} hover:shadow-lg hover:scale-105`,
                      )}
                    >
                      {isSoldOut ? (
                        "Sold Out"
                      ) : (
                        <>
                          <Ticket className="h-4 w-4 mr-2" />
                          Buy {ticket.name}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Purchase Modal */}
        {selectedTicket && (
          <TicketPurchaseModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedTicket(null)
              // Refresh stock after modal closes
              fetchStock()
            }}
            ticketType={selectedTicket.id}
            ticketPrice={selectedTicket.price}
            ticketName={selectedTicket.name}
          />
        )}
      </div>
    </section>
  )
}
