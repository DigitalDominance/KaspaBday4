import { type NextRequest, NextResponse } from "next/server"
import { TicketStockModel } from "@/lib/models/TicketStock"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json()

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    // Find the ticket record
    const client = await clientPromise
    const db = client.db("kaspa_birthday")
    const ticketsCollection = db.collection("kaspa_birthday_tickets")

    const ticket = await ticketsCollection.findOne({ paymentId })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Release the reservation
    await TicketStockModel.releaseReservation(ticket.ticketType, ticket.quantity, ticket.orderId)

    // Update ticket status
    await ticketsCollection.updateOne(
      { paymentId },
      {
        $set: {
          paymentStatus: "cancelled",
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cancel error:", error)
    return NextResponse.json({ error: "Failed to cancel payment" }, { status: 500 })
  }
}
