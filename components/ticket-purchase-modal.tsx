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
import { Loader2, CreditCard, User, Coins, Search, ArrowRight, CheckCircle, ExternalLink } from "lucide-react"
import { Space_Grotesk } from "next/font/google"
import { cn } from "@/lib/utils"
import { PaymentStatusTracker } from "@/components/payment-status-tracker"
import { PaymentStorage } from "@/lib/payment-storage"

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
  orderId: string
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
  const [currencies, setCurrencies] = useState<string[]>([])
  const [filteredCurrencies, setFilteredCurrencies] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
  })
  const [selectedCurrency, setSelectedCurrency] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [copied, setCopied] = useState(false)

  // Check for existing pending payments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCurrencies()
      checkForExistingPayments()
    }
  }, [isOpen])

  // Filter currencies based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = currencies.filter((currency) => currency.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredCurrencies(filtered)
    } else {
      setFilteredCurrencies(currencies)
    }
  }, [searchTerm, currencies])

  const checkForExistingPayments = () => {
    const pendingPayments = PaymentStorage.getPendingPayments()
    if (pendingPayments.length > 0) {
      // If there's a pending payment, show it
      const latestPayment = pendingPayments[pendingPayments.length - 1]
      setPaymentInfo({
        paymentId: latestPayment.paymentId,
        payAddress: latestPayment.payAddress,
        payAmount: latestPayment.payAmount,
        payCurrency: latestPayment.payCurrency,
        paymentStatus: latestPayment.paymentStatus,
        orderId: latestPayment.orderId,
      })
      setStep(3)
    }
  }

  const fetchCurrencies = async () => {
    try {
      const response = await fetch("/api/nowpayments/currencies")
      const data = await response.json()
      setCurrencies(data.currencies || [])
      setFilteredCurrencies(data.currencies || [])
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
        const payment = data.order
        setPaymentInfo(payment)

        // Store payment in localStorage for tracking
        PaymentStorage.savePayment({
          paymentId: payment.paymentId,
          orderId: payment.orderId,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          ticketType,
          ticketName,
          quantity,
          totalAmount: ticketPrice * quantity,
          currency: selectedCurrency,
          payAddress: payment.payAddress,
          payAmount: payment.payAmount,
          payCurrency: payment.payCurrency,
          paymentStatus: payment.paymentStatus,
          createdAt: new Date().toISOString(),
        })

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

  const handlePaymentStatusChange = (status: string) => {
    if (paymentInfo) {
      setPaymentInfo((prev) => (prev ? { ...prev, paymentStatus: status } : null))
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

  const handleClose = () => {
    // Don't reset state if there's a pending payment
    if (!paymentInfo || paymentInfo.paymentStatus === "finished" || paymentInfo.paymentStatus === "failed") {
      setStep(1)
      setPaymentInfo(null)
      setCustomerInfo({ name: "", email: "" })
      setSelectedCurrency("")
      setQuantity(1)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className={cn(
              "text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400",
              spaceGrotesk.className,
            )}
          >
            {step === 3 && paymentInfo ? `Payment Tracking - ${ticketName}` : `Purchase ${ticketName}`}
          </DialogTitle>

          {/* Progress Indicator */}
          {step < 3 && (
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
          )}
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
                        placeholder="Search for Bitcoin, Ethereum, Kaspa..."
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
                      <div className="grid grid-cols-2 gap-2">
                        {filteredCurrencies.map((currency) => (
                          <button
                            key={currency}
                            onClick={() => setSelectedCurrency(currency)}
                            className={cn(
                              "p-3 rounded-lg border text-left transition-all duration-200 hover:scale-105",
                              selectedCurrency === currency
                                ? "border-purple-500 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
                                : "border-border hover:border-purple-500/50",
                            )}
                          >
                            <div className="font-medium text-sm">{currency.toUpperCase()}</div>
                            <div className="text-xs text-muted-foreground">{currency}</div>
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
                          Pay with {selectedCurrency ? selectedCurrency.toUpperCase() : "Crypto"}
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
              <PaymentStatusTracker paymentId={paymentInfo.paymentId} onStatusChange={handlePaymentStatusChange} />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 bg-transparent"
                  disabled={paymentInfo.paymentStatus === "confirming"}
                >
                  {paymentInfo.paymentStatus === "finished" ? "Close" : "Close & Track Later"}
                </Button>
                <Button
                  onClick={() =>
                    window.open(
                      `${process.env.NEXT_PUBLIC_BASE_URL}/ticket-success?order=${paymentInfo.orderId}`,
                      "_blank",
                    )
                  }
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Tracker Page
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
