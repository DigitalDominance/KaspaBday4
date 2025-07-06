"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Mail, Calendar, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { generateTicketText } from "@/lib/qr-generator"

interface TicketData {
  orderId: string
  customerName: string
  customerEmail: string
  ticketType: string
  quantity: number
  totalAmount: number
  paymentStatus: string
  createdAt: string
}

export default function TicketSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [ticketData, setTicketData] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailCooldown, setEmailCooldown] = useState(0)
  const [emailSending, setEmailSending] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchTicketData(orderId)
    }
  }, [orderId])

  useEffect(() => {
    // Check for email cooldown in localStorage
    const cooldownKey = `email_cooldown_${orderId}`
    const lastEmailTime = localStorage.getItem(cooldownKey)

    if (lastEmailTime) {
      const timeDiff = Date.now() - Number.parseInt(lastEmailTime)
      const remainingCooldown = Math.max(0, 3600000 - timeDiff) // 1 hour in ms

      if (remainingCooldown > 0) {
        setEmailCooldown(Math.ceil(remainingCooldown / 1000))
      }
    }
  }, [orderId])

  useEffect(() => {
    // Countdown timer for email cooldown
    if (emailCooldown > 0) {
      const timer = setInterval(() => {
        setEmailCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [emailCooldown])

  const fetchTicketData = async (orderId: string) => {
    try {
      const response = await fetch(`/api/tickets/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setTicketData(data)
      }
    } catch (error) {
      console.error("Failed to fetch ticket data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTicket = () => {
    if (!ticketData) return

    const ticketText = generateTicketText({
      orderId: ticketData.orderId,
      customerName: ticketData.customerName,
      ticketType: ticketData.ticketType,
      quantity: ticketData.quantity,
      event: "Kaspa 4th Birthday Celebration",
      date: "November 7-9, 2025",
      venue: "Kaspa Community Center, Liverpool, NY",
    })

    const blob = new Blob([ticketText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kaspa-ticket-${ticketData.orderId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleEmailTicket = async () => {
    if (!ticketData || emailCooldown > 0) return

    setEmailSending(true)
    try {
      const response = await fetch("/api/tickets/resend-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: ticketData.orderId,
        }),
      })

      if (response.ok) {
        // Set cooldown
        const cooldownKey = `email_cooldown_${orderId}`
        localStorage.setItem(cooldownKey, Date.now().toString())
        setEmailCooldown(3600) // 1 hour in seconds

        alert("Ticket email sent successfully!")
      } else {
        alert("Failed to send email. Please try again.")
      }
    } catch (error) {
      console.error("Failed to send email:", error)
      alert("Failed to send email. Please try again.")
    } finally {
      setEmailSending(false)
    }
  }

  const handleAddToCalendar = () => {
    const startDate = "20251107T090000Z"
    const endDate = "20251109T180000Z"
    const title = encodeURIComponent("Kaspa 4th Birthday Celebration")
    const details = encodeURIComponent(
      "Kaspa 4th Birthday Celebration - 3 days of workshops, presentations, and networking",
    )
    const location = encodeURIComponent("Kaspa Community Center, Liverpool, NY")

    // Try Google Calendar first
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`

    // Create ICS file as fallback
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Kaspa Events//Ticket System//EN
BEGIN:VEVENT
UID:kaspa-birthday-2025@kaspaevents.xyz
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:Kaspa 4th Birthday Celebration
DESCRIPTION:Kaspa 4th Birthday Celebration - 3 days of workshops, presentations, and networking
LOCATION:Kaspa Community Center, Liverpool, NY
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`

    // Try to open Google Calendar
    const newWindow = window.open(googleUrl, "_blank")

    // If popup blocked or user prefers download, offer ICS file
    setTimeout(() => {
      if (!newWindow || newWindow.closed) {
        const blob = new Blob([icsContent], { type: "text/calendar" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "kaspa-birthday-celebration.ics"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    }, 1000)
  }

  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getTicketTypeDisplay = (type: string) => {
    return type
      .replace("-", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">Ticket not found. Please check your order ID.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="mb-8">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4"
              >
                <CheckCircle className="h-16 w-16 text-green-500" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-green-600">Payment Successful!</CardTitle>
              <p className="text-muted-foreground">Your tickets have been confirmed and are ready to use.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ticket Information */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Ticket Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-100 text-sm">Order ID</p>
                    <p className="font-mono text-sm">{ticketData.orderId}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Ticket Type</p>
                    <p className="font-semibold">{getTicketTypeDisplay(ticketData.ticketType)}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Quantity</p>
                    <p className="font-semibold">{ticketData.quantity}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Total Paid</p>
                    <p className="font-semibold">${ticketData.totalAmount}</p>
                  </div>
                </div>
              </div>

              {/* Event Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Event Information</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <strong>Event:</strong> Kaspa 4th Birthday Celebration
                  </p>
                  <p>
                    <strong>Date:</strong> November 7-9, 2025
                  </p>
                  <p>
                    <strong>Location:</strong> Kaspa Community Center, Liverpool, NY
                  </p>
                  <p>
                    <strong>Time:</strong> 9:00 AM - 6:00 PM daily
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <h4 className="font-semibold">Ticket Actions</h4>

                <Button onClick={handleDownloadTicket} className="w-full bg-transparent" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Ticket
                </Button>

                <Button
                  onClick={handleEmailTicket}
                  className="w-full bg-transparent"
                  variant="outline"
                  disabled={emailCooldown > 0 || emailSending}
                >
                  {emailSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Sending...
                    </>
                  ) : emailCooldown > 0 ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Email Ticket ({formatCooldownTime(emailCooldown)})
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Email Ticket
                    </>
                  )}
                </Button>

                <Button onClick={handleAddToCalendar} className="w-full bg-transparent" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Important Notes</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Your ticket has been sent to {ticketData.customerEmail}</li>
                  <li>• Present your digital ticket (QR code) at the event entrance</li>
                  <li>• Bring a valid ID for verification</li>
                  <li>• Tickets are non-refundable but transferable</li>
                  <li>• Contact tickets@kaspaevents.xyz for questions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
