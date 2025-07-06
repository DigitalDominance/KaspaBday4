import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { sendTicketEmail } from "@/lib/email"

const EMAIL_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour in milliseconds

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Find the ticket
    const ticket = await db.collection("kaspa_birthday_tickets").findOne({
      orderId: orderId,
    })

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 })
    }

    if (ticket.paymentStatus !== "finished") {
      return NextResponse.json({ success: false, error: "Payment not completed yet" }, { status: 400 })
    }

    // Check email cooldown
    const now = new Date()
    const lastEmailSent = ticket.lastEmailSent ? new Date(ticket.lastEmailSent) : null

    if (lastEmailSent) {
      const timeSinceLastEmail = now.getTime() - lastEmailSent.getTime()

      if (timeSinceLastEmail < EMAIL_COOLDOWN_MS) {
        const remainingTime = Math.ceil((EMAIL_COOLDOWN_MS - timeSinceLastEmail) / 1000)

        return NextResponse.json(
          {
            success: false,
            error: "Email cooldown active",
            remainingTime,
          },
          { status: 429 },
        )
      }
    }

    // Send the email
    const emailSent = await sendTicketEmail({
      orderId: ticket.orderId,
      customerName: ticket.customerName,
      customerEmail: ticket.customerEmail,
      ticketType: ticket.ticketType,
      ticketName: ticket.ticketName,
      quantity: ticket.quantity,
      totalAmount: ticket.totalAmount,
    })

    if (!emailSent) {
      return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
    }

    // Update last email sent timestamp
    await db.collection("kaspa_birthday_tickets").updateOne(
      { orderId: orderId },
      {
        $set: {
          lastEmailSent: now,
          emailSentCount: (ticket.emailSentCount || 0) + 1,
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    })
  } catch (error) {
    console.error("Error resending ticket email:", error)

    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
