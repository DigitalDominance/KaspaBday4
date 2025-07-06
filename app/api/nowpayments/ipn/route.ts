import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"
import { TicketStockModel } from "@/lib/models/TicketStock"
import { TicketReservationModel } from "@/lib/models/TicketReservation"
import { generateQRCode } from "@/lib/qr-generator"
import { sendTicketEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("📨 IPN received:", body)

    // Verify the IPN signature
    const nowPayments = new NOWPaymentsAPI()
    const isValid = nowPayments.verifyIPN(body, request.headers.get("x-nowpayments-sig") || "")

    if (!isValid) {
      console.error("❌ Invalid IPN signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const { payment_id, payment_status, order_id } = body

    // Update the ticket order in database
    const updatedOrder = await KaspaBirthdayTicketsModel.updatePaymentStatus(payment_id, payment_status)

    if (!updatedOrder) {
      console.error("❌ Order not found for payment:", payment_id)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    console.log(`📋 Updated order ${order_id} status to: ${payment_status}`)

    // Handle different payment statuses
    switch (payment_status) {
      case "finished":
      case "confirmed":
        // Confirm the reservation
        await TicketReservationModel.confirmReservation(payment_id)

        // Confirm the sale in stock system
        await TicketStockModel.confirmSale(updatedOrder.ticketType, updatedOrder.quantity)

        // Generate QR code if not already generated
        if (!updatedOrder.qrCode) {
          const qrCode = await generateQRCode(updatedOrder.orderId)
          await KaspaBirthdayTicketsModel.updateQRCode(updatedOrder.orderId, qrCode)
          updatedOrder.qrCode = qrCode
        }

        // Send ticket email
        try {
          await sendTicketEmail({
            to: updatedOrder.customerEmail,
            customerName: updatedOrder.customerName,
            ticketType: updatedOrder.ticketName,
            quantity: updatedOrder.quantity,
            orderId: updatedOrder.orderId,
            qrCode: updatedOrder.qrCode,
            totalAmount: updatedOrder.totalAmount,
            currency: updatedOrder.currency,
          })
          console.log("✅ Ticket email sent successfully")
        } catch (emailError) {
          console.error("❌ Failed to send ticket email:", emailError)
        }

        console.log(`✅ Payment confirmed for order: ${order_id}`)
        break

      case "failed":
      case "refunded":
      case "expired":
        // Release the reservation
        const reservation = await TicketReservationModel.getByPaymentId(payment_id)
        if (reservation && reservation.status === "active") {
          await TicketReservationModel.expireReservation(payment_id)
          await TicketStockModel.releaseReservation(reservation.ticketType, reservation.quantity)
          console.log(`🔄 Released reservation for failed payment: ${payment_id}`)
        }
        break

      default:
        console.log(`ℹ️ Payment status ${payment_status} - no action needed`)
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ IPN processing error:", error)
    return NextResponse.json({ error: "IPN processing failed" }, { status: 500 })
  }
}
