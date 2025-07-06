import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { sendTicketEmail } from "@/lib/email"

interface NOWPaymentsResponse {
  payment_id: number
  payment_status: string
  pay_address: string
  price_amount: number
  price_currency: string
  pay_amount: number
  pay_currency: string
  order_id: string
  order_description: string
  purchase_id: string
  created_at: string
  updated_at: string
}

interface NOWPaymentsListResponse {
  data: NOWPaymentsResponse[]
}

async function fetchPaymentFromList(paymentId: string): Promise<NOWPaymentsResponse | null> {
  try {
    const response = await fetch(
      `https://api.nowpayments.io/v1/payment/?limit=100&page=0&sortBy=created_at&orderBy=desc`,
      {
        headers: {
          "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
        },
      },
    )

    if (!response.ok) {
      console.error("NOWPayments list API error:", response.status, response.statusText)
      return null
    }

    const data: NOWPaymentsListResponse = await response.json()
    const payment = data.data.find((p) => p.payment_id.toString() === paymentId)

    return payment || null
  } catch (error) {
    console.error("Error fetching payment from list:", error)
    return null
  }
}

async function fetchPaymentStatus(paymentId: string): Promise<NOWPaymentsResponse | null> {
  try {
    const response = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
      },
    })

    if (!response.ok) {
      console.error("NOWPayments API error:", response.status, response.statusText)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching payment status:", error)
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { paymentId: string } }) {
  try {
    const { paymentId } = params

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get current status from database
    const dbTicket = await db.collection("kaspa_birthday_tickets").findOne({ paymentId })

    if (!dbTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Try to get fresh status from NOWPayments (list endpoint first, then individual)
    let paymentData = await fetchPaymentFromList(paymentId)
    if (!paymentData) {
      paymentData = await fetchPaymentStatus(paymentId)
    }

    if (!paymentData) {
      console.error("Could not fetch payment data from NOWPayments")
      return NextResponse.json({
        status: dbTicket.paymentStatus || "waiting",
        ticket: dbTicket,
      })
    }

    const currentStatus = paymentData.payment_status
    console.log(`Payment ${paymentId} status: ${currentStatus}`)

    // Update database if status changed
    if (currentStatus !== dbTicket.paymentStatus) {
      console.log(`Updating payment ${paymentId} status from ${dbTicket.paymentStatus} to ${currentStatus}`)

      const updateData: any = {
        paymentStatus: currentStatus,
        updatedAt: new Date(),
      }

      // If payment is finished and ticket hasn't been generated yet
      if (currentStatus === "finished" && !dbTicket.ticketGenerated) {
        console.log(`Generating ticket for payment ${paymentId}`)

        // Send ticket email
        const emailSent = await sendTicketEmail({
          orderId: dbTicket.orderId,
          customerName: dbTicket.customerName,
          customerEmail: dbTicket.customerEmail,
          ticketType: dbTicket.ticketType,
          quantity: dbTicket.quantity,
          totalAmount: dbTicket.totalAmount,
        })

        updateData.ticketGenerated = true
        updateData.ticketGeneratedAt = new Date()
        updateData.emailSent = emailSent
        updateData.emailSentAt = emailSent ? new Date() : null

        console.log(`Ticket generated and email sent (${emailSent}) for payment ${paymentId}`)
      }

      await db.collection("kaspa_birthday_tickets").updateOne({ paymentId }, { $set: updateData })

      // Get updated ticket
      const updatedTicket = await db.collection("kaspa_birthday_tickets").findOne({ paymentId })

      return NextResponse.json({
        status: currentStatus,
        ticket: updatedTicket,
        updated: true,
      })
    }

    // No status change
    return NextResponse.json({
      status: currentStatus,
      ticket: dbTicket,
      updated: false,
    })
  } catch (error) {
    console.error("Error checking payment status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
