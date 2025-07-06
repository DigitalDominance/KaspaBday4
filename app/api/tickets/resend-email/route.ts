import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { sendTicketEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Find the ticket
    const ticket = await db.collection("kaspa_birthday_tickets").findOne({ orderId })

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 })
    }

    // Check if payment is finished
    if (ticket.paymentStatus !== "finished") {
      return NextResponse.json({ success: false, error: "Payment not completed" }, { status: 400 })
    }

    // Check cooldown (1 hour = 3600 seconds)
    const lastEmailSent = ticket.lastEmailSent ? new Date(ticket.lastEmailSent) : null
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    if (lastEmailSent && lastEmailSent > oneHourAgo) {
      const remainingTime = Math.ceil((lastEmailSent.getTime() + 60 * 60 * 1000 - now.getTime()) / 1000)
      return NextResponse.json(
        {
          success: false,
          error: "Email cooldown active",
          remainingTime,
        },
        { status: 429 },
      )
    }

    // Send the email
    const emailSent = await sendTicketEmail({
      orderId: ticket.orderId,
      customerName: ticket.customerName,
      customerEmail: ticket.customerEmail,
      ticketType: ticket.ticketType,
      quantity: ticket.quantity,
      totalAmount: ticket.totalAmount,
    })

    if (!emailSent) {
      return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
    }

    // Update last email sent timestamp
    await db.collection("kaspa_birthday_tickets").updateOne(
      { orderId },
      {
        $set: {
          lastEmailSent: now,
        },
      },
    )

    return NextResponse.json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.error("Error resending email:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
