import { NextResponse } from "next/server"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"
import { EmailService } from "@/lib/email"
import { generateTicketQR } from "@/lib/qr-generator"

export async function POST(request: Request) {
  try {
    const { paymentId, orderId } = await request.json()

    if (!paymentId && !orderId) {
      return NextResponse.json({ error: "Payment ID or Order ID required" }, { status: 400 })
    }

    console.log(`🎫 Force generating ticket for: ${paymentId || `order:${orderId}`}`)

    // Find the ticket
    let ticket
    if (paymentId) {
      ticket = await KaspaBirthdayTicketsModel.findByPaymentId(paymentId)
    } else {
      ticket = await KaspaBirthdayTicketsModel.findByOrderId(orderId)
    }

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Generate ticket QR code
    const ticketData = generateTicketQR({
      orderId: ticket.orderId,
      customerName: ticket.customerName,
      customerEmail: ticket.customerEmail,
      ticketType: ticket.ticketType,
      quantity: ticket.quantity,
      eventDate: "November 7-9, 2025",
    })

    // Update ticket with QR code
    await KaspaBirthdayTicketsModel.updatePaymentStatus(ticket.paymentId, {
      qrCode: ticketData.qrCodeDataUrl,
      ticketData: ticketData.ticketInfo,
      paymentStatus: "finished", // Force to finished
    })

    // Get updated ticket record
    const updatedTicket = await KaspaBirthdayTicketsModel.findByPaymentId(ticket.paymentId)

    if (updatedTicket) {
      // Send ticket email
      const emailSent = await EmailService.sendTicketEmail({
        ticket: updatedTicket,
        qrCodeDataUrl: ticketData.qrCodeDataUrl,
      })

      if (emailSent) {
        await KaspaBirthdayTicketsModel.updatePaymentStatus(ticket.paymentId, {
          emailSent: true,
        })
        console.log(`✅ Ticket email sent successfully for ${ticket.paymentId}`)

        return NextResponse.json({
          success: true,
          message: "Ticket generated and sent successfully",
          orderId: ticket.orderId,
          customerEmail: ticket.customerEmail,
        })
      } else {
        return NextResponse.json({ error: "Failed to send ticket email" }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 })
    }
  } catch (error) {
    console.error("Force ticket generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate ticket",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
