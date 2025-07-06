import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"

export async function GET() {
  try {
    const nowPayments = new NOWPaymentsAPI()
    const status = await nowPayments.getStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error("NOWPayments status error:", error)
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 })
  }
}
