"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ticket, Calendar, MapPin, Users, Clock, Star, Sparkles } from "lucide-react"
import { TicketPurchaseModal } from "./ticket-purchase-modal"
import { Space_Grotesk } from "next/font/google"
import { cn } from "@/lib/utils"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })

interface TicketStock {
  "1-day": number
  "2-day": number
  vip: number
}

export function Tickets() {
  const [selectedTicket, setSelectedTicket] = useState<{
    type: string
    price: number
    name: string
  } | null>(null)
  const [stock, setStock] = useState<TicketStock>({
    "1-day": 0,
    "2-day": 0,
    vip: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStock()
  }, [])

  const fetchStock = async () => {
    try {
      const response = await fetch("/api/tickets/stock")
      const data = await response.json()
      if (data.success) {
        setStock(data.stock)
      }
    } catch (error) {
      console.error("Failed to fetch stock:", error)
    } finally {
      setLoading(false)
    }
  }

  const tickets = [
    {
      id: "1-day",
      name: "1-Day Pass",
      price: 1, // Testing price - normally 75
      originalPrice: 75,
      description: "Access to Day 1 events, networking sessions, and welcome party",
      features: [
        "Day 1 Conference Access",
        "Welcome Party",
        "Networking Sessions",
        "Lunch & Refreshments",
        "Kaspa Swag Bag",
      ],
      icon: Calendar,
      gradient: "from-blue-500 to-cyan-500",
      popular: false,
      stock: stock["1-day"],
    },
    {
      id: "2-day",
      name: "2-Day Pass",
      price: 125,
      description: "Full conference access with all events, parties, and exclusive sessions",
      features: [
        "Full 2-Day Access",
        "All Parties & Events",
        "Exclusive Sessions",
        "All Meals Included",
        "Premium Swag Bag",
        "Priority Seating",
      ],
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      popular: true,
      stock: stock["2-day"],
    },
    {
      id: "vip",
      name: "VIP Experience",
      price: 250,
      description: "Ultimate experience with backstage access, private dinners, and exclusive perks",
      features: [
        "Everything in 2-Day Pass",
        "Backstage Access",
        "Private VIP Dinner",
        "Meet & Greet Sessions",
        "Exclusive VIP Lounge",
        "Premium Gift Package",
        "Photo Opportunities",
      ],
      icon: Star,
      gradient: "from-yellow-500 to-orange-500",
      popular: false,
      stock: stock.vip,
    },
  ]

  const handlePurchase = (ticketType: string, price: number, name: string) => {
    setSelectedTicket({ type: ticketType, price, name })
  }

  return (
    <section
      id="tickets"
      className="py-20 px-4 bg-gradient-to-br from-background via-blue-50/30 to-purple-50/30 dark:from-background dark:via-blue-950/20 dark:to-purple-950/20"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Ticket className="h-8 w-8 text-blue-500" />
            <h2
              className={cn(
                "text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600",
                spaceGrotesk.className,
              )}
            >
              Get Your Tickets
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join us for an unforgettable celebration of Kaspa's 5th birthday. Choose the perfect ticket for your
            experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tickets.map((ticket, index) => {
            const Icon = ticket.icon
            const isAvailable = !loading && ticket.stock > 0

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
                    "relative overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105",
                    ticket.popular ? "border-purple-500/50 shadow-purple-500/25" : "border-border",
                    !isAvailable && "opacity-60",
                  )}
                >
                  {ticket.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 text-sm font-semibold">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5", ticket.gradient)} />

                  <CardHeader className="relative z-10 text-center pb-4">
                    <div
                      className={cn(
                        "w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br flex items-center justify-center",
                        ticket.gradient,
                      )}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className={cn("text-2xl font-bold", spaceGrotesk.className)}>{ticket.name}</CardTitle>
                    <CardDescription className="text-base">{ticket.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="relative z-10 space-y-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={cn(
                            "text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r",
                            ticket.gradient,
                          )}
                        >
                          ${ticket.price}
                        </span>
                        {ticket.originalPrice && ticket.price !== ticket.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through">${ticket.originalPrice}</span>
                        )}
                      </div>
                      {ticket.price === 1 && (
                        <Badge
                          variant="secondary"
                          className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          🧪 Testing Price
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-3">
                      {ticket.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-3">
                          <div className={cn("w-2 h-2 rounded-full bg-gradient-to-r", ticket.gradient)} />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Bangkok, Thailand</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Aug 1-2, 2025</span>
                      </div>
                    </div>

                    {!loading && (
                      <div className="text-center">
                        <Badge variant={isAvailable ? "secondary" : "destructive"} className="text-xs">
                          {isAvailable ? `${ticket.stock} tickets remaining` : "Sold Out"}
                        </Badge>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="relative z-10">
                    <Button
                      onClick={() => handlePurchase(ticket.id, ticket.price, ticket.name)}
                      disabled={loading || !isAvailable}
                      className={cn(
                        "w-full font-semibold transition-all duration-300",
                        `bg-gradient-to-r ${ticket.gradient} hover:shadow-lg hover:shadow-current/25`,
                        !isAvailable && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      {loading ? (
                        "Loading..."
                      ) : isAvailable ? (
                        <>
                          <Ticket className="w-4 h-4 mr-2" />
                          Purchase Ticket
                        </>
                      ) : (
                        "Sold Out"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            All tickets include access to networking sessions, refreshments, and exclusive Kaspa merchandise.
          </p>
          <p className="text-sm text-muted-foreground">
            Prices are in USD. Payment accepted in various cryptocurrencies including KAS, BTC, ETH, and more.
          </p>
        </motion.div>
      </div>

      <TicketPurchaseModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticketType={selectedTicket?.type || ""}
        ticketPrice={selectedTicket?.price || 0}
        ticketName={selectedTicket?.name || ""}
      />
    </section>
  )
}
