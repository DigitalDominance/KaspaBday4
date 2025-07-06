import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"
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
    const { ticketType, quantity, customerInfo, currency } = body

    // Validate input
    if (!ticketType || !quantity || !customerInfo?.name || !customerInfo?.email || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check ticket availability in stock system
    const isAvailable = await TicketStockModel.isAvailable(ticketType, quantity)
    if (!isAvailable) {
      return NextResponse.json({ error: "Tickets not available" }, { status: 400 })
    }

    // Get ticket info
    const ticketInfo = TICKET_PRICES[ticketType as keyof typeof TICKET_PRICES]
    if (!ticketInfo) {
      return NextResponse.json({ error: "Invalid ticket type" }, { status: 400 })
    }

    const totalAmount = ticketInfo.price * quantity

    // Create order ID
    const orderId = `KASPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Calculate expiration time (30 minutes from now)
    const expiresAt = new Date(Date.now() + RESERVATION_TIMEOUT)

    // Reserve tickets in stock system with expiration
    const reserved = await TicketStockModel.reserveTickets(ticketType, quantity, expiresAt)
    if (!reserved) {
      return NextResponse.json({ error: "Failed to reserve tickets" }, { status: 400 })
    }

    try {
      // Create NOWPayments payment
      const nowPayments = new NOWPaymentsAPI()

      const paymentData = {
        price_amount: totalAmount,
        price_currency: "usd",
        pay_currency: currency,
        order_id: orderId,
        order_description: `Kaspa 4th Birthday - ${quantity}x ${ticketInfo.name} for ${customerInfo.name}`,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/nowpayments/ipn`,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/ticket-success?order=${orderId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tickets`,
      }

      const payment = await nowPayments.createPayment(paymentData)

      if (payment.error) {
        // Release reservation if payment creation failed
        await TicketStockModel.releaseReservation(ticketType, quantity)
        return NextResponse.json({ error: payment.error }, { status: 400 })
      }

      // Store ticket order in database with expiration
      const ticketRecord = await KaspaBirthdayTicketsModel.create({
        orderId,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        ticketType,
        ticketName: ticketInfo.name,
        quantity,
        pricePerTicket: ticketInfo.price,
        totalAmount: totalAmount.toString(),
        currency,
        paymentId: payment.payment_id,
        paymentStatus: payment.payment_status,
        payAddress: payment.pay_address,
        payAmount: payment.pay_amount,
        payCurrency: payment.pay_currency,
        reservationExpiresAt: expiresAt,
      })

      return NextResponse.json({
        success: true,
        order: {
          orderId,
          paymentId: payment.payment_id,
          payAddress: payment.pay_address,
          payAmount: payment.pay_amount,
          payCurrency: payment.pay_currency,
          paymentStatus: payment.payment_status,
          expiresAt: expiresAt.toISOString(),
        },
        payment: payment,
      })
    } catch (error) {
      // Release reservation if anything fails
      await TicketStockModel.releaseReservation(ticketType, quantity)
      throw error
    }
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
