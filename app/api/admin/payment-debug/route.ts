import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID required" }, { status: 400 })
    }

    console.log(`🔍 Debug payment: ${paymentId}`)

    // Get status from NOWPayments
    const nowPayments = new NOWPaymentsAPI()
    const nowPaymentsStatus = await nowPayments.getPaymentStatus(paymentId)

    // Get status from our database
    const dbTicket = await KaspaBirthdayTicketsModel.findByPaymentId(paymentId)

    return NextResponse.json({
      paymentId,
      nowPaymentsStatus: {
        payment_status: nowPaymentsStatus.payment_status,
        actually_paid: nowPaymentsStatus.actually_paid,
        pay_amount: nowPaymentsStatus.pay_amount,
        created_at: nowPaymentsStatus.created_at,
        updated_at: nowPaymentsStatus.updated_at,
      },
      databaseStatus: dbTicket
        ? {
            paymentStatus: dbTicket.paymentStatus,
            emailSent: dbTicket.emailSent,
            paymentConfirmationEmailSent: dbTicket.paymentConfirmationEmailSent,
            createdAt: dbTicket.createdAt,
            updatedAt: dbTicket.updatedAt,
          }
        : null,
      mismatch: dbTicket && dbTicket.paymentStatus !== nowPaymentsStatus.payment_status,
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
