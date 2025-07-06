import { NextResponse } from "next/server"
import { EmailService } from "@/lib/email"
import { generateTicketQR } from "@/lib/qr-generator"

export async function POST(request: Request) {
  try {
    const { email, testType = "ticket" } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email address required" }, { status: 400 })
    }

    console.log(`🧪 Testing ${testType} email to: ${email}`)

    // Create test ticket data
    const testTicket = {
      orderId: `TEST-${Date.now()}`,
      customerName: "Andrew Zalesski",
      customerEmail: email,
      ticketType: "2-day",
      ticketName: "2-Day Pass",
      quantity: 1,
      pricePerTicket: 125,
      totalAmount: 125,
      currency: "btc",
      paymentId: "test-payment-id",
      paymentStatus: "finished",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    let emailSent = false

    if (testType === "confirmation") {
      // Send payment confirmation email
      console.log("📧 Sending payment confirmation email...")
      emailSent = await EmailService.sendPaymentConfirmationEmail(testTicket as any)
    } else {
      // Send full ticket email with QR code
      console.log("🎫 Generating QR code and sending ticket email...")
      const ticketData = generateTicketQR({
        orderId: testTicket.orderId,
        customerName: testTicket.customerName,
        customerEmail: testTicket.customerEmail,
        ticketType: testTicket.ticketType,
        quantity: testTicket.quantity,
        eventDate: "November 7-9, 2025",
      })

      emailSent = await EmailService.sendTicketEmail({
        ticket: testTicket as any,
        qrCodeDataUrl: ticketData.qrCodeDataUrl,
      })
    }

    if (emailSent) {
      console.log(`✅ Test email sent successfully!`)
      return NextResponse.json({
        success: true,
        message: `✅ Test ${testType} email sent successfully to ${email}! Check your inbox (and spam folder).`,
      })
    } else {
      console.log(`❌ Failed to send test email`)
      return NextResponse.json({ error: "Failed to send test email - check your API key" }, { status: 500 })
    }
  } catch (error) {
    console.error("Email test error:", error)
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
  }
}
