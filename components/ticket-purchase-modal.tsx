"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, User, Coins, Search, ArrowRight, CheckCircle, Copy, ExternalLink } from "lucide-react"
import { Space_Grotesk } from "next/font/google"
import { cn } from "@/lib/utils"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })

interface TicketPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  ticketType: string
  ticketPrice: number
  ticketName: string
}

interface PaymentInfo {
  paymentId: string
  payAddress: string
  payAmount: number
  payCurrency: string
  paymentStatus: string
}

interface Currency {
  id: number
  code: string
  name: string
  enable: boolean
  logo_url: string
  priority: number
  network?: string
}

export function TicketPurchaseModal({
  isOpen,
  onClose,
  ticketType,
  ticketPrice,
  ticketName,
}: TicketPurchaseModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [filteredCurrencies, setFilteredCurrencies] = useState<Currency[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
  })
  const [selectedCurrency, setSelectedCurrency] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [copied, setCopied] = useState(false)

  // Fetch available currencies
  useEffect(() => {
    if (isOpen) {
      fetchCurrencies()
    }
  }, [isOpen])

  // Filter currencies based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = currencies.filter(
        (currency) =>
          currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          currency.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredCurrencies(filtered)
    } else {
      setFilteredCurrencies(currencies)
    }
  }, [searchTerm, currencies])

  const fetchCurrencies = async () => {
    try {
      const response = await fetch("/api/nowpayments/currencies")
      const data = await response.json()

      if (data.currencies) {
        // Sort currencies: KAS first, then BTC, then ETH, then alphabetically
        const sortedCurrencies = data.currencies
          .filter((currency: Currency) => currency.enable)
          .sort((a: Currency, b: Currency) => {
            const priorityOrder = { KAS: 1, BTC: 2, ETH: 3 }
            const aPriority = priorityOrder[a.code as keyof typeof priorityOrder] || 999
            const bPriority = priorityOrder[b.code as keyof typeof priorityOrder] || 999

            if (aPriority !== bPriority) {
              return aPriority - bPriority
            }

            return a.code.localeCompare(b.code)
          })

        setCurrencies(sortedCurrencies)
        setFilteredCurrencies(sortedCurrencies)
      }
    } catch (error) {
      console.error("Failed to fetch currencies:", error)
    }
  }

  const handleCustomerInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customerInfo.name && customerInfo.email) {
      setStep(2)
    }
  }

  const handlePurchase = async () => {
    if (!selectedCurrency) return

    setLoading(true)
    try {
      const response = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketType,
          quantity,
          customerInfo,
          currency: selectedCurrency,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPaymentInfo(data.order)
        setStep(3)
      } else {
        alert(data.error || "Purchase failed")
      }
    } catch (error) {
      console.error("Purchase error:", error)
      alert("Purchase failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const totalAmount = ticketPrice * quantity

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className={cn(
              "text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400",
              spaceGrotesk.className,
            )}
          >
            Purchase {ticketName}
          </DialogTitle>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    step >= stepNum
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {step > stepNum ? <CheckCircle className="w-4 h-4" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={cn(
                      "w-8 h-0.5 mx-2 transition-all duration-300",
                      step > stepNum ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-muted",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCustomerInfoSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2 text-foreground">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="border-blue-500/20 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email address"
                        className="border-blue-500/20 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Select
                        value={quantity.toString()}
                        onValueChange={(value) => setQuantity(Number.parseInt(value))}
                      >
                        <SelectTrigger className="border-blue-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} ticket{num > 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      Continue to Payment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Coins className="h-5 w-5 text-purple-500" />
                    Select Cryptocurrency
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Currency Search */}
                  <div className="space-y-2">
                    <Label>Search Currencies</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search for Kaspa, Bitcoin, Ethereum..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Currency Grid */}
                  <div className="space-y-2">
                    <Label>Available Cryptocurrencies ({filteredCurrencies.length})</Label>
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-2 bg-background/50">
                      <div className="grid grid-cols-1 gap-2">
                        {filteredCurrencies.map((currency) => (
                          <button
                            key={currency.code}
                            onClick={() => setSelectedCurrency(currency.code)}
                            className={cn(
                              "p-3 rounded-lg border text-left transition-all duration-200 hover:scale-105 flex items-center gap-3",
                              selectedCurrency === currency.code
                                ? "border-purple-500 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
                                : "border-border hover:border-purple-500/50",
                            )}
                          >
                            <img
                              src={`https://api.nowpayments.io${currency.logo_url}`}
                              alt={currency.name}
                              className="w-8 h-8 rounded-full"
                              onError={(e) => {
                                // Fallback to a placeholder if logo fails to load
                                e.currentTarget.src = `data:image/svg+xml;base64,${Buffer.from(
                                  `<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="#667eea" rx="16"/><text x="16" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">${currency.code.charAt(0)}</text></svg>`,
                                ).toString("base64")}`
                              }}
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm flex items-center gap-2">
                                {currency.code.toUpperCase()}
                                {currency.code === "KAS" && (
                                  <Badge className="bg-blue-500 text-white text-xs px-2 py-0">Kaspa</Badge>
                                )}
                                {currency.code === "BTC" && (
                                  <Badge className="bg-orange-500 text-white text-xs px-2 py-0">Bitcoin</Badge>
                                )}
                                {currency.code === "ETH" && (
                                  <Badge className="bg-blue-600 text-white text-xs px-2 py-0">Ethereum</Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{currency.name}</div>
                              {currency.network && (
                                <div className="text-xs text-muted-foreground">Network: {currency.network}</div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg border border-blue-500/20">
                    <h4 className="font-semibold mb-3 text-foreground">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Ticket Type:</span>
                        <span className="font-medium">{ticketName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span className="font-medium">{quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price per ticket:</span>
                        <span className="font-medium">${ticketPrice}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                          ${totalAmount}
                        </span>
                      </div>
                      {ticketPrice === 1 && (
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                          🧪 Testing price - normally $75
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={handlePurchase}
                      disabled={!selectedCurrency || loading}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay with {selectedCurrency?.toUpperCase()}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && paymentInfo && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-blue-500/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Payment Created Successfully
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white mb-4">
                      Payment Pending
                    </Badge>
                    <p className="text-muted-foreground mb-4">
                      Send exactly{" "}
                      <strong>
                        {paymentInfo.payAmount} {paymentInfo.payCurrency.toUpperCase()}
                      </strong>{" "}
                      to the address below
                    </p>
                  </div>

                  {/* Payment Address */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg border border-blue-500/20">
                    <Label className="text-sm font-medium mb-2 block">Payment Address</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-background/50 rounded text-xs break-all">
                        {paymentInfo.payAddress}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(paymentInfo.payAddress)}
                        className="flex-shrink-0"
                      >
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Payment Amount */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-lg border border-purple-500/20">
                    <Label className="text-sm font-medium mb-2 block">Amount to Send</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {paymentInfo.payAmount} {paymentInfo.payCurrency.toUpperCase()}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(paymentInfo.payAmount.toString())}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Send the exact amount to avoid delays</p>
                    <p>• Your ticket will be generated automatically after payment confirmation</p>
                    <p>• You'll receive an email with your ticket and QR code</p>
                    <p>• Payment typically confirms within 10-30 minutes</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                      Close
                    </Button>
                    <Button
                      onClick={() =>
                        window.open(
                          `${process.env.NEXT_PUBLIC_BASE_URL}/ticket-success?order=${paymentInfo.paymentId}`,
                          "_blank",
                        )
                      }
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Track Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
