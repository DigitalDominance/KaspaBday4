"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Clock, CreditCard, User, ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface Currency {
  currency: string
  name: string
  logo_url?: string
}

interface TicketPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  ticketType: string
  ticketPrice: number
  ticketName: string
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
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
  })
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds

  // Fetch available currencies
  useEffect(() => {
    if (isOpen && step === 2) {
      fetchCurrencies()
    }
  }, [isOpen, step])

  // Filter currencies based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = currencies.filter(
        (currency) =>
          currency.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
          currency.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredCurrencies(filtered)
    } else {
      setFilteredCurrencies(currencies)
    }
  }, [searchTerm, currencies])

  // Timer countdown
  useEffect(() => {
    if (step === 3 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handlePaymentExpired()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [step, timeLeft])

  const fetchCurrencies = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/nowpayments/currencies")
      const data = await response.json()

      if (data.success && data.currencies) {
        // Sort currencies to put KAS first
        const sortedCurrencies = data.currencies.sort((a: Currency, b: Currency) => {
          if (a.currency.toLowerCase() === "kas") return -1
          if (b.currency.toLowerCase() === "kas") return 1
          return a.currency.localeCompare(b.currency)
        })

        setCurrencies(sortedCurrencies)
        setFilteredCurrencies(sortedCurrencies)
      }
    } catch (error) {
      console.error("Failed to fetch currencies:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerInfoSubmit = () => {
    if (customerInfo.name && customerInfo.email) {
      setStep(2)
    }
  }

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency)
  }

  const handlePaymentCreate = async () => {
    if (!selectedCurrency) return

    try {
      setLoading(true)
      const response = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketType,
          quantity,
          customerInfo,
          currency: selectedCurrency.currency,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPaymentInfo(data)
        setStep(3)
        setTimeLeft(30 * 60) // Reset timer to 30 minutes
      } else {
        alert(data.error || "Failed to create payment")
      }
    } catch (error) {
      console.error("Payment creation error:", error)
      alert("Failed to create payment")
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentCancel = async () => {
    if (paymentInfo?.order?.paymentId) {
      try {
        await fetch("/api/tickets/cancel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentId: paymentInfo.order.paymentId,
          }),
        })
      } catch (error) {
        console.error("Cancel error:", error)
      }
    }
    handleClose()
  }

  const handlePaymentExpired = async () => {
    if (paymentInfo?.order?.paymentId) {
      try {
        await fetch("/api/tickets/cancel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentId: paymentInfo.order.paymentId,
          }),
        })
      } catch (error) {
        console.error("Expiry cleanup error:", error)
      }
    }
    alert("Payment expired. Please try again.")
    handleClose()
  }

  const handleClose = () => {
    setStep(1)
    setSelectedCurrency(null)
    setCustomerInfo({ name: "", email: "" })
    setPaymentInfo(null)
    setTimeLeft(30 * 60)
    setSearchTerm("")
    onClose()
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getCurrencyLogo = (currency: Currency) => {
    // Special handling for KAS to use local logo
    if (currency.currency.toLowerCase() === "kas") {
      return "/kaspa-logo.webp"
    }
    return currency.logo_url || "/placeholder.svg?height=24&width=24"
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Purchase {ticketName}
            <div className="flex gap-1 ml-auto">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step >= stepNum ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600",
                  )}
                >
                  {stepNum}
                </div>
              ))}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Customer Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-blue-600">
              <User className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Customer Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="Enter your email address"
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ticket Type:</span>
                    <span>{ticketName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per ticket:</span>
                    <span>${ticketPrice}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">${ticketPrice * quantity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={handleCustomerInfoSubmit}
                disabled={!customerInfo.name || !customerInfo.email}
                className="flex-1"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Currency Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-purple-600">
              <CreditCard className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Select Cryptocurrency</h3>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search currencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="text-sm text-gray-600">Available Cryptocurrencies ({filteredCurrencies.length})</div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading currencies...</span>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredCurrencies.map((currency) => (
                    <div
                      key={currency.currency}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedCurrency?.currency === currency.currency
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300",
                      )}
                      onClick={() => handleCurrencySelect(currency)}
                    >
                      <Image
                        src={getCurrencyLogo(currency) || "/placeholder.svg"}
                        alt={currency.currency}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{currency.currency.toUpperCase()}</div>
                        <div className="text-sm text-gray-500">{currency.name}</div>
                      </div>
                      {currency.currency.toLowerCase() === "kas" && (
                        <Badge className="bg-blue-500 text-white">Recommended</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ticket Type:</span>
                    <span>{ticketName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per ticket:</span>
                    <span>${ticketPrice}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">${ticketPrice * quantity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handlePaymentCreate}
                disabled={!selectedCurrency || loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay with {selectedCurrency?.currency.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && paymentInfo && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-green-600">
              <Clock className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Complete Payment</h3>
              <Badge variant="outline" className="ml-auto">
                {formatTime(timeLeft)}
              </Badge>
            </div>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-orange-700">
                    Send exactly{" "}
                    <strong>
                      {paymentInfo.order.payAmount} {paymentInfo.order.payCurrency.toUpperCase()}
                    </strong>{" "}
                    to:
                  </p>
                  <div className="bg-white p-3 rounded border font-mono text-sm break-all">
                    {paymentInfo.order.payAddress}
                  </div>
                  <p className="text-xs text-orange-600">
                    Payment will be automatically detected. Do not send from an exchange.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">Payment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-mono">{paymentInfo.order.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment ID:</span>
                    <span className="font-mono">{paymentInfo.order.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant="outline">{paymentInfo.order.paymentStatus}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires:</span>
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handlePaymentCancel} className="flex-1 bg-transparent">
                Cancel Payment
              </Button>
              <Button
                onClick={() =>
                  window.open(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/ticket-success?order=${paymentInfo.order.orderId}`,
                    "_blank",
                  )
                }
                className="flex-1"
              >
                Check Status
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
