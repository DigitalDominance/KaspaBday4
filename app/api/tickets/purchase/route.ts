import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"
import { isTicketAvailable, reserveTickets } from "@/lib/ticket-stock"

const TICKET_PRICES = {
  "1-day": 75,
  "2-day": 125,
  "3-day": 175,
  vip: 299,
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ticketType, quantity, customerInfo, currency } = body

    // Validate input
    if (!ticketType || !quantity || !customerInfo?.name || !customerInfo?.email || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check ticket availability
    if (!isTicketAvailable(ticketType, quantity)) {
      return NextResponse.json({ error: "Tickets not available" }, { status: 400 })
    }

    // Calculate total amount
    const ticketPrice = TICKET_PRICES[ticketType as keyof typeof TICKET_PRICES]
    if (!ticketPrice) {
      return NextResponse.json({ error: "Invalid ticket type" }, { status: 400 })
    }

    const totalAmount = ticketPrice * quantity

    // Reserve tickets temporarily
    if (!reserveTickets(ticketType, quantity)) {
      return NextResponse.json({ error: "Failed to reserve tickets" }, { status: 400 })
    }

    // Create order ID
    const orderId = `KASPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create NOWPayments payment
    const nowPayments = new NOWPaymentsAPI()

    const paymentData = {
      price_amount: totalAmount,
      price_currency: "usd",
      pay_currency: currency,
      order_id: orderId,
      order_description: `Kaspa 4th Birthday - ${quantity}x ${ticketType} ticket(s) for ${customerInfo.name}`,
      ipn_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/nowpayments/ipn`,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/ticket-success?order=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tickets`,
    }

    const payment = await nowPayments.createPayment(paymentData)

    if (payment.error) {
      // Release reserved tickets on error
      // releaseTickets(ticketType, quantity)
      return NextResponse.json({ error: payment.error }, { status: 400 })
    }

    // Store order in database (simplified for demo)
    const orderData = {
      orderId,
      customerInfo,
      ticketType,
      quantity,
      totalAmount,
      currency,
      paymentId: payment.payment_id,
      paymentStatus: payment.payment_status,
      payAddress: payment.pay_address,
      payAmount: payment.pay_amount,
    }

    return NextResponse.json({
      success: true,
      order: orderData,
      payment: payment,
    })
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
