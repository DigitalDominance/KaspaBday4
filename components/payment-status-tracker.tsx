"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, AlertCircle, Copy, ExternalLink, Loader2 } from "lucide-react"
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

export function PaymentStatusTracker({ paymentId, onStatusChange }: PaymentStatusTrackerProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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

    // Initial check
    checkPaymentStatus()

    // Poll every 10 seconds for status updates
    const interval = setInterval(checkPaymentStatus, 10000)

    return () => clearInterval(interval)
  }, [paymentId, onStatusChange])

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
          color: "bg-gradient-to-r from-blue-500 to-purple-600",
          textColor: "text-blue-300",
          bgGradient: "bg-gradient-to-br from-blue-500/10 to-purple-500/10",
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
          color: "bg-gradient-to-r from-purple-500 to-pink-600",
          textColor: "text-purple-300",
          bgGradient: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
          borderColor: "border-purple-500/30",
          title: "Confirming Payment",
          description: "Your payment has been detected and is being confirmed on the blockchain",
        }
      case "finished":
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          color: "bg-gradient-to-r from-green-500 to-blue-600",
          textColor: "text-green-300",
          bgGradient: "bg-gradient-to-br from-green-500/10 to-blue-500/10",
          borderColor: "border-green-500/30",
          title: "Payment Completed",
          description: "Your ticket has been generated and sent to your email",
        }
      case "failed":
      case "refunded":
      case "expired":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: "bg-gradient-to-r from-red-500 to-pink-600",
          textColor: "text-red-300",
          bgGradient: "bg-gradient-to-br from-red-500/10 to-pink-500/10",
          borderColor: "border-red-500/30",
          title: "Payment Failed",
          description: "There was an issue with your payment. Please try again.",
        }
      default:
        return {
          icon: <Clock className="h-5 w-5" />,
          color: "bg-gradient-to-r from-blue-500 to-purple-600",
          textColor: "text-blue-300",
          bgGradient: "bg-gradient-to-br from-blue-500/10 to-purple-500/10",
          borderColor: "border-blue-500/30",
          title: "Waiting for Payment",
          description: "Please send the exact amount to the address below",
        }
    }
  }

  if (loading) {
    return (
      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-400" />
          <span className="text-foreground">Loading payment status...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-pink-500/5">
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!paymentData) {
    return (
      <Card className="border-gray-500/20 bg-gradient-to-br from-gray-500/5 to-slate-500/5">
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">No payment data available</div>
        </CardContent>
      </Card>
    )
  }

  const statusInfo = getStatusInfo(paymentData.paymentStatus)

  return (
    <Card className={cn("border-2", statusInfo.borderColor, statusInfo.bgGradient)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className={cn("p-2 rounded-full text-white", statusInfo.color)}>{statusInfo.icon}</div>
          <div>
            <div className="text-lg font-semibold text-foreground">{statusInfo.title}</div>
            <div className="text-sm text-muted-foreground">{statusInfo.description}</div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment Details - Always show if available */}
        {paymentData.payAddress && paymentData.payAmount && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-lg border border-slate-700/50 backdrop-blur-sm">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Send exactly this amount:</label>
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 px-4 py-3 rounded-lg flex-1">
                      <code className="text-lg font-mono text-white font-bold">
                        {paymentData.payAmount} {paymentData.payCurrency?.toUpperCase()}
                      </code>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(paymentData.payAmount?.toString() || "")}
                      className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">To this address:</label>
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 px-4 py-3 rounded-lg flex-1">
                      <code className="text-sm font-mono text-white break-all leading-relaxed">
                        {paymentData.payAddress}
                      </code>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(paymentData.payAddress || "")}
                      className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-white"
                    >
                      {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Progress */}
            {paymentData.actuallyPaid && paymentData.actuallyPaid > 0 && (
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 rounded-lg border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-300">Amount Received:</span>
                  <span className="text-sm font-mono text-white">
                    {paymentData.actuallyPaid} {paymentData.payCurrency?.toUpperCase()}
                  </span>
                </div>
                {paymentData.payAmount && (
                  <div className="mt-2">
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((paymentData.actuallyPaid / paymentData.payAmount) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={cn("capitalize border-current", statusInfo.textColor)}>
            {paymentData.paymentStatus.replace("_", " ")}
          </Badge>
          {paymentData.updatedAt && (
            <span className="text-xs text-muted-foreground">
              Last updated: {new Date(paymentData.updatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {paymentData.paymentStatus === "waiting" && paymentData.payAddress && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://blockchair.com/search?q=${paymentData.payAddress}`, "_blank")}
              className="flex-1 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </Button>
          </div>
        )}

        {paymentData.paymentStatus === "finished" && (
          <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-4 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Payment Successful!</span>
            </div>
            <p className="text-sm text-green-300 mt-1">
              Your ticket has been generated and sent to your email address.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
