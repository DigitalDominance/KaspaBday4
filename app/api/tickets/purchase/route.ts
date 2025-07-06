import { NextResponse } from "next/server"
import { TicketStockModel } from "@/lib/models/TicketStock"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"

const TICKET_PRICES = {
  "1-day": { price: 75, name: "1-Day Pass" },
  "2-day": { price: 125, name: "2-Day Pass" },
  "3-day": { price: 175, name: "3-Day Pass" },
  vip: { price: 299, name: "VIP Pass" },
}

// 30 minutes in milliseconds
const RESERVATION_TIMEOUT = 30 * 60 * 1000

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerInfo, ticketType, quantity, selectedCurrency } = body

    console.log("Purchase request:", { customerInfo, ticketType, quantity, selectedCurrency })

    // Validate required fields
    if (!customerInfo?.name || !customerInfo?.email || !ticketType || !quantity || !selectedCurrency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check ticket availability
    const isAvailable = await TicketStockModel.isAvailable(ticketType, quantity)
    if (!isAvailable) {
      return NextResponse.json({ error: "Tickets not available" }, { status: 400 })
    }

    // Get ticket price
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
    const orderId = `KAS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = new Date(Date.now() + RESERVATION_TIMEOUT) // 30 minutes from now

    const orderData = {
      orderId,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      ticketType,
      quantity,
      totalAmount: totalAmount.toString(),
      currency: "USD",
      paymentStatus: "waiting",
      paymentId: "",
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert order
    const insertResult = await KaspaBirthdayTicketsModel.create(orderData)
    console.log("Order created:", insertResult.insertedId)

    // Reserve tickets
    const reserved = await TicketStockModel.reserveTickets(
      ticketType,
      quantity,
      expiresAt,
      insertResult.insertedId.toString(),
    )

    if (!reserved) {
      // Clean up order if reservation failed
      await KaspaBirthdayTicketsModel.deleteById(insertResult.insertedId.toString())
      return NextResponse.json({ error: "Failed to reserve tickets" }, { status: 400 })
    }

    // Create payment with NOWPayments
    const paymentData = {
      price_amount: totalAmount,
      price_currency: "USD",
      pay_currency: selectedCurrency.toLowerCase(),
      order_id: orderId,
      order_description: `${quantity}x ${ticketType} ticket(s) for Kaspa Birthday Event`,
      ipn_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/nowpayments/ipn`,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/ticket-success?order=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?cancelled=true`,
    }

    console.log("Creating NOWPayments payment:", paymentData)

    const paymentResponse = await fetch("https://api.nowpayments.io/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
      },
      body: JSON.stringify(paymentData),
    })

    const paymentResult = await paymentResponse.json()
    console.log("NOWPayments response:", paymentResult)

    if (!paymentResponse.ok) {
      // Release reservation and clean up order
      await TicketStockModel.releaseReservation(ticketType, quantity, insertResult.insertedId.toString())
      await KaspaBirthdayTicketsModel.deleteById(insertResult.insertedId.toString())
      return NextResponse.json({ error: paymentResult.message || "Payment creation failed" }, { status: 400 })
    }

    // Update order with payment ID
    await KaspaBirthdayTicketsModel.updateById(insertResult.insertedId.toString(), {
      paymentId: paymentResult.payment_id,
      updatedAt: new Date(),
    })

    console.log("Payment created successfully:", paymentResult.payment_id)

    return NextResponse.json({
      success: true,
      orderId,
      paymentId: paymentResult.payment_id,
      paymentUrl: paymentResult.payment_url,
      payAddress: paymentResult.pay_address,
      payAmount: paymentResult.pay_amount,
      payCurrency: paymentResult.pay_currency,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
