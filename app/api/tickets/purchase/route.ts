import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { TicketStockModel } from "@/lib/models/TicketStock"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"
import { NOWPaymentsAPI } from "@/lib/nowpayments"

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { ticketType, quantity, customerInfo, currency } = body

    console.log("Purchase request:", { ticketType, quantity, customerInfo, currency })

    // Validate input
    if (!ticketType || !quantity || !customerInfo || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check and reserve stock
    const stockResult = await TicketStockModel.reserveTickets(ticketType, quantity)
    if (!stockResult.success) {
      return NextResponse.json({ error: stockResult.error }, { status: 400 })
    }

    const reservationId = stockResult.reservationId

    try {
      // Get ticket price
      const ticketPrices = {
        "1-day": 75,
        "3-day": 299,
        vip: 999,
      }

      const ticketPrice = ticketPrices[ticketType as keyof typeof ticketPrices]
      if (!ticketPrice) {
        throw new Error("Invalid ticket type")
      }

      const totalAmount = ticketPrice * quantity

      // Create NOWPayments payment
      const nowPayments = new NOWPaymentsAPI()
      const paymentData = {
        price_amount: totalAmount,
        price_currency: "USD",
        pay_currency: currency.toLowerCase(),
        order_id: `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        order_description: `${quantity}x ${ticketType} ticket(s) for Kaspa Birthday Event`,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/nowpayments/ipn`,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/ticket-success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      }

      console.log("Creating NOWPayments payment:", paymentData)
      const payment = await nowPayments.createPayment(paymentData)
      console.log("NOWPayments response:", payment)

      if (!payment.payment_id) {
        throw new Error("Failed to create payment")
      }

      // Calculate expiration time (30 minutes from now)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

      // Save ticket order to database
      const ticketOrder = new KaspaBirthdayTicketsModel({
        orderId: paymentData.order_id,
        paymentId: payment.payment_id,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        ticketType,
        quantity,
        totalAmount,
        currency: currency.toLowerCase(),
        paymentStatus: "waiting",
        payAddress: payment.pay_address,
        payAmount: payment.pay_amount,
        payCurrency: payment.pay_currency,
        reservationId,
        expiresAt,
        createdAt: new Date(),
      })

      await ticketOrder.save()
      console.log("Ticket order saved:", ticketOrder.orderId)

      return NextResponse.json({
        success: true,
        order: {
          orderId: paymentData.order_id,
          paymentId: payment.payment_id,
          payAddress: payment.pay_address,
          payAmount: payment.pay_amount,
          payCurrency: payment.pay_currency,
          paymentStatus: "waiting",
          expiresAt: expiresAt.toISOString(),
        },
      })
    } catch (paymentError) {
      console.error("Payment creation failed, releasing reservation:", paymentError)
      // Release the reservation if payment creation fails
      await TicketStockModel.releaseReservation(reservationId)
      throw paymentError
    }
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Purchase failed" }, { status: 500 })
  }
}
