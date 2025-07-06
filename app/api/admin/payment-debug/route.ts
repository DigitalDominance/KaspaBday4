import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"
import { KaspaBirthdayTicketsModel } from "@/lib/models/KaspaBirthdayTickets"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")
    const orderId = searchParams.get("orderId")

    if (!paymentId && !orderId) {
      return NextResponse.json({ error: "Payment ID or Order ID required" }, { status: 400 })
    }

    console.log(`🔍 Debug payment: ${paymentId || `order:${orderId}`}`)

    const nowPayments = new NOWPaymentsAPI()
    let nowPaymentsStatus = null
    let nowPaymentsListStatus = null
    let dbTicket = null

    // Get status from our database
    if (paymentId) {
      dbTicket = await KaspaBirthdayTicketsModel.findByPaymentId(paymentId)
    } else if (orderId) {
      dbTicket = await KaspaBirthdayTicketsModel.findByOrderId(orderId)
    }

    if (dbTicket && dbTicket.paymentId) {
      try {
        // Try individual payment endpoint
        nowPaymentsStatus = await nowPayments.getPaymentStatus(dbTicket.paymentId)
      } catch (error) {
        console.error("Individual endpoint failed:", error)
      }

      try {
        // Try payments list endpoint
        nowPaymentsListStatus = await nowPayments.getPaymentStatusFromList(dbTicket.paymentId)
      } catch (error) {
        console.error("List endpoint failed:", error)
      }
    }

    return NextResponse.json({
      paymentId: dbTicket?.paymentId || paymentId,
      orderId: dbTicket?.orderId || orderId,
      individualEndpoint: nowPaymentsStatus
        ? {
            payment_status: nowPaymentsStatus.payment_status,
            actually_paid: nowPaymentsStatus.actually_paid,
            pay_amount: nowPaymentsStatus.pay_amount,
            created_at: nowPaymentsStatus.created_at,
            updated_at: nowPaymentsStatus.updated_at,
          }
        : "Failed to fetch",
      listEndpoint: nowPaymentsListStatus
        ? {
            payment_status: nowPaymentsListStatus.payment_status,
            actually_paid: nowPaymentsListStatus.actually_paid,
            pay_amount: nowPaymentsListStatus.pay_amount,
            created_at: nowPaymentsListStatus.created_at,
            updated_at: nowPaymentsListStatus.updated_at,
          }
        : "Failed to fetch",
      databaseStatus: dbTicket
        ? {
            paymentStatus: dbTicket.paymentStatus,
            emailSent: dbTicket.emailSent,
            paymentConfirmationEmailSent: dbTicket.paymentConfirmationEmailSent,
            createdAt: dbTicket.createdAt,
            updatedAt: dbTicket.updatedAt,
            qrCode: dbTicket.qrCode ? "Present" : "Missing",
          }
        : "Not found",
      statusComparison: {
        individual_vs_db:
          nowPaymentsStatus && dbTicket ? nowPaymentsStatus.payment_status !== dbTicket.paymentStatus : "N/A",
        list_vs_db:
          nowPaymentsListStatus && dbTicket ? nowPaymentsListStatus.payment_status !== dbTicket.paymentStatus : "N/A",
        individual_vs_list:
          nowPaymentsStatus && nowPaymentsListStatus
            ? nowPaymentsStatus.payment_status !== nowPaymentsListStatus.payment_status
            : "N/A",
      },
      recommendations: {
        useListEndpoint: nowPaymentsListStatus && !nowPaymentsStatus ? "YES - Individual endpoint failed" : "Optional",
        needsTicketGeneration:
          dbTicket &&
          (nowPaymentsListStatus?.payment_status === "finished" || nowPaymentsStatus?.payment_status === "finished") &&
          !dbTicket.emailSent
            ? "YES"
            : "NO",
      },
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
