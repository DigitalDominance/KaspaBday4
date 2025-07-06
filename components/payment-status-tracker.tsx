"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Clock, CheckCircle, XCircle, AlertTriangle, Copy, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentStatusTrackerProps {
  paymentId: string
  onStatusChange?: (status: string) => void
  onCancel?: () => void
}

interface PaymentData {
  payment: {
    paymentId: string
    paymentStatus: string
    payAddress: string
    payAmount: number
    payCurrency: string
    actuallyPaid?: number
    createdAt: string
    updatedAt: string
  }
  order: {
    orderId: string
    customerName: string
    customerEmail: string
    ticketType: string
    quantity: number
    totalAmount: string
    expiresAt: string
    timeRemaining: number
    expired: boolean
  }
}

export function PaymentStatusTracker({ paymentId, onStatusChange, onCancel }: PaymentStatusTrackerProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/status`)
      const data = await response.json()

      if (data.success) {
        setPaymentData(data)
        setTimeRemaining(data.order.timeRemaining)
        onStatusChange?.(data.payment.paymentStatus)
      } else {
        setError(data.error || "Failed to fetch payment status")
      }
    } catch (err) {
      setError("Network error occurred")
      console.error("Payment status fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Update timer every second
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = Math.max(0, prev - 1000)
          if (newTime === 0) {
            // Timer expired, refresh payment status
            fetchPaymentStatus()
          }
          return newTime
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeRemaining])

  // Fetch payment status initially and periodically
  useEffect(() => {
    fetchPaymentStatus()

    const interval = setInterval(fetchPaymentStatus, 10000) // Every 10 seconds
    return () => clearInterval(interval)
  }, [paymentId])

  const handleCancel = async () => {
    if (!paymentData) return

    try {
      const response = await fetch("/api/tickets/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: paymentData.order.orderId,
        }),
      })

      const data = await response.json()
      if (data.success) {
        onCancel?.()
      } else {
        alert(data.error || "Failed to cancel payment")
      }
    } catch (error) {
      console.error("Cancel error:", error)
      alert("Failed to cancel payment")
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-500"
      case "confirming":
        return "bg-blue-500"
      case "finished":
        return "bg-green-500"
      case "failed":
      case "expired":
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <Clock className="h-4 w-4" />
      case "confirming":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "finished":
        return <CheckCircle className="h-4 w-4" />
      case "failed":
      case "expired":
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading payment status...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-red-600">
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!paymentData) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>No payment data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { payment, order } = paymentData
  const isExpired = timeRemaining <= 0 || order.expired
  const isLowTime = timeRemaining <= 300000 // 5 minutes

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Payment Status</CardTitle>
          {!isExpired && timeRemaining > 0 && (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                isLowTime ? "bg-red-100 text-red-800 animate-pulse" : "bg-blue-100 text-blue-800",
              )}
            >
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeRemaining)} remaining</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge className={cn("text-white", getStatusColor(payment.paymentStatus))}>
            {getStatusIcon(payment.paymentStatus)}
            <span className="ml-1 capitalize">{payment.paymentStatus}</span>
          </Badge>
          {isExpired && (
            <Badge variant="destructive">
              <XCircle className="h-4 w-4 mr-1" />
              Expired
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Details */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Order Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Order ID:</div>
            <div className="font-mono">{order.orderId}</div>
            <div>Ticket Type:</div>
            <div>{order.ticketType}</div>
            <div>Quantity:</div>
            <div>{order.quantity}</div>
            <div>Total:</div>
            <div>${order.totalAmount}</div>
          </div>
        </div>

        {/* Payment Details */}
        {payment.paymentStatus === "waiting" && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-yellow-800">Send Payment</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-yellow-700">Pay to this address:</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-white px-2 py-1 rounded text-xs break-all flex-1">{payment.payAddress}</code>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(payment.payAddress)}>
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-yellow-700">Amount:</label>
                <div className="text-lg font-bold text-yellow-800">
                  {payment.payAmount} {payment.payCurrency.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {payment.paymentStatus === "waiting" && !isExpired && (
            <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
              Cancel Payment
            </Button>
          )}

          <Button onClick={() => window.open(`/ticket-success?order=${order.orderId}`, "_blank")} className="flex-1">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Full Tracker
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
