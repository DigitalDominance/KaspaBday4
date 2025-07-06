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
    const currencies = data.currencies || []

    // Add KAS first with logo if it exists in the list
    const kasIndex = currencies.findIndex((currency: any) => currency.code.toLowerCase() === "kas")
    if (kasIndex !== -1) {
      // Remove KAS from its current position
      const kasCurrency = currencies.splice(kasIndex, 1)[0]
      // Add KAS at the beginning with logo info
      currencies.unshift({
        code: kasCurrency.code,
        name: kasCurrency.name,
        logo: kasCurrency.logo,
        featured: true,
      })
    }

    // Format currencies with additional info for KAS
    const formattedCurrencies = currencies.map((currency: any) => {
      if (currency.code.toLowerCase() === "kas") {
        return {
          code: currency.code.toUpperCase(),
          name: currency.name,
          logo: currency.logo,
          featured: true,
        }
      }
      return {
        code: currency.code.toUpperCase(),
        name: currency.name.toUpperCase(),
        logo: null,
        featured: false,
      }
    })

    return NextResponse.json({
      success: true,
      currencies: formattedCurrencies,
    })
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
