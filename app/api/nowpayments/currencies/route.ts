import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"

export async function GET() {
  try {
    const nowPayments = new NOWPaymentsAPI()
    const currencies = await nowPayments.getFullCurrencies()
    return NextResponse.json(currencies)
  } catch (error) {
    console.error("NOWPayments currencies error:", error)
    return NextResponse.json({ error: "Failed to get currencies" }, { status: 500 })
  }
}
