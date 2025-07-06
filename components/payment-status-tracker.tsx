"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, AlertCircle, Copy, Loader2, XCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentStatusTrackerProps {
  paymentId: string
  onStatusChange?: (status: string) => void
}

interface PaymentData {
  paymentId: string
  paymentStatus: string
  payAddress?: string
  payAmount?: number
  payCurrency?: string
  actuallyPaid?: number
  updatedAt?: string
}

interface ReservationTime {
  valid: boolean
  timeRemaining: number
  expired: boolean
}

export function PaymentStatusTracker({ paymentId, onStatusChange }: PaymentStatusTrackerProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [reservationTime, setReservationTime] = useState<ReservationTime | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!paymentId) return

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payments/${paymentId}/status`)
        const data = await response.json()

        if (data.error) {
          setError(data.error)
          setLoading(false)
          return
        }

        setPaymentData({
          paymentId: data.paymentId || paymentId,
          paymentStatus: data.paymentStatus || data.status || "waiting",
          payAddress: data.payAddress,
          payAmount: data.payAmount,
          payCurrency: data.payCurrency,
          actuallyPaid: data.actuallyPaid,
          updatedAt: data.updatedAt,
        })

        // Call status change callback
        if (onStatusChange) {
          onStatusChange(data.paymentStatus || data.status || "waiting")
        }

        setLoading(false)
      } catch (err) {
        console.error("Error checking payment status:", err)
        setError("Failed to check payment status")
        setLoading(false)
      }
    }

    const checkReservationTime = async () => {
      try {
        const response = await fetch(`/api/tickets/reservation-time?paymentId=${paymentId}`)
        const data = await response.json()
        setReservationTime(data)
      } catch (err) {
        console.error("Error checking reservation time:", err)
      }
    }

    // Initial checks
    checkPaymentStatus()
    checkReservationTime()

    // Poll every 10 seconds for status updates
    const interval = setInterval(() => {
      checkPaymentStatus()
      checkReservationTime()
    }, 10000)

    return () => clearInterval(interval)
  }, [paymentId, onStatusChange])

  // Update countdown timer every second
  useEffect(() => {
    if (!reservationTime || !reservationTime.valid || reservationTime.timeRemaining <= 0) return

    const timer = setInterval(() => {
      setReservationTime((prev) => {
        if (!prev || prev.timeRemaining <= 1) {
          return { valid: false, timeRemaining: 0, expired: true }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [reservationTime])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
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
        setPaymentData((prev) => (prev ? { ...prev, paymentStatus: "cancelled" } : null))
        setReservationTime({ valid: false, timeRemaining: 0, expired: true })
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "waiting":
        return {
          icon: <Clock className="h-5 w-5" />,
          color: "bg-gradient-to-r from-blue-500 to-purple-500",
          textColor: "text-blue-300",
          bgColor: "bg-gradient-to-br from-blue-900/20 to-purple-900/20",
          borderColor: "border-blue-500/30",
          title: "Waiting for Payment",
          description: "Please send the exact amount to the address below",
        }
      case "confirming":
      case "partially_paid":
      case "confirmed":
      case "sending":
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin" />,
          color: "bg-gradient-to-r from-purple-500 to-pink-500",
          textColor: "text-purple-300",
          bgColor: "bg-gradient-to-br from-purple-900/20 to-pink-900/20",
          borderColor: "border-purple-500/30",
          title: "Confirming Payment",
          description: "Your payment has been detected and is being confirmed on the blockchain",
        }
      case "finished":
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          color: "bg-gradient-to-r from-green-500 to-emerald-500",
          textColor: "text-green-300",
          bgColor: "bg-gradient-to-br from-green-900/20 to-emerald-900/20",
          borderColor: "border-green-500/30",
          title: "Payment Completed",
          description: "Your ticket has been generated and sent to your email",
        }
      case "cancelled":
        return {
          icon: <XCircle className="h-5 w-5" />,
          color: "bg-gradient-to-r from-gray-500 to-slate-500",
          textColor: "text-gray-300",
          bgColor: "bg-gradient-to-br from-gray-900/20 to-slate-900/20",
          borderColor: "border-gray-500/30",
          title: "Payment Cancelled",
          description: "Your reservation has been cancelled and tickets released",
        }
      case "failed":
      case "refunded":
      case "expired":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: "bg-gradient-to-r from-red-500 to-pink-500",
          textColor: "text-red-300",
          bgColor: "bg-gradient-to-br from-red-900/20 to-pink-900/20",
          borderColor: "border-red-500/30",
          title: "Payment Failed",
          description: "There was an issue with your payment. Please try again.",
        }
      default:
        return {
          icon: <Clock className="h-5 w-5" />,
          color: "bg-gradient-to-r from-blue-500 to-purple-500",
          textColor: "text-blue-300",
          bgColor: "bg-gradient-to-br from-blue-900/20 to-purple-900/20",
          borderColor: "border-blue-500/30",
          title: "Waiting for Payment",
          description: "Please send the exact amount to the address below",
        }
    }
  }

  if (loading) {
    return (
      <Card className="border-blue-500/20">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading payment status...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-50/50">
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!paymentData) {
    return (
      <Card className="border-gray-500/20">
        <CardContent className="py-6">
          <div className="text-center text-gray-600">No payment data available</div>
        </CardContent>
      </Card>
    )
  }

  const statusInfo = getStatusInfo(paymentData.paymentStatus)

  return (
    <Card className={cn("border-2", statusInfo.borderColor, statusInfo.bgColor)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className={cn("p-2 rounded-full", statusInfo.color, "text-white")}>{statusInfo.icon}</div>
          <div>
            <div className={cn("text-lg font-semibold", statusInfo.textColor)}>{statusInfo.title}</div>
            <div className="text-sm text-muted-foreground">{statusInfo.description}</div>
          </div>
        </CardTitle>

        {/* Reservation Timer */}
        {paymentData.paymentStatus === "waiting" && reservationTime && (
          <div className="mt-3 p-3 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/30">
            {reservationTime.valid && reservationTime.timeRemaining > 0 ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-blue-300">Reservation expires in:</span>
                </div>
                <span className="text-lg font-mono font-bold text-blue-200">
                  {formatTime(reservationTime.timeRemaining)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Reservation has expired - please start a new order</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment Details - Show if waiting and not expired */}
        {paymentData.paymentStatus === "waiting" &&
          paymentData.payAddress &&
          paymentData.payAmount &&
          reservationTime?.valid && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Send exactly this amount:</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-3 py-2 rounded text-lg font-mono border border-slate-600">
                        {paymentData.payAmount} {paymentData.payCurrency?.toUpperCase()}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(paymentData.payAmount?.toString() || "")}
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">To this address:</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-3 py-2 rounded text-sm font-mono break-all flex-1 border border-slate-600">
                        {paymentData.payAddress}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(paymentData.payAddress || "")}
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
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
                  disabled={cancelling || reservationTime?.expired}
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
          )}

        {/* Payment Progress */}
        {paymentData.actuallyPaid !== undefined &&
          paymentData.actuallyPaid > 0 &&
          paymentData.payAmount !== undefined && (
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-4 rounded-lg border border-blue-500/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-300">Amount Received:</span>
                <span className="text-sm font-mono text-blue-100">
                  {paymentData.actuallyPaid} {paymentData.payCurrency?.toUpperCase()}
                </span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((paymentData.actuallyPaid / paymentData.payAmount) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={cn("capitalize", statusInfo.textColor)}>
            {paymentData.paymentStatus.replace("_", " ")}
          </Badge>
          {paymentData.updatedAt && (
            <span className="text-xs text-muted-foreground">
              Last updated: {new Date(paymentData.updatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Success Message */}
        {paymentData.paymentStatus === "finished" && (
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-4 rounded-lg border border-green-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-green-300">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Payment Successful!</span>
            </div>
            <p className="text-sm text-green-200 mt-1">
              Your ticket has been generated and sent to your email address.
            </p>
          </div>
        )}

        {/* Cancelled Message */}
        {paymentData.paymentStatus === "cancelled" && (
          <div className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-4 rounded-lg border border-gray-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Order Cancelled</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Your reservation has been cancelled and tickets have been released back to available stock.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
