import { Resend } from "resend"
import { generateQRCodeSVG, createTicketData } from "./qr-generator"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface TicketEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  ticketType: string
  quantity: number
  totalAmount: number
}

export async function sendTicketEmail(ticketData: TicketEmailData): Promise<boolean> {
  try {
    // Generate QR code for the ticket
    const qrData = createTicketData(
      ticketData.orderId,
      ticketData.customerName,
      ticketData.ticketType,
      ticketData.quantity,
    )

    const qrCodeSVG = await generateQRCodeSVG(qrData)

    // Create email HTML with embedded QR code
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Kaspa Birthday Celebration Ticket</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .qr-container { text-align: center; margin: 30px 0; padding: 20px; background: white; border-radius: 8px; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Your Kaspa Birthday Ticket!</h1>
              <p>Thank you for joining the celebration</p>
            </div>
            
            <div class="content">
              <div class="ticket-info">
                <h2>Ticket Details</h2>
                <p><strong>Order ID:</strong> ${ticketData.orderId}</p>
                <p><strong>Name:</strong> ${ticketData.customerName}</p>
                <p><strong>Ticket Type:</strong> ${ticketData.ticketType}</p>
                <p><strong>Quantity:</strong> ${ticketData.quantity}</p>
                <p><strong>Total Paid:</strong> $${ticketData.totalAmount}</p>
              </div>
              
              <div class="ticket-info">
                <h2>Event Information</h2>
                <p><strong>Event:</strong> Kaspa 4th Birthday Celebration</p>
                <p><strong>Date:</strong> November 7-9, 2025</p>
                <p><strong>Venue:</strong> Kaspa Community Center, Liverpool, NY</p>
              </div>
              
              <div class="qr-container">
                <h3>Your Ticket QR Code</h3>
                <p>Present this QR code at the event entrance</p>
                ${qrCodeSVG}
                <p style="font-size: 12px; color: #666; margin-top: 10px;">
                  Scan this code for instant verification
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p>Save this email or screenshot the QR code for easy access at the event.</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Questions? Contact us at tickets@kaspaevents.xyz</p>
              <p>Kaspa 4th Birthday Celebration • November 7-9, 2025</p>
            </div>
          </div>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: "tickets@kaspaevents.xyz",
      to: [ticketData.customerEmail],
      subject: `🎉 Your Kaspa Birthday Ticket - ${ticketData.orderId}`,
      html: emailHtml,
    })

    if (error) {
      console.error("Error sending email:", error)
      return false
    }

    console.log("Ticket email sent successfully:", data)
    return true
  } catch (error) {
    console.error("Error in sendTicketEmail:", error)
    return false
  }
}

export async function sendTestEmail(to: string): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: "tickets@kaspaevents.xyz",
      to: [to],
      subject: "Test Email from Kaspa Events",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3b82f6;">Test Email</h1>
          <p>This is a test email from the Kaspa Events system.</p>
          <p>If you received this, the email configuration is working correctly!</p>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending test email:", error)
      return false
    }

    console.log("Test email sent successfully:", data)
    return true
  } catch (error) {
    console.error("Error in sendTestEmail:", error)
    return false
  }
}
