import { Resend } from "resend"
import { generateQRCodeBase64 } from "./qr-generator"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "Kaspa Birthday Event <onboarding@resend.dev>"
const REPLY_TO_EMAIL = "support@kaspaevents.xyz"

// Kaspa logo as base64 (you can replace this with your actual logo)
const KASPA_LOGO_BASE64 =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9IiM0OUQ0NzAiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiPks8L3RleHQ+Cjwvc3ZnPgo="

interface TicketData {
  orderId: string
  customerName: string
  customerEmail: string
  ticketQuantity: number
  totalAmount: number
  currency: string
  paymentId: string
  ticketNumbers: string[]
}

export async function sendTicketEmail(ticketData: TicketData) {
  try {
    // Generate QR code with ticket information
    const qrData = JSON.stringify({
      orderId: ticketData.orderId,
      customerName: ticketData.customerName,
      ticketNumbers: ticketData.ticketNumbers,
      event: "Kaspa 4th Birthday Celebration",
      date: "March 15, 2025",
      venue: "Virtual Event",
    })

    const qrCodeBase64 = await generateQRCodeBase64(qrData)

    const ticketHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Kaspa Birthday Ticket</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; position: relative;">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"20\" cy=\"20\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/><circle cx=\"80\" cy=\"40\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/><circle cx=\"40\" cy=\"80\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>'); opacity: 0.3;"></div>
          
          <img src="${KASPA_LOGO_BASE64}" alt="Kaspa Logo" style="width: 80px; height: 80px; margin-bottom: 20px; position: relative; z-index: 1;">
          
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3); position: relative; z-index: 1;">
            🎉 Your Ticket is Ready!
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px; position: relative; z-index: 1;">
            Kaspa 4th Birthday Celebration
          </p>
        </div>

        <!-- Ticket Details -->
        <div style="padding: 40px 30px;">
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 15px; padding: 30px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px; font-weight: bold;">
              🎫 Ticket Information
            </h2>
            
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-weight: 500;">Order ID:</span>
                <span style="color: #1e293b; font-weight: bold; font-family: monospace;">${ticketData.orderId}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-weight: 500;">Customer:</span>
                <span style="color: #1e293b; font-weight: bold;">${ticketData.customerName}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-weight: 500;">Tickets:</span>
                <span style="color: #1e293b; font-weight: bold;">${ticketData.ticketQuantity} ticket${ticketData.ticketQuantity > 1 ? "s" : ""}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-weight: 500;">Ticket Numbers:</span>
                <span style="color: #1e293b; font-weight: bold; font-family: monospace;">${ticketData.ticketNumbers.join(", ")}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                <span style="color: #64748b; font-weight: 500;">Total Paid:</span>
                <span style="color: #059669; font-weight: bold; font-size: 18px;">${ticketData.totalAmount} ${ticketData.currency.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <!-- Event Details -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 15px; padding: 30px; margin-bottom: 30px; border: 1px solid #fbbf24;">
            <h2 style="color: #92400e; margin: 0 0 20px 0; font-size: 24px; font-weight: bold;">
              📅 Event Details
            </h2>
            
            <div style="color: #92400e; line-height: 1.8; font-size: 16px;">
              <p style="margin: 0 0 10px 0;"><strong>🎂 Event:</strong> Kaspa 4th Birthday Celebration</p>
              <p style="margin: 0 0 10px 0;"><strong>📅 Date:</strong> March 15, 2025</p>
              <p style="margin: 0 0 10px 0;"><strong>🕐 Time:</strong> 7:00 PM UTC</p>
              <p style="margin: 0 0 10px 0;"><strong>🌐 Venue:</strong> Virtual Event</p>
              <p style="margin: 0;"><strong>🎁 Special:</strong> Exclusive NFT drops, giveaways, and community celebrations!</p>
            </div>
          </div>

          <!-- QR Code -->
          <div style="text-align: center; background: white; border-radius: 15px; padding: 30px; border: 2px dashed #e2e8f0;">
            <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">
              📱 Your Entry QR Code
            </h3>
            <img src="${qrCodeBase64}" alt="Ticket QR Code" style="width: 200px; height: 200px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <p style="color: #64748b; margin: 15px 0 0 0; font-size: 14px;">
              Present this QR code for event entry
            </p>
          </div>

          <!-- Important Notes -->
          <div style="background: #fef2f2; border-radius: 15px; padding: 25px; margin-top: 30px; border-left: 4px solid #ef4444;">
            <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">
              ⚠️ Important Notes
            </h3>
            <ul style="color: #7f1d1d; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Keep this email safe - it contains your entry QR code</li>
              <li>Screenshots of the QR code are acceptable for entry</li>
              <li>Event details and joining instructions will be sent closer to the date</li>
              <li>For support, reply to this email or contact support@kaspaevents.xyz</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">
            Thank you for being part of the Kaspa community! 🚀
          </p>
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">
            This email was sent from the Kaspa Birthday Event system.<br>
            For questions, contact us at support@kaspaevents.xyz
          </p>
        </div>
      </div>
    </body>
    </html>
    `

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ticketData.customerEmail],
      replyTo: REPLY_TO_EMAIL,
      subject: "🎉 Your Kaspa 4th Birthday Ticket is Ready!",
      html: ticketHtml,
    })

    console.log("Ticket email sent successfully:", result)
    return result
  } catch (error) {
    console.error("Error sending ticket email:", error)
    throw error
  }
}

export async function sendPaymentConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  amount: number,
  currency: string,
) {
  try {
    const confirmationHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
          <img src="${KASPA_LOGO_BASE64}" alt="Kaspa Logo" style="width: 80px; height: 80px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            💰 Payment Received!
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">
            We're processing your order
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 32px;">✓</span>
            </div>
            <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 24px; font-weight: bold;">
              Payment Confirmed
            </h2>
            <p style="color: #64748b; margin: 0; font-size: 16px;">
              Hi ${customerName}, we've received your payment!
            </p>
          </div>

          <div style="background: #f8fafc; border-radius: 15px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
              Payment Details
            </h3>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b;">Order ID:</span>
                <span style="color: #1e293b; font-weight: bold; font-family: monospace;">${orderId}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b;">Amount:</span>
                <span style="color: #059669; font-weight: bold;">${amount} ${currency.toUpperCase()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="color: #64748b;">Status:</span>
                <span style="color: #059669; font-weight: bold;">✓ Confirmed</span>
              </div>
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 15px; padding: 25px; text-align: center;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">
              🎫 What's Next?
            </h3>
            <p style="color: #1e40af; margin: 0; line-height: 1.6;">
              Your tickets are being generated and will be sent to you shortly via email.<br>
              You'll receive your QR codes and all event details soon!
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">
            Thank you for joining the Kaspa 4th Birthday Celebration! 🎉
          </p>
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">
            Questions? Contact us at support@kaspaevents.xyz
          </p>
        </div>
      </div>
    </body>
    </html>
    `

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [customerEmail],
      replyTo: REPLY_TO_EMAIL,
      subject: "💰 Payment Confirmed - Kaspa Birthday Tickets",
      html: confirmationHtml,
    })

    console.log("Payment confirmation email sent successfully:", result)
    return result
  } catch (error) {
    console.error("Error sending payment confirmation email:", error)
    throw error
  }
}
