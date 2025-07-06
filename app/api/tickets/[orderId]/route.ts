import { NextResponse } from "next/server"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params

    const ticket = await KaspaBirthdayTicketsModel.findByOrderId(orderId)

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Get ticket error:", error)
    return NextResponse.json({ error: "Failed to get ticket" }, { status: 500 })
  }
}
