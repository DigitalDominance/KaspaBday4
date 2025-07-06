"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Download, Mail, Calendar, Clock, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateQRCodeDataURL, generateTicketText, type TicketData } from "@/lib/qr-generator"

interface TicketInfo {
  orderId: string
  customerName: string
  customerEmail: string
  ticketType: string
  ticketName: string
  quantity: number
  totalAmount: number
  paymentStatus: string
  createdAt: string
  qrCodeDataUrl?: string
}

export default function TicketSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order")
  const { toast } = useToast()

  const [ticket, setTicket] = useState<TicketInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailCooldown, setEmailCooldown] = useState(0)
  const [emailLoading, setEmailLoading] = useState(false)
  const [qrLoading, setQrLoading] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchTicket(orderId)
    }
  }, [orderId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (emailCooldown > 0) {
      interval = setInterval(() => {
        setEmailCooldown((prev) => Math.max(0, prev - 1))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [emailCooldown])

  const fetchTicket = async (orderId: string) => {
    try {
      const response = await fetch(`/api/tickets/${orderId}`)
      const data = await response.json()

      if (data.success) {
        setTicket(data.ticket)

        // Generate actual QR code if payment is finished
        if (data.ticket.paymentStatus === "finished") {
          await generateQRCode(data.ticket)
        }
      }
    } catch (error) {
      console.error("Error fetching ticket:", error)
      toast({
        title: "Error",
        description: "Failed to load ticket information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async (ticketData: TicketInfo) => {
    setQrLoading(true)
    try {
      const qrData: TicketData = {
        orderId: ticketData.orderId,
        customerName: ticketData.customerName,
        ticketType: ticketData.ticketType,
        quantity: ticketData.quantity,
        event: "Kaspa 4th Birthday Celebration",
        date: "November 7-9, 2025",
        venue: "Kaspa Community Center, Liverpool, NY",
        verified: true,
        timestamp: Date.now(),
      }

      const qrCodeDataUrl = await generateQRCodeDataURL(qrData)

      setTicket((prev) =>
        prev
          ? {
              ...prev,
              qrCodeDataUrl: qrCodeDataUrl,
            }
          : null,
      )
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      })
    } finally {
      setQrLoading(false)
    }
  }

  const handleDownloadTicket = () => {
    if (!ticket) return

    const qrData: TicketData = {
      orderId: ticket.orderId,
      customerName: ticket.customerName,
      ticketType: ticket.ticketType,
      quantity: ticket.quantity,
      event: "Kaspa 4th Birthday Celebration",
      date: "November 7-9, 2025",
      venue: "Kaspa Community Center, Liverpool, NY",
      verified: true,
      timestamp: Date.now(),
    }

    const ticketText = generateTicketText(qrData)

    const blob = new Blob([ticketText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kaspa-birthday-ticket-${ticket.orderId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Ticket downloaded successfully",
    })
  }

  const handleEmailTicket = async () => {
    if (!ticket || emailLoading) return

    setEmailLoading(true)

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
        toast({
          title: "Success",
          description: "Ticket email sent successfully",
        })
        setEmailCooldown(3600) // 1 hour cooldown
      } else {
        if (data.remainingTime) {
          setEmailCooldown(data.remainingTime)
          toast({
            title: "Cooldown Active",
            description: `Please wait ${Math.ceil(data.remainingTime / 60)} minutes before sending another email`,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to send email",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error sending email:", error)
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      })
    } finally {
      setEmailLoading(false)
    }
  }

  const handleAddToCalendar = () => {
    const startDate = "20251107T090000Z"
    const endDate = "20251109T180000Z"
    const title = "Kaspa 4th Birthday Celebration"
    const description = "Join us for 3 days of blockchain innovation, workshops, and community celebration!"
    const location = "Kaspa Community Center, 4225 Long Branch Rd, Liverpool, NY 13088"

    // Google Calendar URL
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`

    // ICS file content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Kaspa Events//EN
BEGIN:VEVENT
UID:kaspa-birthday-2025@kaspaevents.xyz
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`

    // Try to open Google Calendar
    const newWindow = window.open(googleUrl, "_blank")

    // If popup blocked, download ICS file
    if (!newWindow) {
      const blob = new Blob([icsContent], { type: "text/calendar" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "kaspa-birthday-celebration.ics"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Calendar Event",
        description: "Calendar file downloaded. Import it to your calendar app.",
      })
    } else {
      toast({
        title: "Calendar Event",
        description: "Opening Google Calendar...",
      })
    }
  }

  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your ticket...</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Ticket Not Found</h1>
            <p className="text-gray-600">The ticket you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {ticket.paymentStatus === "finished" ? "Payment Successful!" : "Payment Processing"}
          </h1>
          <p className="text-gray-600">
            {ticket.paymentStatus === "finished"
              ? "Your tickets are ready for the Kaspa 4th Birthday Celebration"
              : "Your payment is being processed. You will receive your tickets once confirmed."}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ticket Details</span>
              <Badge variant={ticket.paymentStatus === "finished" ? "default" : "secondary"}>
                {ticket.paymentStatus === "finished" ? "Confirmed" : "Processing"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-mono text-sm">{ticket.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-medium">{ticket.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ticket Type</p>
                <p className="font-medium">{ticket.ticketName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quantity</p>
                <p className="font-medium">
                  {ticket.quantity} ticket{ticket.quantity > 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-medium">${ticket.totalAmount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Purchase Date</p>
                <p className="font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {ticket.paymentStatus === "finished" && (
              <>
                <Separator />
                <div className="text-center">
                  <h3 className="font-semibold mb-4">Your Digital Ticket</h3>
                  <div className="inline-block p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    {qrLoading ? (
                      <div className="w-48 h-48 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : ticket.qrCodeDataUrl ? (
                      <img
                        src={ticket.qrCodeDataUrl || "/placeholder.svg"}
                        alt="Ticket QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                        <p className="text-gray-500 text-sm">QR Code Loading...</p>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Present this QR code at the event entrance</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {ticket.paymentStatus === "finished" && (
          <Card>
            <CardHeader>
              <CardTitle>Ticket Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button onClick={handleDownloadTicket} variant="outline" className="w-full bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download Ticket
                </Button>

                <Button
                  onClick={handleEmailTicket}
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled={emailCooldown > 0 || emailLoading}
                >
                  {emailLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : emailCooldown > 0 ? (
                    <Clock className="h-4 w-4 mr-2" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  {emailCooldown > 0 ? formatCooldownTime(emailCooldown) : "Email Ticket"}
                </Button>

                <Button onClick={handleAddToCalendar} variant="outline" className="w-full bg-transparent">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Event Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Date:</strong> November 7-9, 2025
                </p>
                <p>
                  <strong>Location:</strong> Kaspa Community Center
                </p>
                <p>
                  <strong>Address:</strong> 4225 Long Branch Rd, Liverpool, NY 13088
                </p>
                <p>
                  <strong>Time:</strong> 9:00 AM - 6:00 PM daily
                </p>
              </div>
              <Separator className="my-4" />
              <p className="text-sm text-gray-600">
                Questions? Contact us at{" "}
                <a href="mailto:tickets@kaspaevents.xyz" className="text-blue-600 hover:underline">
                  tickets@kaspaevents.xyz
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
