import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { KaspaBirthdayTickets } from "@/lib/models/KaspaBirthdayTickets"
import { sendTicketEmail } from "@/lib/email"
import { generateQRCode } from "@/lib/qr-generator"

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY
const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1"

export async function GET(request: Request, { params }: { params: { paymentId: string } }) {
  try {
    const { paymentId } = params

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Get payment status from NOWPayments
    let paymentStatus = "waiting"
    let paymentData: any = {}

    try {
      // First try to get from payments list (more reliable)
      const listResponse = await fetch(`${NOWPAYMENTS_API_URL}/payment/${paymentId}`, {
        headers: {
          "x-api-key": NOWPAYMENTS_API_KEY!,
        },
      })

      if (listResponse.ok) {
        paymentData = await listResponse.json()
        paymentStatus = paymentData.payment_status || "waiting"
      } else {
        console.log(`Payment ${paymentId} not found in individual endpoint, trying list...`)

        // Fallback to payments list
        const paymentsResponse = await fetch(`${NOWPAYMENTS_API_URL}/payment/?limit=100&page=0`, {
          headers: {
            "x-api-key": NOWPAYMENTS_API_KEY!,
          },
        })

        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json()
          const payment = paymentsData.data?.find((p: any) => p.payment_id === paymentId)

          if (payment) {
            paymentData = payment
            paymentStatus = payment.payment_status || "waiting"
          }
        }
      }
    } catch (apiError) {
      console.error("NOWPayments API error:", apiError)
      // Continue with database status if API fails
    }

    // Get ticket from database
    const ticket = await KaspaBirthdayTickets.findOne({ paymentId })

    if (!ticket) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Update ticket status if it changed
    const previousStatus = ticket.paymentStatus
    if (paymentStatus !== previousStatus) {
      ticket.paymentStatus = paymentStatus
      ticket.updatedAt = new Date()

      // Handle status changes
      if (paymentStatus === "finished" && previousStatus !== "finished") {
        // Confirm stock sale
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tickets/stock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketType: ticket.ticketType,
            action: "confirm",
            quantity: ticket.quantity,
          }),
        })

        // Generate and send ticket
        if (!ticket.ticketGenerated) {
          try {
            const qrData = {
              orderId: ticket.orderId,
              customerName: ticket.customerName,
              ticketType: ticket.ticketType,
              quantity: ticket.quantity,
              eventDate: "2024-08-01",
              venue: "Kaspa Birthday Celebration",
            }

            const qrCodeSvg = await generateQRCode(JSON.stringify(qrData))

            await sendTicketEmail({
              to: ticket.customerEmail,
              customerName: ticket.customerName,
              ticketType: ticket.ticketName,
              quantity: ticket.quantity,
              orderId: ticket.orderId,
              qrCode: qrCodeSvg,
            })

            ticket.ticketGenerated = true
            ticket.ticketSentAt = new Date()
          } catch (emailError) {
            console.error("Failed to send ticket email:", emailError)
          }
        }
      } else if (
        ["failed", "expired", "refunded"].includes(paymentStatus) &&
        !["failed", "expired", "refunded"].includes(previousStatus)
      ) {
        // Release reserved stock on failure
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tickets/stock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketType: ticket.ticketType,
            action: "release",
            quantity: ticket.quantity,
          }),
        })
      }

      await ticket.save()
    }

    // Return payment status with all necessary data
    return NextResponse.json({
      paymentId: ticket.paymentId,
      paymentStatus: paymentStatus,
      payAddress: ticket.payAddress,
      payAmount: ticket.payAmount,
      payCurrency: ticket.payCurrency,
      actuallyPaid: paymentData.actually_paid || 0,
      updatedAt: ticket.updatedAt.toISOString(),
      orderId: ticket.orderId,
      ticketGenerated: ticket.ticketGenerated || false,
    })
  } catch (error) {
    console.error("Payment status check error:", error)
    return NextResponse.json({ error: "Failed to check payment status" }, { status: 500 })
  }
}
