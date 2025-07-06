import { NextResponse } from "next/server"
import { TicketStockModel } from "@/lib/models/TicketStock"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    console.log(`🔄 Cancelling order: ${orderId}`)

    // Get the order details
    const order = await KaspaBirthdayTicketsModel.findByOrderId(orderId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Release the reservation
    const released = await TicketStockModel.releaseReservation(order.ticketType, order.quantity, orderId)

    if (released) {
      // Update order status
      await KaspaBirthdayTicketsModel.updateByOrderId(orderId, {
        paymentStatus: "cancelled",
        updatedAt: new Date(),
      })

      console.log(`✅ Successfully cancelled order ${orderId}`)

      return NextResponse.json({
        success: true,
        message: "Order cancelled successfully",
      })
    } else {
      return NextResponse.json(
        {
          error: "Failed to release reservation",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Cancel order error:", error)
    return NextResponse.json(
      {
        error: "Failed to cancel order",
      },
      { status: 500 },
    )
  }
}
