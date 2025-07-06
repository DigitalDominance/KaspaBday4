import { NextResponse } from "next/server"
import { TicketReservationModel } from "@/lib/models/TicketReservation"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    const remainingTime = await TicketReservationModel.getRemainingTime(paymentId)

    return NextResponse.json(remainingTime)
  } catch (error) {
    console.error("Get reservation time error:", error)
    return NextResponse.json({ error: "Failed to get reservation time" }, { status: 500 })
  }
}
