"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Copy, X, ExternalLink, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaymentData {
  orderId: string
  paymentId: string
  payAddress: string
  payAmount: string
  payCurrency: string
  paymentStatus: string
  expiresAt?: string
  ticketType?: string
  quantity?: number
}

interface PaymentStatusTrackerProps {
  paymentData: PaymentData
  onCancel?: () => void
  onClose?: () => void
  showModal?: boolean
}

export function PaymentStatusTracker({ paymentData, onCancel, onClose, showModal = false }: PaymentStatusTrackerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [status, setStatus] = useState(paymentData.paymentStatus)
  const [isExpired, setIsExpired] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const { toast } = useToast()

  // Calculate time remaining
  useEffect(() => {
    if (!paymentData.expiresAt || status !== "waiting") return

    const updateTimer = () => {
      const now = new Date().getTime()
      const expiry = new Date(paymentData.expiresAt!).getTime()
      const remaining = expiry - now

      if (remaining <= 0) {
        setTimeLeft(0)
        setIsExpired(true)
        setStatus("expired")
      } else {
        setTimeLeft(remaining)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [paymentData.expiresAt, status])

  // Format time remaining
  const formatTimeLeft = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      })
    }
  }

  // Handle cancel payment
  const handleCancel = async () => {
    if (!onCancel) return

    setIsCancelling(true)
    try {
      const response = await fetch("/api/tickets/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: paymentData.paymentId,
          orderId: paymentData.orderId,
        }),
      })

      if (response.ok) {
        setStatus("cancelled")
        toast({
          title: "Payment Cancelled",
          description: "Your reservation has been released",
        })
        onCancel()
      } else {
        const error = await response.json()
        toast({
          title: "Cancellation Failed",
          description: error.error || "Failed to cancel payment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel payment",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  // Get status color and icon
  const getStatusInfo = () => {
    switch (status) {
      case "waiting":
        return {
          color: "bg-blue-500",
          icon: <Clock className="w-4 h-4" />,
          text: "Waiting for Payment",
        }
      case "confirming":
        return {
          color: "bg-yellow-500",
          icon: <Clock className="w-4 h-4" />,
          text: "Confirming Payment",
        }
      case "confirmed":
      case "finished":
        return {
          color: "bg-green-500",
          icon: <Clock className="w-4 h-4" />,
          text: "Payment Confirmed",
        }
      case "cancelled":
        return {
          color: "bg-red-500",
          icon: <X className="w-4 h-4" />,
          text: "Payment Cancelled",
        }
      case "expired":
        return {
          color: "bg-gray-500",
          icon: <AlertTriangle className="w-4 h-4" />,
          text: "Payment Expired",
        }
      default:
        return {
          color: "bg-gray-500",
          icon: <Clock className="w-4 h-4" />,
          text: "Unknown Status",
        }
    }
  }

  const statusInfo = getStatusInfo()
  const isWaiting = status === "waiting" && !isExpired
  const showTimer = isWaiting && timeLeft !== null
  const isLowTime = timeLeft !== null && timeLeft < 5 * 60 * 1000 // Less than 5 minutes

  const content = (
    <div className="space-y-6">
      {/* Header with status and timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${statusInfo.color} text-white`}>{statusInfo.icon}</div>
          <div>
            <h3 className="font-semibold text-white">{statusInfo.text}</h3>
            <p className="text-sm text-gray-400">Please send the exact amount to the address below</p>
          </div>
        </div>

        {/* Timer Display */}
        {showTimer && (
          <div className={`text-right ${isLowTime ? "text-red-400" : "text-white"}`}>
            <div className="text-sm text-gray-400">Time remaining:</div>
            <div className={`text-lg font-mono font-bold ${isLowTime ? "animate-pulse" : ""}`}>
              {formatTimeLeft(timeLeft)}
            </div>
            {isLowTime && (
              <div className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Hurry up!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Details */}
      {isWaiting && (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Send exactly this amount:</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 font-mono text-white">
                  {paymentData.payAmount} {paymentData.payCurrency.toUpperCase()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(paymentData.payAmount, "Amount")}
                  className="border-gray-600 hover:bg-gray-700"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">To this address:</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 font-mono text-white break-all">
                  {paymentData.payAddress}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(paymentData.payAddress, "Address")}
                  className="border-gray-600 hover:bg-gray-700"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          <div className="flex justify-center">
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              <X className="w-4 h-4 mr-2" />
              {isCancelling ? "Cancelling..." : "Cancel Payment"}
            </Button>
          </div>
        </>
      )}

      {/* Status Messages for non-waiting states */}
      {!isWaiting && (
        <div className="text-center py-8">
          {status === "cancelled" && <p className="text-gray-400">Payment was cancelled and reservation released.</p>}
          {status === "expired" && <p className="text-gray-400">Payment expired and reservation was released.</p>}
          {(status === "confirmed" || status === "finished") && (
            <p className="text-green-400">Payment confirmed! Check your email for tickets.</p>
          )}
        </div>
      )}

      {/* Footer with status and timestamp */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <Badge variant="secondary" className="bg-gray-700 text-gray-300">
          {status === "waiting" ? "Waiting" : status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  )

  if (showModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Payment Tracking - {paymentData.ticketType} Pass</h2>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {content}
            {!isWaiting && (
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-gray-600 hover:bg-gray-700 bg-transparent"
                >
                  Close & Track Later
                </Button>
                <Button
                  onClick={() => window.open(`/payment-tracker?payment=${paymentData.paymentId}`, "_blank")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Tracker Page
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardContent className="p-6">{content}</CardContent>
    </Card>
  )
}
