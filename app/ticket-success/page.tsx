"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Download, Mail, Calendar, Clock, QrCode } from "lucide-react"
import { generateQRCodeDataURL, createTicketData } from "@/lib/qr-generator"

interface TicketInfo {
  orderId: string
  customerName: string
  customerEmail: string
  ticketType: string
  quantity: number
  totalAmount: number
  paymentStatus: string
  qrCodeDataUrl?: string
}

export default function TicketSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [ticket, setTicket] = useState<TicketInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emailCooldown, setEmailCooldown] = useState(0)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchTicketInfo(orderId)
    } else {
      setError("No order ID provided")
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (emailCooldown > 0) {
      interval = setInterval(() => {
        setEmailCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [emailCooldown])

  const fetchTicketInfo = async (orderId: string) => {
    try {
      const response = await fetch(`/api/tickets/${orderId}`)
      const data = await response.json()

      if (data.success && data.ticket) {
        setTicket(data.ticket)

        // Generate QR code if not already present
        if (!data.ticket.qrCodeDataUrl) {
          await generateQRCode(data.ticket)
        }
      } else {
        setError(data.error || "Ticket not found")
      }
    } catch (error) {
      console.error("Error fetching ticket:", error)
      setError("Failed to load ticket information")
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async (ticketData: TicketInfo) => {
    try {
      setIsGeneratingQR(true)

      const qrData = createTicketData(
        ticketData.orderId,
        ticketData.customerName,
        ticketData.ticketType,
        ticketData.quantity,
      )

      const qrCodeDataUrl = await generateQRCodeDataURL(qrData)

      setTicket((prev) =>
        prev
          ? {
              ...prev,
              qrCodeDataUrl,
            }
          : null,
      )
    } catch (error) {
      console.error("Error generating QR code:", error)
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const handleDownloadTicket = () => {
    if (!ticket) return

    const ticketText = `
KASPA 4TH BIRTHDAY CELEBRATION TICKET

Order ID: ${ticket.orderId}
Customer: ${ticket.customerName}
Email: ${ticket.customerEmail}
Ticket Type: ${ticket.ticketType}
Quantity: ${ticket.quantity}
Total Amount: $${ticket.totalAmount}

Event: Kaspa 4th Birthday Celebration
Date: November 7-9, 2025
Venue: Kaspa Community Center, Liverpool, NY

QR Code Data: ${JSON.stringify(
      createTicketData(ticket.orderId, ticket.customerName, ticket.ticketType, ticket.quantity),
    )}

Please present this ticket or the QR code at the event entrance.
    `.trim()

    const blob = new Blob([ticketText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kaspa-ticket-${ticket.orderId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleEmailTicket = async () => {
    if (!ticket || emailCooldown > 0) return

    try {
      const response = await fetch("/api/tickets/resend-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: ticket.orderId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setEmailCooldown(3600) // 1 hour cooldown
        alert("Ticket email sent successfully!")
      } else {
        alert("Failed to send email: " + data.error)
      }
    } catch (error) {
      console.error("Error sending email:", error)
      alert("Failed to send email")
    }
  }

  const handleAddToCalendar = () => {
    const startDate = "20251107T100000Z"
    const endDate = "20251109T180000Z"
    const title = "Kaspa 4th Birthday Celebration"
    const description = `Ticket Type: ${ticket?.ticketType}\nOrder ID: ${ticket?.orderId}`
    const location = "Kaspa Community Center, Liverpool, NY"

    // Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title,
    )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
      description,
    )}&location=${encodeURIComponent(location)}`

    // Try to open Google Calendar
    const newWindow = window.open(googleCalendarUrl, "_blank")

    // Fallback: create ICS file
    if (!newWindow) {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Kaspa Events//EN
BEGIN:VEVENT
UID:${ticket?.orderId}@kaspaevents.xyz
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`

      const blob = new Blob([icsContent], { type: "text/calendar" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `kaspa-birthday-${ticket?.orderId}.ics`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading your ticket...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
              <p className="text-muted-foreground">The requested ticket could not be found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-lg text-muted-foreground">Your ticket has been confirmed and is ready to use.</p>
        </div>

        {/* Ticket Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Your Kaspa Birthday Ticket
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ticket Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-3">Ticket Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-mono">{ticket.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{ticket.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{ticket.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="secondary">{ticket.ticketType}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span>{ticket.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold">${ticket.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Event Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Event:</span>
                    <p>Kaspa 4th Birthday Celebration</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p>November 7-9, 2025</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Venue:</span>
                    <p>Kaspa Community Center, Liverpool, NY</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* QR Code */}
            <div className="text-center">
              <h3 className="font-semibold mb-4">Your Ticket QR Code</h3>
              <div className="flex justify-center mb-4">
                {isGeneratingQR ? (
                  <div className="w-64 h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Generating QR Code...</p>
                    </div>
                  </div>
                ) : ticket.qrCodeDataUrl ? (
                  <img
                    src={ticket.qrCodeDataUrl || "/placeholder.svg"}
                    alt="Ticket QR Code"
                    className="w-64 h-64 border-2 border-gray-200 rounded-lg"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm text-muted-foreground">QR Code not available</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Present this QR code at the event entrance for quick check-in
              </p>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={handleDownloadTicket} variant="outline" className="w-full bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download Ticket
              </Button>

              <Button
                onClick={handleEmailTicket}
                variant="outline"
                className="w-full bg-transparent"
                disabled={emailCooldown > 0}
              >
                {emailCooldown > 0 ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    {formatCooldownTime(emailCooldown)}
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Ticket
                  </>
                )}
              </Button>

              <Button onClick={handleAddToCalendar} variant="outline" className="w-full bg-transparent">
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Important Information</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Keep this ticket safe - you'll need it for event entry</p>
              <p>• The QR code contains your unique ticket information</p>
              <p>• A copy has been sent to your email address</p>
              <p>• Tickets are transferable but non-refundable</p>
              <p>• Contact tickets@kaspaevents.xyz for any questions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
