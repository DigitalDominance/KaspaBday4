"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Star, Crown, Zap, Gift, AlertCircle } from "lucide-react"
import { ElegantShape } from "@/components/ui/elegant-shape"
import { TicketPurchaseModal } from "@/components/ticket-purchase-modal"
import { Space_Grotesk } from "next/font/google"
import { cn } from "@/lib/utils"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
}

const ticketTypes = [
  {
    id: "1-day",
    name: "1-Day Pass",
    price: 75,
    originalPrice: null,
    description: "Perfect for a single day experience",
    icon: <Zap className="h-6 w-6" />,
    color: "from-blue-500/5 to-transparent border-blue-500/20",
    buttonColor: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    popular: false,
    maxStock: 50,
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
    description: "Great value for weekend experience",
    icon: <Star className="h-6 w-6" />,
    color: "from-purple-500/5 to-transparent border-purple-500/20",
    buttonColor: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    popular: true,
    maxStock: 30,
    features: [
      "Access to any 2 days (Nov 7-9)",
      "All workshops and presentations",
      "Complimentary meals and beverages",
      "12 raffle entries for daily prizes",
      "Access to vendor marketplace",
      "Enhanced networking sessions",
      "Premium event swag bag",
    ],
  },
  {
    id: "3-day",
    name: "3-Day Pass",
    price: 175,
    originalPrice: 225,
    description: "Complete celebration experience",
    icon: <Crown className="h-6 w-6" />,
    color: "from-blue-500/5 to-purple-500/5 border-blue-500/20",
    buttonColor: "from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
    popular: false,
    maxStock: 20,
    features: [
      "Full access to all 3 days (Nov 7-9)",
      "All workshops and presentations",
      "Complimentary meals and beverages",
      "20 raffle entries for daily prizes",
      "Access to vendor marketplace",
      "VIP networking sessions",
      "Exclusive 3-day attendee meetup",
      "Deluxe event swag bag",
    ],
  },
  {
    id: "vip",
    name: "VIP Pass",
    price: 299,
    originalPrice: null,
    description: "Premium experience with exclusive perks",
    icon: <Gift className="h-6 w-6" />,
    color: "from-purple-500/5 to-pink-500/5 border-purple-500/20",
    buttonColor: "from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700",
    popular: false,
    maxStock: 10,
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

interface TicketStock {
  type: string
  available: number
  reserved: number
  total: number
  sold: number
  soldOut: boolean
}

export function Tickets() {
  const [ticketStock, setTicketStock] = useState<Record<string, TicketStock>>({})
  const [selectedTicket, setSelectedTicket] = useState<(typeof ticketTypes)[0] | null>(null)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTicketStock()

    // Update stock every 30 seconds
    const interval = setInterval(fetchTicketStock, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchTicketStock = async () => {
    try {
      const response = await fetch("/api/tickets/stock")
      const data = await response.json()

      if (data.success && data.stock) {
        const stockMap = data.stock.reduce((acc: Record<string, TicketStock>, item: TicketStock) => {
          acc[item.type] = item
          return acc
        }, {})
        setTicketStock(stockMap)
      }
    } catch (error) {
      console.error("Failed to fetch ticket stock:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTicketPurchase = (ticket: (typeof ticketTypes)[0]) => {
    setSelectedTicket(ticket)
    setPurchaseModalOpen(true)
  }

  const handlePurchaseComplete = () => {
    // Refresh stock after purchase
    fetchTicketStock()
  }

  const getTicketAvailability = (ticketId: string) => {
    const stock = ticketStock[ticketId]
    if (!stock) return { available: 0, reserved: 0, total: 0, soldOut: false }
    return stock
  }

  return (
    <section
      id="tickets"
      className="py-20 px-4 md:px-6 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden"
    >
      {/* Add geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/10 md:bg-transparent" />
        <ElegantShape
          width={500}
          height={120}
          rotate={45}
          gradient="from-blue-500/[0.12]"
          className="left-[-5%] top-[20%]"
          mobileWidth={150}
          mobileHeight={36}
        />
        <ElegantShape
          width={400}
          height={100}
          rotate={-30}
          gradient="from-purple-500/[0.12]"
          className="right-[0%] top-[70%]"
          mobileWidth={120}
          mobileHeight={30}
        />
        <ElegantShape
          width={300}
          height={80}
          rotate={15}
          gradient="from-blue-400/[0.10]"
          className="left-[10%] bottom-[10%]"
          mobileWidth={90}
          mobileHeight={24}
        />
        <ElegantShape
          width={250}
          height={70}
          rotate={-45}
          gradient="from-purple-400/[0.10]"
          className="right-[20%] top-[15%]"
          mobileWidth={75}
          mobileHeight={21}
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 font-space-grotesk"
          >
            Get Your Tickets
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Choose the perfect pass for your Kaspa celebration experience • November 7-9, 2025
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <AlertCircle className="h-4 w-4" />
            <span>Pay with any cryptocurrency • Secure NOWPayments processing</span>
          </motion.div>
        </motion.div>

        {/* Ticket Cards Container with Animated Outline */}
        <motion.div variants={itemVariants} className="relative mb-16">
          {/* Early Bird Special Tag */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-lg"
            >
              Early Bird Special
            </motion.div>
          </div>

          {/* Animated Container Background */}
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 border-2 border-transparent overflow-hidden">
            {/* Animated Border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 p-[2px]">
              <div className="h-full w-full rounded-3xl bg-background" />
            </div>

            {/* Animated Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ticketTypes.map((ticket, index) => {
                  const availability = getTicketAvailability(ticket.id)
                  const isSoldOut = availability.soldOut
                  const isLowStock = availability.available <= 5 && availability.available > 0
                  const showReserved = availability.reserved > 0

                  return (
                    <motion.div key={ticket.name} variants={itemVariants} className="relative">
                      {ticket.popular && !isSoldOut && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-1">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      {isSoldOut && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-red-500 text-white border-0 px-4 py-1">Sold Out</Badge>
                        </div>
                      )}
                      {isLowStock && !isSoldOut && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-orange-500 text-white border-0 px-4 py-1 animate-pulse">
                            Only {availability.available} Left!
                          </Badge>
                        </div>
                      )}
                      <Card
                        className={`h-full bg-gradient-to-br ${ticket.color} relative overflow-hidden ${isSoldOut ? "opacity-60" : ""}`}
                      >
                        {isSoldOut && <div className="absolute inset-0 bg-black/20 z-5" />}
                        <CardHeader className="text-center pb-4">
                          <div
                            className={cn(
                              "p-4 rounded-lg bg-gradient-to-r text-white mb-4 flex flex-col items-center gap-2",
                              ticket.buttonColor,
                            )}
                          >
                            {ticket.icon}
                            <CardTitle className="text-xl font-space-grotesk text-white">{ticket.name}</CardTitle>
                          </div>
                          <p className="text-sm text-muted-foreground">{ticket.description}</p>
                          <div className="flex items-center justify-center gap-2 mt-4">
                            <span className="text-3xl font-bold">${ticket.price}</span>
                            {ticket.originalPrice && (
                              <span className="text-lg text-muted-foreground line-through">
                                ${ticket.originalPrice}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 space-y-1">
                            {loading ? (
                              <div>Loading availability...</div>
                            ) : (
                              <>
                                <div>
                                  {availability.available} of {availability.total} available
                                </div>
                                {showReserved && <div className="text-blue-400">{availability.reserved} reserved</div>}
                              </>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <ul className="space-y-2">
                            {ticket.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-start gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <Button
                            className={cn(
                              `w-full bg-gradient-to-r ${ticket.buttonColor} text-white border-0`,
                              spaceGrotesk.className,
                            )}
                            size="lg"
                            disabled={isSoldOut || loading}
                            onClick={() => handleTicketPurchase(ticket)}
                          >
                            {isSoldOut ? "Sold Out" : `Buy ${ticket.name}`}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center"
        >
          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 p-[1px]">
              <div className="h-full w-full rounded-xl bg-background" />
            </div>

            <CardContent className="pt-8 relative z-10">
              <h3
                className={cn(
                  "text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400",
                  spaceGrotesk.className,
                )}
              >
                Important Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className={cn("font-semibold text-blue-400 mb-4 text-lg", spaceGrotesk.className)}>
                    Event Details
                  </h4>
                  <div className="space-y-2">
                    <p className="text-foreground">November 7-9, 2025</p>
                    <p className="text-foreground">Kaspa Community Center, Liverpool, NY</p>
                    <p className="text-foreground">All tickets include meals and beverages</p>
                    <p className="text-foreground">Daily raffle prizes for all attendees</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className={cn("font-semibold text-purple-400 mb-4 text-lg", spaceGrotesk.className)}>
                    Payment & Policies
                  </h4>
                  <div className="space-y-2">
                    <p className="text-foreground">Pay with 100+ cryptocurrencies</p>
                    <p className="text-foreground">Instant ticket generation after payment</p>
                    <p className="text-foreground">Tickets are transferable but non-refundable</p>
                    <p className="text-foreground">Digital tickets sent via email</p>
                    <p className="text-foreground">30-minute reservation window</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Questions? Contact us at events@kaspafunding.com • Early bird pricing ends October 15th, 2025
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Purchase Modal */}
      {selectedTicket && (
        <TicketPurchaseModal
          isOpen={purchaseModalOpen}
          onClose={() => {
            setPurchaseModalOpen(false)
            setSelectedTicket(null)
            handlePurchaseComplete()
          }}
          ticketType={selectedTicket.id}
          ticketPrice={selectedTicket.price}
          ticketName={selectedTicket.name}
        />
      )}
    </section>
  )
}
