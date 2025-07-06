import { NextResponse } from "next/server"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"
import { EmailService } from "@/lib/email"
import { generateTicketQR } from "@/lib/qr-generator"

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Find the ticket
    const ticket = await KaspaBirthdayTicketsModel.findByOrderId(orderId)

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    if (ticket.paymentStatus !== "finished") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    // Generate QR code
    const qrData = generateTicketQR({
      orderId: ticket.orderId,
      customerName: ticket.customerName,
      customerEmail: ticket.customerEmail,
      ticketType: ticket.ticketType,
      quantity: ticket.quantity,
      eventDate: "November 7-9, 2025",
    })

    // Send email
    const emailSent = await EmailService.sendTicketEmail({
      ticket,
      qrCodeDataUrl: qrData.qrCodeDataUrl,
    })

    if (emailSent) {
      return NextResponse.json({ success: true, message: "Email sent successfully" })
    } else {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Resend email error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
