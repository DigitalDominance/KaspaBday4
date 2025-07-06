import { NextResponse } from "next/server"
import { TicketReservationModel } from "@/lib/models/TicketReservation"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    // Check if reservation is still valid
    const isValid = await TicketReservationModel.isReservationValid(paymentId)
    if (!isValid) {
      return NextResponse.json({
        valid: false,
        timeRemaining: 0,
        expired: true,
      })
    }

    // Get time remaining
    const timeRemaining = await TicketReservationModel.getTimeRemaining(paymentId)

    return NextResponse.json({
      valid: true,
      timeRemaining,
      expired: false,
    })
  } catch (error) {
    console.error("Reservation time check error:", error)
    return NextResponse.json({ error: "Failed to check reservation time" }, { status: 500 })
  }
}
