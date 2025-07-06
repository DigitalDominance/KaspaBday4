import { NextResponse } from "next/server"
import { TicketStockModel } from "@/lib/models/TicketStock"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"

export async function POST(request: Request) {
  try {
    const { paymentId, orderId } = await request.json()

    if (!paymentId && !orderId) {
      return NextResponse.json({ error: "Payment ID or Order ID required" }, { status: 400 })
    }

    // Get order details
    const order = orderId
      ? await KaspaBirthdayTicketsModel.getOrderById(orderId)
      : await KaspaBirthdayTicketsModel.getOrderByPaymentId(paymentId)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Cancel payment with NOWPayments if payment exists
    if (order.paymentId) {
      try {
        await fetch(`https://api.nowpayments.io/v1/payment/${order.paymentId}`, {
          method: "DELETE",
          headers: {
            "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
          },
        })
      } catch (error) {
        console.error("Failed to cancel NOWPayments payment:", error)
        // Continue with local cancellation even if NOWPayments fails
      }
    }

    // Release the ticket reservation
    await TicketStockModel.releaseReservation(order.ticketType, order.quantity, order._id.toString())

    // Update order status
    await KaspaBirthdayTicketsModel.updateOrder(order._id.toString(), {
      status: "cancelled",
      paymentStatus: "cancelled",
      updatedAt: new Date(),
    })

    console.log(`✅ Cancelled order ${order._id} and released ${order.quantity}x ${order.ticketType} tickets`)

    return NextResponse.json({
      success: true,
      message: "Payment cancelled and tickets released",
    })
  } catch (error) {
    console.error("Cancel error:", error)
    return NextResponse.json({ error: "Failed to cancel payment" }, { status: 500 })
  }
}
