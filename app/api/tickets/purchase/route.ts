import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"
import { TicketStockModel } from "@/models/ticketStock"
import { PaymentModel } from "@/models/payment"
import { sendConfirmationEmail } from "@/utils/emails"
import clientPromise from "@/lib/mongodb"

const PurchaseRequestSchema = z.object({
  ticketType: z.string(),
  quantity: z.number().min(1),
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = PurchaseRequestSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    const { ticketType, quantity, email } = result.data

    // Generate a unique order ID
    const orderId = uuidv4()

    // After validating the request, add reservation logic:
    const reservationExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Check availability and reserve tickets
    const canReserve = await TicketStockModel.reserveTickets(
      ticketType,
      quantity,
      reservationExpiry,
      orderId,
      undefined, // paymentId will be added after payment creation
    )

    if (!canReserve) {
      return NextResponse.json({ error: "Tickets are no longer available" }, { status: 400 })
    }

    // Create a payment intent
    const payment = await PaymentModel.createPaymentIntent(quantity, ticketType, orderId)

    // Update reservation with payment ID
    const reservationCollection = await (await clientPromise).db("kaspa_birthday").collection("ticket_reservations")

    await reservationCollection.updateOne({ orderId, status: "active" }, { $set: { paymentId: payment.payment_id } })

    // Send confirmation email
    await sendConfirmationEmail(email, quantity, ticketType, payment.client_secret, orderId)

    return NextResponse.json({ clientSecret: payment.client_secret, orderId }, { status: 200 })
  } catch (error: any) {
    console.error("Error in purchase route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
