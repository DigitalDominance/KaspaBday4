"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle, AlertCircle, XCircle, Copy, Timer, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentStatusTrackerProps {
  paymentId: string
  onStatusChange?: (status: string) => void
}

export function PaymentStatusTracker({ paymentId, onStatusChange }: PaymentStatusTrackerProps) {
  const [status, setStatus] = useState<string>("waiting")
  const [paymentData, setPaymentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [reservationExpired, setReservationExpired] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // Fetch payment status
  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/status`)
      const data = await response.json()

      if (data.success) {
        setPaymentData(data.payment)
        setStatus(data.payment.payment_status)
        onStatusChange?.(data.payment.payment_status)
      }
    } catch (error) {
      console.error("Failed to fetch payment status:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch reservation time
  const fetchReservationTime = async () => {
    try {
      const response = await fetch(`/api/tickets/reservation-time?paymentId=${paymentId}`)
      const data = await response.json()

      if (data.success) {
        setTimeRemaining(data.timeRemaining)
        setReservationExpired(data.expired)
      }
    } catch (error) {
      console.error("Failed to fetch reservation time:", error)
    }
  }

  // Cancel reservation
  const handleCancelReservation = async () => {
    setCancelling(true)
    try {
      const response = await fetch("/api/tickets/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentId }),
      })

      const data = await response.json()
      if (data.success) {
        setStatus("cancelled")
        onStatusChange?.("cancelled")
      } else {
        alert(data.error || "Failed to cancel reservation")
      }
    } catch (error) {
      console.error("Failed to cancel reservation:", error)
      alert("Failed to cancel reservation")
    } finally {
      setCancelling(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const totalTime = 15 * 60 // 15 minutes in seconds
    return Math.max(0, ((totalTime - timeRemaining) / totalTime) * 100)
  }

  useEffect(() => {
    fetchPaymentStatus()
    fetchReservationTime()

    // Set up polling for status updates
    const statusInterval = setInterval(fetchPaymentStatus, 10000) // Every 10 seconds
    const timeInterval = setInterval(fetchReservationTime, 1000) // Every second

    return () => {
      clearInterval(statusInterval)
      clearInterval(timeInterval)
    }
  }, [paymentId])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = () => {
    switch (status) {
      case "waiting":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "confirming":
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      case "confirmed":
      case "finished":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "failed":
      case "refunded":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "cancelled":
        return <X className="h-5 w-5 text-gray-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "waiting":
        return "bg-yellow-500"
      case "confirming":
        return "bg-blue-500"
      case "confirmed":
      case "finished":
        return "bg-green-500"
      case "failed":
      case "refunded":
        return "bg-red-500"
      case "cancelled":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "waiting":
        return "Waiting for Payment"
      case "confirming":
        return "Confirming Payment"
      case "confirmed":
      case "finished":
        return "Payment Confirmed"
      case "failed":
        return "Payment Failed"
      case "refunded":
        return "Payment Refunded"
      case "cancelled":
        return "Order Cancelled"
      default:
        return "Unknown Status"
    }
  }

  return (
    <div className="space-y-4">
      {/* Reservation Timer */}
      {status === "waiting" && !reservationExpired && (
        <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="h-5 w-5 text-yellow-500" />
              Reservation Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{formatTimeRemaining(timeRemaining)}</div>
              <p className="text-sm text-muted-foreground">Time remaining to complete payment</p>
            </div>

            <Progress value={getProgressPercentage()} className="h-2" />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancelReservation}
                disabled={cancelling || reservationExpired}
                className="flex-1 border-red-500/20 text-red-600 hover:bg-red-500/10 bg-transparent"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reservation Expired */}
      {reservationExpired && status === "waiting" && (
        <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-red-600/5">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">Reservation Expired</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your 15-minute reservation has expired. Please start a new order.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Start New Order
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment Status */}
      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {getStatusIcon()}
            Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge className={cn("text-white", getStatusColor())}>{getStatusText()}</Badge>
          </div>

          {paymentData && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment ID:</span>
                  <span className="text-sm font-mono">{paymentData.payment_id}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-sm font-semibold">
                    {paymentData.pay_amount} {paymentData.pay_currency?.toUpperCase()}
                  </span>
                </div>

                {paymentData.pay_address && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Payment Address:</span>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <code className="text-xs flex-1 break-all">{paymentData.pay_address}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(paymentData.pay_address)}
                        className="shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {copied && <p className="text-xs text-green-600">Address copied to clipboard!</p>}
                  </div>
                )}
              </div>

              {status === "finished" && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Payment Confirmed!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your tickets have been generated and sent to your email.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
