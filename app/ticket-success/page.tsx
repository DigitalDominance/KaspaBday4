"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Mail, Calendar } from "lucide-react"
import { Space_Grotesk } from "next/font/google"
import { cn } from "@/lib/utils"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })

export default function TicketSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order")
  const [ticketData, setTicketData] = useState<any>(null)

  useEffect(() => {
    if (orderId) {
      // In production, fetch ticket data from your database
      setTicketData({
        orderId,
        customerName: "John Doe",
        ticketType: "2-Day Pass",
        quantity: 1,
        qrCode:
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IndoaXRlIi8+PHRleHQgeD0iMTAwIiB5PSIxMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkthc3BhIDR0aCBCaXJ0aGRheTwvdGV4dD48L3N2Zz4=",
      })
    }
  }, [orderId])

  if (!ticketData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading your ticket...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className={cn("text-2xl text-green-600 dark:text-green-400", spaceGrotesk.className)}>
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Your ticket has been confirmed and sent to your email.</p>
          </div>

          {/* QR Code Ticket */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700">
            <div className="text-center space-y-4">
              <img
                src={ticketData.qrCode || "/placeholder.svg"}
                alt="Ticket QR Code"
                className="w-32 h-32 mx-auto border rounded-lg"
              />
              <div>
                <h3 className="font-bold text-lg">Kaspa's 4th Birthday</h3>
                <p className="text-sm text-muted-foreground">November 7-9, 2025</p>
                <p className="text-sm text-muted-foreground">Liverpool, NY</p>
              </div>
              <div className="border-t pt-4">
                <p className="font-medium">{ticketData.customerName}</p>
                <p className="text-sm text-muted-foreground">{ticketData.ticketType}</p>
                <p className="text-xs text-muted-foreground">Order: {ticketData.orderId}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button className="w-full bg-transparent" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Ticket
            </Button>
            <Button className="w-full bg-transparent" variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Email Ticket
            </Button>
            <Button className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Present this QR code at the event entrance.</p>
            <p>Keep this ticket safe - it cannot be replaced if lost.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
