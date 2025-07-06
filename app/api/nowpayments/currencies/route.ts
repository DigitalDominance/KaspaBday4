import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"

export async function GET() {
  try {
    const nowPayments = new NOWPaymentsAPI()
    const data = await nowPayments.getFullCurrencies()

    // Filter only enabled currencies that are available for payment
    const enabledCurrencies =
      data.currencies?.filter((currency: any) => currency.enable && currency.available_for_payment) || []

    return NextResponse.json({ currencies: enabledCurrencies })
  } catch (error) {
    console.error("NOWPayments currencies error:", error)
    return NextResponse.json({ error: "Failed to get currencies" }, { status: 500 })
  }
}
