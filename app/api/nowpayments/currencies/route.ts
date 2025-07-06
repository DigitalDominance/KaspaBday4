import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"

export async function GET() {
  try {
    const nowPayments = new NOWPaymentsAPI()
    const response = await nowPayments.getCurrencies()

    if (response.currencies) {
      // Sort currencies to put KAS first
      const currencies = response.currencies.sort((a: string, b: string) => {
        if (a.toLowerCase() === "kas") return -1
        if (b.toLowerCase() === "kas") return 1
        return a.localeCompare(b)
      })

      return NextResponse.json({
        success: true,
        currencies,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch currencies",
      },
      { status: 500 },
    )
  } catch (error) {
    console.error("Currencies API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch currencies",
      },
      { status: 500 },
    )
  }
}
