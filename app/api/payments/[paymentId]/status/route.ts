import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { sendTicketEmail } from "@/lib/email"

interface NOWPaymentsResponse {
  data: Array<{
    payment_id: number
    invoice_id: number
    payment_status: string
    pay_address: string
    payin_extra_id: string | null
    price_amount: number
    price_currency: string
    pay_amount: number
    actually_paid: number
    pay_currency: string
    order_id: string | null
    order_description: string | null
    purchase_id: number
    outcome_amount: number
    outcome_currency: string
    payout_hash: string | null
    payin_hash: string | null
    created_at: string
    updated_at: string
    type: string
  }>
}

export async function GET(request: NextRequest, { params }: { params: { paymentId: string } }) {
  try {
    const paymentId = params.paymentId

    if (!paymentId) {
      return NextResponse.json({ success: false, error: "Payment ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // First try to get status from NOWPayments list endpoint (more reliable)
    let paymentStatus = "waiting"
    let paymentData = null

    try {
      const listResponse = await fetch(
        `https://api.nowpayments.io/v1/payment/?limit=100&page=0&sortBy=created_at&orderBy=desc`,
        {
          headers: {
            "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
          },
        },
      )

      if (listResponse.ok) {
        const listData: NOWPaymentsResponse = await listResponse.json()
        paymentData = listData.data.find((p) => p.payment_id.toString() === paymentId)

        if (paymentData) {
          paymentStatus = paymentData.payment_status
          console.log(`Payment ${paymentId} status from list: ${paymentStatus}`)
        }
      }
    } catch (error) {
      console.error("Error fetching from list endpoint:", error)
    }

    // Fallback to individual payment endpoint if list didn't work
    if (!paymentData) {
      try {
        const individualResponse = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
          headers: {
            "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
          },
        })

        if (individualResponse.ok) {
          paymentData = await individualResponse.json()
          paymentStatus = paymentData.payment_status
          console.log(`Payment ${paymentId} status from individual: ${paymentStatus}`)
        }
      } catch (error) {
        console.error("Error fetching from individual endpoint:", error)
      }
    }

    // Find the ticket in our database
    const ticket = await db.collection("kaspa_birthday_tickets").findOne({
      paymentId: paymentId,
    })

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 })
    }

    // Update ticket status if it changed
    if (ticket.paymentStatus !== paymentStatus) {
      console.log(`Updating ticket ${ticket.orderId} status from ${ticket.paymentStatus} to ${paymentStatus}`)

      await db.collection("kaspa_birthday_tickets").updateOne(
        { paymentId: paymentId },
        {
          $set: {
            paymentStatus: paymentStatus,
            updatedAt: new Date(),
          },
        },
      )

      // If payment is now finished and we haven't sent the ticket email yet
      if (paymentStatus === "finished" && !ticket.ticketEmailSent) {
        console.log(`Payment completed for ${ticket.orderId}, sending ticket email...`)

        try {
          const emailSent = await sendTicketEmail({
            orderId: ticket.orderId,
            customerName: ticket.customerName,
            customerEmail: ticket.customerEmail,
            ticketType: ticket.ticketType,
            ticketName: ticket.ticketName,
            quantity: ticket.quantity,
            totalAmount: ticket.totalAmount,
          })

          if (emailSent) {
            await db.collection("kaspa_birthday_tickets").updateOne(
              { paymentId: paymentId },
              {
                $set: {
                  ticketEmailSent: true,
                  ticketEmailSentAt: new Date(),
                },
              },
            )
            console.log(`Ticket email sent successfully for ${ticket.orderId}`)
          } else {
            console.error(`Failed to send ticket email for ${ticket.orderId}`)
          }
        } catch (emailError) {
          console.error("Error sending ticket email:", emailError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentId,
      status: paymentStatus,
      orderId: ticket.orderId,
      customerName: ticket.customerName,
      ticketType: ticket.ticketType,
      quantity: ticket.quantity,
      totalAmount: ticket.totalAmount,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error checking payment status:", error)

    return NextResponse.json({ success: false, error: "Failed to check payment status" }, { status: 500 })
  }
}
