import { Resend } from "resend"
import { generateQRCodeSVG, type TicketData } from "./qr-generator"

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailTicketData {
  orderId: string
  customerName: string
  customerEmail: string
  ticketType: string
  ticketName: string
  quantity: number
  totalAmount: number
}

export async function sendTicketEmail(ticketData: EmailTicketData): Promise<boolean> {
  try {
    // Generate QR code for the ticket
    const qrData: TicketData = {
      orderId: ticketData.orderId,
      customerName: ticketData.customerName,
      ticketType: ticketData.ticketType,
      quantity: ticketData.quantity,
      event: "Kaspa 4th Birthday Celebration",
      date: "November 7-9, 2025",
      venue: "Kaspa Community Center, Liverpool, NY",
      verified: true,
      timestamp: Date.now(),
    }

    const qrCodeSVG = await generateQRCodeSVG(qrData)

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Kaspa Birthday Celebration Ticket</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8fafc;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #e2e8f0;
    }
    .title {
      color: #1e293b;
      font-size: 28px;
      font-weight: bold;
      margin: 0 0 8px 0;
    }
    .subtitle {
      color: #64748b;
      font-size: 16px;
      margin: 0;
    }
    .ticket-section {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      padding: 24px;
      border-radius: 12px;
      margin: 24px 0;
      text-align: center;
    }
    .ticket-title {
      font-size: 20px;
      font-weight: bold;
      margin: 0 0 16px 0;
    }
    .ticket-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 16px 0;
    }
    .detail-item {
      text-align: left;
    }
    .detail-label {
      font-size: 12px;
      opacity: 0.8;
      margin-bottom: 4px;
    }
    .detail-value {
      font-weight: bold;
      font-size: 14px;
    }
    .qr-section {
      text-align: center;
      margin: 32px 0;
      padding: 24px;
      background: #f8fafc;
      border-radius: 12px;
      border: 2px dashed #cbd5e1;
    }
    .qr-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 16px;
      color: #1e293b;
    }
    .qr-code {
      display: inline-block;
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .event-info {
      background: #f1f5f9;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
    }
    .event-title {
      font-size: 16px;
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 12px;
    }
    .event-details {
      font-size: 14px;
      color: #475569;
      line-height: 1.5;
    }
    .instructions {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
    }
    .instructions-title {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 8px;
    }
    .instructions-list {
      color: #92400e;
      font-size: 14px;
      margin: 0;
      padding-left: 16px;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 14px;
    }
    @media (max-width: 600px) {
      .ticket-details {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">🎉 Your Ticket is Ready!</h1>
      <p class="subtitle">Kaspa 4th Birthday Celebration</p>
    </div>

    <div class="ticket-section">
      <h2 class="ticket-title">Digital Ticket</h2>
      <div class="ticket-details">
        <div class="detail-item">
          <div class="detail-label">Order ID</div>
          <div class="detail-value">${ticketData.orderId}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Customer</div>
          <div class="detail-value">${ticketData.customerName}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Ticket Type</div>
          <div class="detail-value">${ticketData.ticketName}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Quantity</div>
          <div class="detail-value">${ticketData.quantity} ticket${ticketData.quantity > 1 ? "s" : ""}</div>
        </div>
      </div>
    </div>

    <div class="qr-section">
      <h3 class="qr-title">Your Entry QR Code</h3>
      <div class="qr-code">
        ${qrCodeSVG}
      </div>
      <p style="margin-top: 12px; font-size: 14px; color: #64748b;">
        Present this QR code at the event entrance
      </p>
    </div>

    <div class="event-info">
      <h3 class="event-title">Event Information</h3>
      <div class="event-details">
        <strong>Date:</strong> November 7-9, 2025<br>
        <strong>Time:</strong> 9:00 AM - 6:00 PM daily<br>
        <strong>Location:</strong> Kaspa Community Center<br>
        <strong>Address:</strong> 4225 Long Branch Rd, Liverpool, NY 13088
      </div>
    </div>

    <div class="instructions">
      <div class="instructions-title">Important Instructions</div>
      <ul class="instructions-list">
        <li>Arrive 15 minutes early for check-in</li>
        <li>Bring a valid photo ID for verification</li>
        <li>Present this QR code (digital or printed) at entrance</li>
        <li>Keep your ticket safe - it cannot be replaced if lost</li>
      </ul>
    </div>

    <div class="footer">
      <p>Questions? Contact us at <a href="mailto:tickets@kaspaevents.xyz" style="color: #3b82f6;">tickets@kaspaevents.xyz</a></p>
      <p>Thank you for celebrating Kaspa's 4th Birthday with us! 🎂</p>
    </div>
  </div>
</body>
</html>
    `

    const { data, error } = await resend.emails.send({
      from: "Kaspa Events <tickets@kaspaevents.xyz>",
      to: [ticketData.customerEmail],
      subject: `🎉 Your Kaspa Birthday Celebration Ticket - Order ${ticketData.orderId}`,
      html: emailHtml,
    })

    if (error) {
      console.error("Error sending email:", error)
      return false
    }

    console.log("Email sent successfully:", data)
    return true
  } catch (error) {
    console.error("Error in sendTicketEmail:", error)
    return false
  }
}
