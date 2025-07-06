"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, Clock, AlertCircle, Copy, ExternalLink, RefreshCw, Mail } from "lucide-react"
import { PaymentStorage, type StoredPayment } from "@/lib/payment-storage"
import { cn } from "@/lib/utils"

interface PaymentStatusTrackerProps {
  paymentId: string
  onStatusChange?: (status: string) => void
}

export function PaymentStatusTracker({ paymentId, onStatusChange }: PaymentStatusTrackerProps) {
  const [payment, setPayment] = useState<StoredPayment | null>(null)
  const [currentStatus, setCurrentStatus] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load payment from storage
    const storedPayment = PaymentStorage.getPayment(paymentId)
    if (storedPayment) {
      setPayment(storedPayment)
      setCurrentStatus(storedPayment.paymentStatus)
    }

    // Start polling for status updates
    checkPaymentStatus()
    const interval = setInterval(checkPaymentStatus, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [paymentId])

  const checkPaymentStatus = async () => {
    try {
      setRefreshing(true)
      setError(null)

      const response = await fetch(`/api/payments/${paymentId}/status`)
      const data = await response.json()

      if (response.ok) {
        const newStatus = data.payment_status
        setCurrentStatus(newStatus)

        // Update stored payment
        PaymentStorage.updatePaymentStatus(paymentId, newStatus)

        // Update payment object
        if (payment) {
          const updatedPayment = { ...payment, paymentStatus: newStatus }
          setPayment(updatedPayment)
        }

        // Notify parent component
        if (onStatusChange) {
          onStatusChange(newStatus)
        }

        // If payment is finished, we can stop polling
        if (newStatus === "finished" || newStatus === "failed" || newStatus === "expired") {
          // Don't clear interval here, let parent component handle it
        }
      } else {
        setError(data.error || "Failed to check payment status")
      }
    } catch (error) {
      console.error("Payment status check error:", error)
      setError("Network error occurred")
    } finally {
      setLoading(false)
      setRefreshing(false)
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "waiting":
        return {
          icon: <Clock className="h-5 w-5" />,
          color: "bg-blue-500",
          text: "Waiting for Payment",
          description: "Send the exact amount to the address below",
        }
      case "confirming":
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin" />,
          color: "bg-yellow-500",
          text: "Confirming Payment",
          description: "Transaction detected, waiting for blockchain confirmations",
        }
      case "confirmed":
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          color: "bg-green-500",
          text: "Payment Confirmed",
          description: "Payment confirmed on blockchain, processing your ticket",
        }
      case "sending":
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin" />,
          color: "bg-blue-500",
          text: "Processing",
          description: "Funds are being processed",
        }
      case "finished":
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          color: "bg-green-500",
          text: "Payment Complete",
          description: "Your ticket has been generated and sent to your email",
        }
      case "partially_paid":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: "bg-orange-500",
          text: "Partially Paid",
          description: "Insufficient amount received, please send the remaining balance",
        }
      case "failed":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: "bg-red-500",
          text: "Payment Failed",
          description: "Payment could not be processed",
        }
      case "expired":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: "bg-gray-500",
          text: "Payment Expired",
          description: "Payment window has expired",
        }
      default:
        return {
          icon: <Clock className="h-5 w-5" />,
          color: "bg-gray-500",
          text: "Unknown Status",
          description: "Checking payment status...",
        }
    }
  }

  if (loading && !payment) {
    return (
      <Card className="border-blue-500/20">
        <CardContent className="pt-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Loading payment information...</p>
        </CardContent>
      </Card>
    )
  }

  if (!payment) {
    return (
      <Card className="border-red-500/20">
        <CardContent className="pt-8 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p>Payment not found</p>
        </CardContent>
      </Card>
    )
  }

  const statusInfo = getStatusInfo(currentStatus)

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <motion.div
                className={cn("p-2 rounded-full text-white", statusInfo.color)}
                animate={currentStatus === "confirming" ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                {statusInfo.icon}
              </motion.div>
              <div>
                <h3 className="text-xl font-bold">{statusInfo.text}</h3>
                <p className="text-sm text-muted-foreground font-normal">{statusInfo.description}</p>
              </div>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={checkPaymentStatus}
              disabled={refreshing}
              className="flex-shrink-0 bg-transparent"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Payment Details */}
      {(currentStatus === "waiting" || currentStatus === "confirming") && (
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Payment Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Payment Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Send to this address:</label>
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border">
                <code className="flex-1 text-xs break-all">{payment.payAddress}</code>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(payment.payAddress)}>
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Payment Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Exact amount to send:</label>
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                <span className="text-lg font-bold">
                  {payment.payAmount} {payment.payCurrency.toUpperCase()}
                </span>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(payment.payAmount.toString())}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status-specific messages */}
            <AnimatePresence mode="wait">
              {currentStatus === "confirming" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="font-medium">Transaction Detected!</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    We've detected your payment on the blockchain. Please wait while we confirm the transaction. This
                    usually takes 1-10 minutes depending on network congestion.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card className="border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Order ID:</span>
              <p className="font-mono font-medium">{payment.orderId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Customer:</span>
              <p className="font-medium">{payment.customerName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Ticket Type:</span>
              <p className="font-medium">{payment.ticketName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Quantity:</span>
              <p className="font-medium">{payment.quantity}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Amount:</span>
              <p className="font-medium">${payment.totalAmount}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <Badge className={cn("text-white", statusInfo.color)}>{statusInfo.text}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Actions */}
      {currentStatus === "finished" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-blue-500/5">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground mb-6">
                Your ticket has been generated and sent to {payment.customerEmail}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => window.open(`/ticket-success?order=${payment.orderId}`, "_blank")}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Ticket
                </Button>
                <Button variant="outline" disabled>
                  <Mail className="h-4 w-4 mr-2" />
                  Check Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error checking payment status</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
