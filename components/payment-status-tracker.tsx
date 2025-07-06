"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Copy, CheckCircle, AlertCircle, Loader2, XCircle, Timer } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentStatusTrackerProps {
  paymentId: string
  onStatusChange?: (status: string) => void
  onCancel?: () => void
}

interface PaymentStatus {
  paymentId: string
  paymentStatus: string
  payAddress: string
  payAmount: number
  payCurrency: string
  actuallyPaid?: number
  orderDescription: string
  expiresAt?: string
}

export function PaymentStatusTracker({ paymentId, onStatusChange, onCancel }: PaymentStatusTrackerProps) {
  const [paymentData, setPaymentData] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchPaymentStatus()
    const interval = setInterval(fetchPaymentStatus, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [paymentId])

  // Timer countdown effect
  useEffect(() => {
    if (!paymentData?.expiresAt) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const expiry = new Date(paymentData.expiresAt!).getTime()
      const remaining = Math.max(0, expiry - now)
      setTimeLeft(remaining)

      if (remaining === 0 && paymentData.paymentStatus === "waiting") {
        // Payment expired, fetch status to confirm
        fetchPaymentStatus()
      }
    }

    updateTimer()
    const timerInterval = setInterval(updateTimer, 1000)

    return () => clearInterval(timerInterval)
  }, [paymentData?.expiresAt, paymentData?.paymentStatus])

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/status`)
      const data = await response.json()

      if (data.success) {
        setPaymentData(data.payment)
        if (onStatusChange) {
          onStatusChange(data.payment.paymentStatus)
        }
      }
    } catch (error) {
      console.error("Failed to fetch payment status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!paymentData) return

    setCancelling(true)
    try {
      const response = await fetch("/api/tickets/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: paymentData.paymentId,
        }),
      })

      if (response.ok) {
        if (onCancel) {
          onCancel()
        }
      }
    } catch (error) {
      console.error("Cancel error:", error)
    } finally {
      setCancelling(false)
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

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "waiting":
        return {
          icon: <Clock className="h-5 w-5" />,
          label: "Waiting for Payment",
          color: "bg-blue-500",
          description: "Send the exact amount to the address below",
        }
      case "confirming":
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin" />,
          label: "Confirming Payment",
          color: "bg-yellow-500",
          description: "Payment received, waiting for blockchain confirmation",
        }
      case "confirmed":
      case "finished":
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          label: "Payment Confirmed",
          color: "bg-green-500",
          description: "Payment successful! Your tickets will be sent via email",
        }
      case "failed":
        return {
          icon: <XCircle className="h-5 w-5" />,
          label: "Payment Failed",
          color: "bg-red-500",
          description: "Payment failed or expired",
        }
      case "expired":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          label: "Payment Expired",
          color: "bg-red-500",
          description: "Payment window expired, tickets have been released",
        }
      default:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          label: "Unknown Status",
          color: "bg-gray-500",
          description: "Unknown payment status",
        }
    }
  }

  if (loading) {
    return (
      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2">Loading payment status...</span>
        </CardContent>
      </Card>
    )
  }

  if (!paymentData) {
    return (
      <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payment Not Found</h3>
          <p className="text-muted-foreground">Unable to load payment information</p>
        </CardContent>
      </Card>
    )
  }

  const statusInfo = getStatusInfo(paymentData.paymentStatus)
  const isWaiting = paymentData.paymentStatus === "waiting"
  const isExpired = paymentData.paymentStatus === "expired" || paymentData.paymentStatus === "failed"
  const isSuccess = paymentData.paymentStatus === "finished" || paymentData.paymentStatus === "confirmed"
  const timeIsLow = timeLeft < 5 * 60 * 1000 && timeLeft > 0 // Less than 5 minutes

  return (
    <div className="space-y-6">
      {/* Header with Timer */}
      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-full text-white", statusInfo.color)}>{statusInfo.icon}</div>
              <div>
                <CardTitle className="text-lg">{statusInfo.label}</CardTitle>
                <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
              </div>
            </div>

            {/* Timer Display */}
            {isWaiting && timeLeft > 0 && (
              <div className="flex items-center gap-2">
                <Timer className={cn("h-5 w-5", timeIsLow ? "text-red-500" : "text-blue-500")} />
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Time Remaining</div>
                  <div
                    className={cn(
                      "text-xl font-bold font-mono",
                      timeIsLow ? "text-red-500 animate-pulse" : "text-blue-500",
                    )}
                  >
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Payment Details */}
      {isWaiting && (
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Copy className="h-5 w-5 text-purple-500" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Send Amount</label>
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                  <span className="font-mono text-lg">
                    {paymentData.payAmount} {paymentData.payCurrency.toUpperCase()}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(paymentData.payAmount.toString())}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">To Address</label>
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                  <span className="font-mono text-sm break-all">{paymentData.payAddress}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(paymentData.payAddress)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm text-green-500"
              >
                ✓ Copied to clipboard
              </motion.div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={cancelling} className="flex-1 bg-transparent">
                {cancelling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Payment"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {isSuccess && (
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground mb-4">
              Your tickets have been generated and sent to your email address.
            </p>
            <Badge className="bg-green-500 text-white">Payment ID: {paymentData.paymentId}</Badge>
          </CardContent>
        </Card>
      )}

      {/* Expired/Failed State */}
      {isExpired && (
        <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Payment {paymentData.paymentStatus === "expired" ? "Expired" : "Failed"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {paymentData.paymentStatus === "expired"
                ? "The payment window has expired and tickets have been released back to inventory."
                : "The payment could not be processed. Please try again."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
