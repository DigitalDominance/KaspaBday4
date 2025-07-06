import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"
import { generateTicketQR } from "@/lib/qr-generator"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-nowpayments-sig")
    const body = await request.json()

    if (!signature) {
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    const nowPayments = new NOWPaymentsAPI()

    // Verify IPN signature
    if (!nowPayments.verifyIPN(signature, body)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Process payment status update
    const { payment_id, payment_status, order_id, actually_paid, actually_paid_at_fiat, pay_currency } = body

    console.log(`Payment ${payment_id} status: ${payment_status}`)

    // Find the ticket record
    const ticket = await KaspaBirthdayTicketsModel.findByPaymentId(payment_id)
    if (!ticket) {
      console.error(`Ticket not found for payment ID: ${payment_id}`)
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Update payment status
    const updateData: any = {
      paymentStatus: payment_status,
      actuallyPaid: actually_paid,
    }

    // If payment is finished, generate ticket QR code
    if (payment_status === "finished") {
      const ticketData = generateTicketQR({
        orderId: ticket.orderId,
        customerName: ticket.customerName,
        customerEmail: ticket.customerEmail,
        ticketType: ticket.ticketType,
        quantity: ticket.quantity,
        eventDate: "November 7-9, 2025",
      })

      updateData.qrCode = ticketData.qrCodeDataUrl
      updateData.ticketData = ticketData.ticketInfo

      console.log(`Ticket generated for order: ${ticket.orderId}`)
    }

    // Update the ticket record
    await KaspaBirthdayTicketsModel.updatePaymentStatus(payment_id, updateData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("IPN error:", error)
    return NextResponse.json({ error: "IPN processing failed" }, { status: 500 })
  }
}
