import { NextResponse } from "next/server"
import { NOWPaymentsAPI } from "@/lib/nowpayments"

export async function GET(request: Request, { params }: { params: { paymentId: string } }) {
  try {
    const { paymentId } = params

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID required" }, { status: 400 })
    }

    const nowPayments = new NOWPaymentsAPI()
    const paymentStatus = await nowPayments.getPaymentStatus(paymentId)

    if (paymentStatus.error) {
      return NextResponse.json({ error: paymentStatus.error }, { status: 400 })
    }

    return NextResponse.json(paymentStatus)
  } catch (error) {
    console.error("Payment status error:", error)
    return NextResponse.json({ error: "Failed to get payment status" }, { status: 500 })
  }
}
