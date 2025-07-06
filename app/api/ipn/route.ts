import { NextResponse } from "next/server"
import { KaspaBirthdayTicketsModel } from "@/models/KaspaBirthdayTicketsModel"
import { sendPaymentConfirmationEmail, sendTicketEmail } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const requestBody = await request.json()
    console.log("IPN Request Body:", requestBody)

    const { order_id: orderId, payment_id: paymentId, status } = requestBody

    if (!orderId || !paymentId || !status) {
      console.error("Missing required parameters in IPN request")
      return NextResponse.json({ status: "error", message: "Missing required parameters" }, { status: 400 })
    }

    const order = await KaspaBirthdayTicketsModel.findOne({ orderId })

    if (!order) {
      console.error("Order not found:", orderId)
      return NextResponse.json({ status: "error", message: "Order not found" }, { status: 404 })
    }

    // Update order status and payment ID
    order.paymentId = paymentId
    order.status = status

    await order.save()

    console.log(`Order ${orderId} updated with status: ${status}, paymentId: ${paymentId}`)

    // Send payment confirmation email for partially_paid or confirmed
    if ((status === "partially_paid" || status === "confirmed") && !order.paymentConfirmationEmailSent) {
      try {
        await sendPaymentConfirmationEmail(
          order.customerEmail,
          order.customerName,
          order.orderId,
          Number.parseFloat(order.totalAmount),
          order.currency,
        )

        await KaspaBirthdayTicketsModel.updateOne({ orderId }, { paymentConfirmationEmailSent: true })
        console.log("Payment confirmation email sent for order:", orderId)
      } catch (emailError) {
        console.error("Failed to send payment confirmation email:", emailError)
      }
    }

    // Send ticket email when payment is finished
    if (status === "finished" && !order.emailSent) {
      try {
        // Generate ticket numbers if not already generated
        let ticketNumbers = order.ticketNumbers
        if (!ticketNumbers || ticketNumbers.length === 0) {
          ticketNumbers = Array.from(
            { length: order.ticketQuantity },
            (_, i) => `KAS-${Date.now()}-${String(i + 1).padStart(3, "0")}`,
          )
        }

        await sendTicketEmail({
          orderId: order.orderId,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          ticketQuantity: order.ticketQuantity,
          totalAmount: Number.parseFloat(order.totalAmount),
          currency: order.currency,
          paymentId: order.paymentId,
          ticketNumbers: ticketNumbers,
        })

        await KaspaBirthdayTicketsModel.updateOne(
          { orderId },
          {
            emailSent: true,
            ticketNumbers: ticketNumbers,
            status: "completed",
          },
        )
        console.log("Ticket email sent for order:", orderId)
      } catch (emailError) {
        console.error("Failed to send ticket email:", emailError)
      }
    }

    return NextResponse.json({ status: "success", message: "IPN processed successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error processing IPN:", error)
    return NextResponse.json({ status: "error", message: "Failed to process IPN" }, { status: 500 })
  }
}
