"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, Mail, Calendar, Loader2, Clock, AlertCircle } from "lucide-react"
import { Space_Grotesk } from "next/font/google"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })

export default function TicketSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order")
  const [ticketData, setTicketData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) {
      fetchTicketData()
      // Poll for payment status updates
      const interval = setInterval(fetchTicketData, 10000) // Check every 10 seconds
      return () => clearInterval(interval)
    }
  }, [orderId])

  const fetchTicketData = async () => {
    try {
      const response = await fetch(`/api/tickets/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setTicketData(data)
        setError(null)
      } else {
        setError("Ticket not found")
      }
    } catch (error) {
      console.error("Failed to fetch ticket:", error)
      setError("Failed to load ticket data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl font-bold mb-2">Loading your ticket...</h2>
            <p className="text-muted-foreground">Please wait while we fetch your ticket information</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !ticketData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold mb-2">Ticket Not Found</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => (window.location.href = "/tickets")}>Back to Tickets</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finished":
        return "bg-green-500"
      case "partially_paid":
        return "bg-yellow-500"
      case "waiting":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "finished":
        return "Payment Confirmed"
      case "partially_paid":
        return "Partially Paid"
      case "waiting":
        return "Awaiting Payment"
      default:
        return "Processing"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
            >
              {ticketData.paymentStatus === "finished" ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <Clock className="w-8 h-8 text-white" />
              )}
            </motion.div>
            <CardTitle className={cn("text-2xl", spaceGrotesk.className)}>
              {ticketData.paymentStatus === "finished" ? "Payment Successful!" : "Payment Processing"}
            </CardTitle>
            <Badge className={cn("mt-2", getStatusColor(ticketData.paymentStatus))}>
              {getStatusText(ticketData.paymentStatus)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {ticketData.paymentStatus === "finished"
                  ? "Your ticket has been confirmed and sent to your email."
                  : "Your payment is being processed. You will receive your ticket once payment is confirmed."}
              </p>
            </div>

            {/* Ticket Preview */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700">
              <div className="text-center space-y-4">
                {ticketData.qrCode ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    src={ticketData.qrCode}
                    alt="Ticket QR Code"
                    className="w-32 h-32 mx-auto border rounded-lg"
                  />
                ) : (
                  <div className="w-32 h-32 mx-auto border rounded-lg bg-muted flex items-center justify-center">
                    <Clock className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Kaspa's 4th Birthday
                  </h3>
                  <p className="text-sm text-muted-foreground">November 7-9, 2025</p>
                  <p className="text-sm text-muted-foreground">Liverpool, NY</p>
                </div>
                <div className="border-t pt-4">
                  <p className="font-medium">{ticketData.customerName}</p>
                  <p className="text-sm text-muted-foreground">{ticketData.ticketName}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {ticketData.quantity}</p>
                  <p className="text-xs text-muted-foreground">Order: {ticketData.orderId}</p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg border border-blue-500/20">
              <h4 className="font-semibold mb-3">Payment Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium">${ticketData.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Currency:</span>
                  <span className="font-medium">{ticketData.payCurrency?.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="outline" className={cn("text-xs", getStatusColor(ticketData.paymentStatus))}>
                    {getStatusText(ticketData.paymentStatus)}
                  </Badge>
                </div>
              </div>
            </div>

            {ticketData.paymentStatus === "finished" && (
              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  disabled
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Ticket
                </Button>
                <Button className="w-full bg-transparent" variant="outline" disabled>
                  <Mail className="w-4 w-4 mr-2" />
                  Email Ticket
                </Button>
                <Button className="w-full bg-transparent" variant="outline" disabled>
                  <Calendar className="w-4 h-4 mr-2" />
                  Add to Calendar
                </Button>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              {ticketData.paymentStatus === "finished" ? (
                <>
                  <p>Present this QR code at the event entrance.</p>
                  <p>Keep this ticket safe - it cannot be replaced if lost.</p>
                </>
              ) : (
                <>
                  <p>This page will automatically update when payment is confirmed.</p>
                  <p>Payments typically confirm within 10-30 minutes.</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
