import { NextResponse } from "next/server"
import { TicketStockModel } from "@/lib/models/TicketStock"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"

export async function POST(request: Request) {
  try {
    const { ticketType, quantity, customerInfo, currency } = await request.json()

    // Validate input
    if (!ticketType || !quantity || !customerInfo || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if tickets are available
    const isAvailable = await TicketStockModel.isAvailable(ticketType, quantity)
    if (!isAvailable) {
      return NextResponse.json({ error: "Not enough tickets available" }, { status: 400 })
    }

    // Calculate total amount
    const ticketPrices: Record<string, number> = {
      "1-day": 75,
      "2-day": 125,
      "3-day": 175,
      vip: 299,
    }

    const pricePerTicket = ticketPrices[ticketType]
    if (!pricePerTicket) {
      return NextResponse.json({ error: "Invalid ticket type" }, { status: 400 })
    }

    const totalAmount = pricePerTicket * quantity

    // Create order in database first
    const orderData = {
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      ticketType,
      quantity,
      totalAmount,
      currency: currency.toLowerCase(),
      status: "pending",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    }

    const order = await KaspaBirthdayTicketsModel.createOrder(orderData)
    const orderId = order.insertedId.toString()

    // Reserve tickets with expiration
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    const reservationSuccess = await TicketStockModel.reserveTickets(ticketType, quantity, expiresAt, orderId)

    if (!reservationSuccess) {
      // Clean up the order if reservation failed
      await KaspaBirthdayTicketsModel.deleteOrder(orderId)
      return NextResponse.json({ error: "Failed to reserve tickets" }, { status: 400 })
    }

    // Create payment with NOWPayments
    const nowPaymentsResponse = await fetch("https://api.nowpayments.io/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
      },
      body: JSON.stringify({
        price_amount: totalAmount,
        price_currency: "USD",
        pay_currency: currency.toLowerCase(),
        order_id: orderId,
        order_description: `${quantity}x ${ticketType} ticket(s) for Kaspa Birthday Celebration`,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/nowpayments/ipn`,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/ticket-success?order=${orderId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?cancelled=true`,
      }),
    })

    if (!nowPaymentsResponse.ok) {
      // Release reservation and clean up order
      await TicketStockModel.releaseReservation(ticketType, quantity, orderId)
      await KaspaBirthdayTicketsModel.deleteOrder(orderId)

      const errorData = await nowPaymentsResponse.text()
      console.error("NOWPayments error:", errorData)
      return NextResponse.json({ error: "Payment creation failed" }, { status: 500 })
    }

    const paymentData = await nowPaymentsResponse.json()

    // Update order with payment information
    await KaspaBirthdayTicketsModel.updateOrder(orderId, {
      paymentId: paymentData.payment_id,
      payAddress: paymentData.pay_address,
      payAmount: paymentData.pay_amount,
      payCurrency: paymentData.pay_currency,
      paymentStatus: paymentData.payment_status,
      updatedAt: new Date(),
    })

    console.log(`✅ Created payment for order ${orderId}: ${paymentData.payment_id}`)

    return NextResponse.json({
      success: true,
      order: {
        orderId,
        paymentId: paymentData.payment_id,
        payAddress: paymentData.pay_address,
        payAmount: paymentData.pay_amount,
        payCurrency: paymentData.pay_currency,
        paymentStatus: paymentData.payment_status,
        expiresAt: expiresAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
