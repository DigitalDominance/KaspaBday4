"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, RefreshCw, Mail, AlertTriangle, CheckCircle } from "lucide-react"
import { Space_Grotesk } from "next/font/google"
import { cn } from "@/lib/utils"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })

export default function PaymentDebugPage() {
  const [paymentId, setPaymentId] = useState("")
  const [orderId, setOrderId] = useState("")
  const [loading, setLoading] = useState(false)
  const [forceLoading, setForceLoading] = useState(false)
  const [debugData, setDebugData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const debugPayment = async () => {
    if (!paymentId && !orderId) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (paymentId) params.append("paymentId", paymentId)
      if (orderId) params.append("orderId", orderId)

      const response = await fetch(`/api/admin/payment-debug?${params}`)
      const data = await response.json()

      if (response.ok) {
        setDebugData(data)
      } else {
        setError(data.error || "Failed to debug payment")
      }
    } catch (error) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const forceTicketGeneration = async () => {
    if (!debugData) return

    setForceLoading(true)

    try {
      const response = await fetch("/api/admin/force-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: debugData.paymentId,
          orderId: debugData.orderId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ Ticket generated and sent to ${data.customerEmail}`)
        // Refresh debug data
        debugPayment()
      } else {
        alert(`❌ Failed: ${data.error}`)
      }
    } catch (error) {
      alert("❌ Network error occurred")
    } finally {
      setForceLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      finished: "bg-green-500",
      confirmed: "bg-blue-500",
      waiting: "bg-yellow-500",
      failed: "bg-red-500",
      expired: "bg-gray-500",
    }
    return <Badge className={cn("text-white", colors[status as keyof typeof colors] || "bg-gray-500")}>{status}</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="container mx-auto max-w-4xl pt-20">
        <div className="text-center mb-8">
          <h1
            className={cn(
              "text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400",
              spaceGrotesk.className,
            )}
          >
            Payment Debug Tool
          </h1>
          <p className="text-muted-foreground">Debug payment status and force ticket generation</p>
        </div>

        {/* Search Form */}
        <Card className="border-blue-500/20 mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-500" />
              Search Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentId">Payment ID</Label>
                <Input
                  id="paymentId"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  placeholder="Enter NOWPayments payment ID"
                  className="border-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter order ID (KASPA-...)"
                  className="border-blue-500/20"
                />
              </div>
            </div>
            <Button
              onClick={debugPayment}
              disabled={(!paymentId && !orderId) || loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Debugging...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Debug Payment
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Debug Results */}
        {debugData && (
          <div className="space-y-6">
            {/* Payment Info */}
            <Card className="border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-lg">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Payment ID:</span>
                    <p className="font-mono font-medium">{debugData.paymentId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Order ID:</span>
                    <p className="font-mono font-medium">{debugData.orderId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Comparison */}
            <Card className="border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-lg">Status Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Individual Endpoint */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Individual Endpoint</h4>
                    {debugData.individualEndpoint !== "Failed to fetch" ? (
                      <div className="space-y-1 text-sm">
                        <div>Status: {getStatusBadge(debugData.individualEndpoint.payment_status)}</div>
                        <div>Paid: {debugData.individualEndpoint.actually_paid || "0"}</div>
                        <div>Updated: {new Date(debugData.individualEndpoint.updated_at).toLocaleString()}</div>
                      </div>
                    ) : (
                      <Badge className="bg-red-500 text-white">Failed</Badge>
                    )}
                  </div>

                  {/* List Endpoint */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">List Endpoint</h4>
                    {debugData.listEndpoint !== "Failed to fetch" ? (
                      <div className="space-y-1 text-sm">
                        <div>Status: {getStatusBadge(debugData.listEndpoint.payment_status)}</div>
                        <div>Paid: {debugData.listEndpoint.actually_paid || "0"}</div>
                        <div>Updated: {new Date(debugData.listEndpoint.updated_at).toLocaleString()}</div>
                      </div>
                    ) : (
                      <Badge className="bg-red-500 text-white">Failed</Badge>
                    )}
                  </div>

                  {/* Database */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Database</h4>
                    {debugData.databaseStatus !== "Not found" ? (
                      <div className="space-y-1 text-sm">
                        <div>Status: {getStatusBadge(debugData.databaseStatus.paymentStatus)}</div>
                        <div>Email Sent: {debugData.databaseStatus.emailSent ? "✅" : "❌"}</div>
                        <div>QR Code: {debugData.databaseStatus.qrCode}</div>
                        <div>Updated: {new Date(debugData.databaseStatus.updatedAt).toLocaleString()}</div>
                      </div>
                    ) : (
                      <Badge className="bg-red-500 text-white">Not Found</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="border-green-500/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Use List Endpoint:</h4>
                    <Badge
                      className={
                        debugData.recommendations.useListEndpoint.includes("YES") ? "bg-green-500" : "bg-blue-500"
                      }
                    >
                      {debugData.recommendations.useListEndpoint}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Needs Ticket Generation:</h4>
                    <Badge
                      className={
                        debugData.recommendations.needsTicketGeneration === "YES" ? "bg-red-500" : "bg-green-500"
                      }
                    >
                      {debugData.recommendations.needsTicketGeneration}
                    </Badge>
                  </div>
                </div>

                {debugData.recommendations.needsTicketGeneration === "YES" && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={forceTicketGeneration}
                      disabled={forceLoading}
                      className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
                    >
                      {forceLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Ticket...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Force Generate & Send Ticket
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Refresh Button */}
            <div className="text-center">
              <Button variant="outline" onClick={debugPayment} disabled={loading} className="bg-transparent">
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Refresh Debug Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
