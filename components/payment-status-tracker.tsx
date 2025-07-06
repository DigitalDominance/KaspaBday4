"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Copy, CheckCircle, Clock, AlertTriangle, XCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Space_Grotesk } from "next/font/google"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })

interface PaymentStatusTrackerProps {
  paymentId: string
  onStatusChange?: (status: string) => void
}

interface PaymentStatus {
  payment_id: string
  payment_status: string
  pay_address: string
  pay_amount: number
  pay_currency: string
  price_amount: number
  price_currency: string
  order_id: string
  order_description: string
  created_at: string
  updated_at: string
}

interface ReservationTime {
  valid: boolean
  timeRemaining: number
  expired: boolean
}

export function PaymentStatusTracker({ paymentId, onStatusChange }: PaymentStatusTrackerProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [reservationTime, setReservationTime] = useState<ReservationTime | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<{ amount: boolean; address: boolean }>({
    amount: false,
    address: false,
  })
  const [cancelling, setCancelling] = useState(false)

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/status`)
      const data = await response.json()

      if (data.success) {
        setPaymentStatus(data.payment)
        onStatusChange?.(data.payment.payment_status)
      } else {
        setError(data.error || "Failed to fetch payment status")
      }
    } catch (err) {
      setError("Network error occurred")
    }
  }

  const fetchReservationTime = async () => {
    try {
      const response = await fetch(`/api/tickets/reservation-time?paymentId=${paymentId}`)
      const data = await response.json()
      setReservationTime(data)
    } catch (err) {
      console.error("Failed to fetch reservation time:", err)
    }
  }

  const cancelReservation = async () => {
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
        // Update status to cancelled
        setPaymentStatus((prev) => (prev ? { ...prev, payment_status: "cancelled" } : null))
        onStatusChange?.("cancelled")
      } else {
        setError(data.error || "Failed to cancel reservation")
      }
    } catch (err) {
      setError("Failed to cancel reservation")
    } finally {
      setCancelling(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchPaymentStatus(), fetchReservationTime()])
      setLoading(false)
    }

    loadData()

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchPaymentStatus()
      fetchReservationTime()
    }, 30000)

    return () => clearInterval(interval)
  }, [paymentId])

  // Update reservation time every second
  useEffect(() => {
    if (!reservationTime || !reservationTime.valid) return

    const timer = setInterval(() => {
      setReservationTime((prev) => {
        if (!prev || prev.timeRemaining <= 0) {
          return { valid: false, timeRemaining: 0, expired: true }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [reservationTime])

  const copyToClipboard = async (text: string, type: "amount" | "address") => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied((prev) => ({ ...prev, [type]: true }))
      setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "waiting":
        return {
          label: "Waiting for Payment",
          icon: Clock,
          variant: "secondary" as const,
          bgClass: "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20",
          iconClass: "text-blue-500",
        }
      case "confirming":
        return {
          label: "Confirming Payment",
          icon: Loader2,
          variant: "secondary" as const,
          bgClass: "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20",
          iconClass: "text-yellow-500 animate-spin",
        }
      case "confirmed":
        return {
          label: "Payment Confirmed",
          icon: CheckCircle,
          variant: "secondary" as const,
          bgClass: "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20",
          iconClass: "text-green-500",
        }
      case "sending":
        return {
          label: "Processing",
          icon: RefreshCw,
          variant: "secondary" as const,
          bgClass: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20",
          iconClass: "text-blue-500 animate-spin",
        }
      case "finished":
        return {
          label: "Payment Complete",
          icon: CheckCircle,
          variant: "default" as const,
          bgClass: "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20",
          iconClass: "text-green-500",
        }
      case "failed":
        return {
          label: "Payment Failed",
          icon: XCircle,
          variant: "destructive" as const,
          bgClass: "bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20",
          iconClass: "text-red-500",
        }
      case "cancelled":
        return {
          label: "Payment Cancelled",
          icon: XCircle,
          variant: "secondary" as const,
          bgClass: "bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-500/20",
          iconClass: "text-gray-500",
        }
      default:
        return {
          label: "Unknown Status",
          icon: AlertTriangle,
          variant: "secondary" as const,
          bgClass: "bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-500/20",
          iconClass: "text-gray-500",
        }
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <Card className="border-blue-500/20">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-muted-foreground">Loading payment status...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-pink-500/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!paymentStatus) {
    return (
      <Card className="border-gray-500/20">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Payment information not found</div>
        </CardContent>
      </Card>
    )
  }

  const statusInfo = getStatusInfo(paymentStatus.payment_status)
  const StatusIcon = statusInfo.icon

  return (
    <Card className={cn("border transition-all duration-300", statusInfo.bgClass)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <StatusIcon className={cn("h-6 w-6", statusInfo.iconClass)} />
          <span className={cn("text-lg", spaceGrotesk.className)}>{statusInfo.label}</span>
          <Badge variant={statusInfo.variant} className="ml-auto">
            {paymentStatus.payment_status.toUpperCase()}
          </Badge>
        </CardTitle>

        {/* Reservation Timer */}
        {paymentStatus.payment_status === "waiting" && reservationTime && (
          <div className="mt-2">
            {reservationTime.valid && reservationTime.timeRemaining > 0 ? (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-blue-400">
                  Reservation expires in:{" "}
                  <span className="font-mono font-bold">{formatTime(reservationTime.timeRemaining)}</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Reservation has expired</span>
              </div>
            )}
          </div>
        )}

        {paymentStatus.payment_status === "waiting" && (
          <p className="text-sm text-muted-foreground mt-2">Please send the exact amount to the address below</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {paymentStatus.payment_status === "waiting" && (
          <>
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Send exactly this amount:</label>
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-900/50 border border-slate-600/50 rounded px-3 py-2 font-mono text-white flex-1">
                        {paymentStatus.pay_amount} {paymentStatus.pay_currency.toUpperCase()}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(paymentStatus.pay_amount.toString(), "amount")}
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        {copied.amount ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">To this address:</label>
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-900/50 border border-slate-600/50 rounded px-3 py-2 font-mono text-white flex-1 break-all text-sm">
                        {paymentStatus.pay_address}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(paymentStatus.pay_address, "address")}
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        {copied.address ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancel Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelReservation}
                  disabled={cancelling || (reservationTime?.expired ?? false)}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 bg-transparent"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Order
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {paymentStatus.payment_status === "finished" && (
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Payment completed successfully!</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Your tickets have been confirmed and sent to your email.
            </p>
          </div>
        )}

        {paymentStatus.payment_status === "cancelled" && (
          <div className="bg-gradient-to-r from-gray-500/10 to-slate-500/10 border border-gray-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Order has been cancelled</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Your ticket reservation has been released. You can start a new order.
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Payment ID:</span>
            <span className="font-mono">{paymentStatus.payment_id}</span>
          </div>
          <div className="flex justify-between">
            <span>Order ID:</span>
            <span className="font-mono">{paymentStatus.order_id}</span>
          </div>
          <div className="flex justify-between">
            <span>Last updated:</span>
            <span>{new Date(paymentStatus.updated_at).toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
