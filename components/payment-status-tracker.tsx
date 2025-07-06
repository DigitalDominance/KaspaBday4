"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, AlertCircle, Copy, Loader2, Timer, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PaymentStorage } from "@/lib/payment-storage"

interface PaymentStatusTrackerProps {
  paymentId: string
  onStatusChange?: (status: string) => void
  onCancel?: () => void
}

interface PaymentData {
  paymentId: string
  paymentStatus: string
  payAddress?: string
  payAmount?: number
  payCurrency?: string
  actuallyPaid?: number
  updatedAt?: string
  expiresAt?: string
  orderId?: string
}

export function PaymentStatusTracker({ paymentId, onStatusChange, onCancel }: PaymentStatusTrackerProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
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

        const newPaymentData = {
          paymentId: data.paymentId || paymentId,
          paymentStatus: data.paymentStatus || data.status || "waiting",
          payAddress: data.payAddress,
          payAmount: data.payAmount,
          payCurrency: data.payCurrency,
          actuallyPaid: data.actuallyPaid,
          updatedAt: data.updatedAt,
          expiresAt: data.expiresAt,
          orderId: data.orderId,
        }

        setPaymentData(newPaymentData)

        // Call status change callback
        if (onStatusChange) {
          onStatusChange(newPaymentData.paymentStatus)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error checking payment status:", err)
        setError("Failed to check payment status")
        setLoading(false)
      }
    }

    // Initial check
    checkPaymentStatus()

    // Poll every 10 seconds for status updates
    const interval = setInterval(checkPaymentStatus, 10000)

    return () => clearInterval(interval)
  }, [paymentId, onStatusChange])

  // Timer countdown effect
  useEffect(() => {
    if (!paymentData?.expiresAt || paymentData.paymentStatus !== "waiting") {
      setTimeRemaining(null)
      return
    }

    const updateTimer = () => {
      const now = new Date().getTime()
      const expiry = new Date(paymentData.expiresAt!).getTime()
      const remaining = expiry - now

      if (remaining <= 0) {
        setTimeRemaining(0)
        // Trigger cleanup
        fetch("/api/tickets/cleanup-expired", { method: "POST" })
        return
      }

      setTimeRemaining(remaining)
    }

    // Update immediately
    updateTimer()

    // Update every second
    const timerInterval = setInterval(updateTimer, 1000)

    return () => clearInterval(timerInterval)
  }, [paymentData?.expiresAt, paymentData?.paymentStatus])

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleCancel = async () => {
    if (!paymentData?.paymentId) return

    setCancelling(true)
    try {
      const response = await fetch("/api/tickets/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: paymentData.paymentId }),
      })

      const data = await response.json()

      if (data.success) {
        // Remove from local storage
        PaymentStorage.removePayment(paymentData.paymentId)

        // Update status
        setPaymentData((prev) => (prev ? { ...prev, paymentStatus: "cancelled" } : null))

        // Call callbacks
        if (onStatusChange) onStatusChange("cancelled")
        if (onCancel) onCancel()
      } else {
        alert(data.error || "Failed to cancel payment")
      }
    } catch (error) {
      console.error("Cancel error:", error)
      alert("Failed to cancel payment")
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
          icon: <X className="h-5 w-5" />,
          color: "bg-gradient-to-r from-gray-500 to-slate-500",
          textColor: "text-gray-300",
          bgColor: "bg-gradient-to-br from-gray-900/20 to-slate-900/20",
          borderColor: "border-gray-500/30",
          title: "Payment Cancelled",
          description: "This payment has been cancelled and the reservation released",
        }
      case "expired":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: "bg-gradient-to-r from-orange-500 to-red-500",
          textColor: "text-orange-300",
          bgColor: "bg-gradient-to-br from-orange-900/20 to-red-900/20",
          borderColor: "border-orange-500/30",
          title: "Payment Expired",
          description: "This payment has expired and the reservation has been released",
        }
      case "failed":
      case "refunded":
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
          <div className="flex-1">
            <div className={cn("text-lg font-semibold", statusInfo.textColor)}>{statusInfo.title}</div>
            <div className="text-sm text-muted-foreground">{statusInfo.description}</div>
          </div>
          {/* Timer Display */}
          {timeRemaining !== null && timeRemaining > 0 && paymentData.paymentStatus === "waiting" && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-3 py-2 rounded-lg border border-orange-500/30">
              <Timer className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-mono text-orange-300">{formatTimeRemaining(timeRemaining)}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Expiration Warning */}
        {timeRemaining !== null &&
          timeRemaining > 0 &&
          timeRemaining < 5 * 60 * 1000 &&
          paymentData.paymentStatus === "waiting" && (
            <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 p-4 rounded-lg border border-orange-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-orange-300">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Reservation Expiring Soon!</span>
              </div>
              <p className="text-sm text-orange-200 mt-1">
                Your ticket reservation will expire in {formatTimeRemaining(timeRemaining)}. Complete your payment to
                secure your tickets.
              </p>
            </div>
          )}

        {/* Payment Details - Show if waiting or confirming */}
        {paymentData.payAddress &&
          paymentData.payAmount &&
          (paymentData.paymentStatus === "waiting" || paymentData.paymentStatus === "confirming") && (
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

              {/* Cancel Button - Only show for waiting payments */}
              {paymentData.paymentStatus === "waiting" && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 bg-transparent"
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancel Payment
                      </>
                    )}
                  </Button>
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

        {(paymentData.paymentStatus === "cancelled" || paymentData.paymentStatus === "expired") && (
          <div className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-4 rounded-lg border border-gray-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">
                {paymentData.paymentStatus === "cancelled" ? "Payment Cancelled" : "Payment Expired"}
              </span>
            </div>
            <p className="text-sm text-gray-200 mt-1">
              The ticket reservation has been released and is now available for others to purchase.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
