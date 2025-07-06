import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://api.nowpayments.io/v1/currencies", {
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch currencies")
    }

    const data = await response.json()
    let currencies = data.currencies || []

    // Ensure KAS is first in the list
    currencies = currencies.filter((currency: string) => currency.toLowerCase() !== "kas")
    currencies.unshift("kas")

    return NextResponse.json({
      success: true,
      currencies,
    })
  } catch (error) {
    console.error("Currencies fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch currencies" }, { status: 500 })
  }
}
