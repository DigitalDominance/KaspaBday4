import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { EmailService } from "@/lib/email"
import { generateQRCodeDataURL } from "@/lib/qr-generator"

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Find the ticket
    const ticket = await db.collection("kaspa_birthday_tickets").findOne({ orderId })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    if (ticket.paymentStatus !== "finished") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    // Generate QR code
    const qrData = JSON.stringify({
      orderId: ticket.orderId,
      customerName: ticket.customerName,
      ticketType: ticket.ticketName,
      quantity: ticket.quantity,
      event: "Kaspa 4th Birthday Celebration",
      date: "November 7-9, 2025",
      venue: "Kaspa Community Center, Liverpool, NY",
      verified: true,
      timestamp: Date.now(),
    })

    const qrCodeDataUrl = await generateQRCodeDataURL(qrData)

    // Send email
    const emailSent = await EmailService.sendTicketEmail({
      ticket,
      qrCodeDataUrl,
    })

    if (emailSent) {
      return NextResponse.json({ success: true, message: "Email sent successfully" })
    } else {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error resending ticket email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
