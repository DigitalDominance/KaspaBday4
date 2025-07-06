import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"
import { generateTicketQR } from "@/lib/qr-generator"

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
    const { payment_id, payment_status, order_id } = body

    console.log(`Payment ${payment_id} status: ${payment_status}`)

    // If payment is finished, generate ticket
    if (payment_status === "finished") {
      // In production, fetch order from database
      // For demo, we'll simulate the order data
      const ticketData = generateTicketQR({
        orderId: order_id,
        customerName: "Customer Name", // Get from database
        customerEmail: "customer@email.com", // Get from database
        ticketType: "2-day", // Get from database
        quantity: 1, // Get from database
        eventDate: "November 7-9, 2025",
      })

      // Store ticket QR code in database
      console.log("Ticket generated:", ticketData.ticketInfo)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("IPN error:", error)
    return NextResponse.json({ error: "IPN processing failed" }, { status: 500 })
  }
}
