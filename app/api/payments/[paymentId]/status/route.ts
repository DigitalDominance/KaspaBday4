import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"
import { TicketStockModel } from "@/lib/models/TicketStock"

export async function GET(request: Request, { params }: { params: { paymentId: string } }) {
  try {
    const { paymentId } = params

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    console.log(`🔍 Checking payment status for: ${paymentId}`)

    // Get payment status from NOWPayments
    const nowPayments = new NOWPaymentsAPI()
    const paymentStatus = await nowPayments.getPaymentStatus(paymentId)

    // Get order from database
    const order = await KaspaBirthdayTicketsModel.findByPaymentId(paymentId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if payment is finished and we need to confirm the sale
    if (paymentStatus.payment_status === "finished" && order.paymentStatus !== "finished") {
      console.log(`✅ Payment ${paymentId} is finished, confirming sale...`)

      // Confirm the sale in stock system
      await TicketStockModel.confirmSale(order.ticketType, order.quantity, order.orderId)

      // Update order status
      await KaspaBirthdayTicketsModel.updateByPaymentId(paymentId, {
        paymentStatus: "finished",
        paidAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Check if reservation has expired
    const now = new Date()
    const expiresAt = new Date(order.reservationExpiresAt)
    const timeRemaining = expiresAt.getTime() - now.getTime()

    return NextResponse.json({
      success: true,
      payment: {
        paymentId: paymentStatus.payment_id,
        paymentStatus: paymentStatus.payment_status,
        payAddress: paymentStatus.pay_address,
        payAmount: paymentStatus.pay_amount,
        payCurrency: paymentStatus.pay_currency,
        actuallyPaid: paymentStatus.actually_paid,
        createdAt: paymentStatus.created_at,
        updatedAt: paymentStatus.updated_at,
      },
      order: {
        orderId: order.orderId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        ticketType: order.ticketType,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        expiresAt: order.reservationExpiresAt,
        timeRemaining: Math.max(0, timeRemaining),
        expired: timeRemaining <= 0,
      },
    })
  } catch (error) {
    console.error("Payment status error:", error)
    return NextResponse.json(
      {
        error: "Failed to get payment status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
