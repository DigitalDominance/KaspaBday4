import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { KaspaBirthdayTickets } from "@/lib/models/KaspaBirthdayTickets"

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY
const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1"

export async function POST(request: Request) {
  try {
    const { ticketType, quantity, customerInfo, currency } = await request.json()

    if (!ticketType || !quantity || !customerInfo || !currency) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    // Check and reserve stock
    const stockResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tickets/stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticketType,
        action: "reserve",
        quantity,
      }),
    })

    const stockData = await stockResponse.json()
    if (!stockData.success) {
      return NextResponse.json(
        { success: false, error: stockData.error || "Not enough tickets available" },
        { status: 400 },
      )
    }

    // Get ticket price
    const ticketPrices = {
      "1-day": 25,
      "2-day": 40,
      "3-day": 50,
      vip: 100,
    }

    const pricePerTicket = ticketPrices[ticketType as keyof typeof ticketPrices]
    if (!pricePerTicket) {
      return NextResponse.json({ success: false, error: "Invalid ticket type" }, { status: 400 })
    }

    const totalAmount = pricePerTicket * quantity

    // Create payment with NOWPayments
    const paymentResponse = await fetch(`${NOWPAYMENTS_API_URL}/payment`, {
      method: "POST",
      headers: {
        "x-api-key": NOWPAYMENTS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: totalAmount,
        price_currency: "USD",
        pay_currency: currency.toLowerCase(),
        order_id: `kaspa-birthday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        order_description: `Kaspa Birthday ${ticketType} Pass x${quantity}`,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/ipn`,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/ticket-success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      }),
    })

    const paymentData = await paymentResponse.json()

    if (!paymentResponse.ok) {
      // Release reserved stock on payment creation failure
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tickets/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketType,
          action: "release",
          quantity,
        }),
      })

      return NextResponse.json(
        { success: false, error: paymentData.message || "Payment creation failed" },
        { status: 400 },
      )
    }

    // Save ticket order to database
    const ticketOrder = new KaspaBirthdayTickets({
      orderId: paymentData.order_id,
      paymentId: paymentData.payment_id,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      ticketType,
      ticketName: `${ticketType.charAt(0).toUpperCase() + ticketType.slice(1)} Pass`,
      quantity,
      totalAmount,
      currency: currency.toLowerCase(),
      paymentStatus: "waiting",
      payAddress: paymentData.pay_address,
      payAmount: paymentData.pay_amount,
      payCurrency: paymentData.pay_currency,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await ticketOrder.save()

    return NextResponse.json({
      success: true,
      order: {
        orderId: paymentData.order_id,
        paymentId: paymentData.payment_id,
        payAddress: paymentData.pay_address,
        payAmount: paymentData.pay_amount,
        payCurrency: paymentData.pay_currency,
        paymentStatus: paymentData.payment_status || "waiting",
        totalAmount,
        currency: currency.toLowerCase(),
      },
    })
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
