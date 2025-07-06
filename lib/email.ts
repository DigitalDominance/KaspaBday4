import type { KaspaBirthdayTicket } from "@/lib/models/KaspaBirthdayTickets"

// Email service configuration - using Resend's default domain
const RESEND_API_KEY = process.env.RESEND_API_KEY
// Using Resend's default onboarding domain - no custom domain needed!
const FROM_EMAIL = "onboarding@resend.dev"
const REPLY_TO_EMAIL = "zalesskiandrew@gmail.com" // Your email for replies

interface EmailTicketData {
  ticket: KaspaBirthdayTicket
  qrCodeDataUrl: string
}

export class EmailService {
  static async sendTicketEmail({ ticket, qrCodeDataUrl }: EmailTicketData) {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured")
      return false
    }

    try {
      const emailHtml = this.generateTicketEmailHTML(ticket, qrCodeDataUrl)
      const emailText = this.generateTicketEmailText(ticket)

      console.log(`Sending ticket email to: ${ticket.customerEmail}`)

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Kaspa Birthday Event <${FROM_EMAIL}>`,
          to: [ticket.customerEmail],
          reply_to: REPLY_TO_EMAIL,
          subject: `🎉 Your Kaspa 4th Birthday Ticket is Ready! - Order ${ticket.orderId}`,
          html: emailHtml,
          text: emailText,
        }),
      })

      const responseData = await response.json()

      if (response.ok) {
        console.log(`✅ Ticket email sent successfully to ${ticket.customerEmail}`)
        console.log(`Email ID: ${responseData.id}`)
        return true
      } else {
        console.error("❌ Failed to send email:", responseData)
        return false
      }
    } catch (error) {
      console.error("Email service error:", error)
      return false
    }
  }

  static generateTicketEmailHTML(ticket: KaspaBirthdayTicket, qrCodeDataUrl: string): string {
    const eventDate = "November 7-9, 2025"
    const venue = "Kaspa Community Center, Liverpool, NY"

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Kaspa 4th Birthday Ticket</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: shimmer 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(180deg); }
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .kaspa-logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin: 0 auto 20px;
            border: 3px solid rgba(255,255,255,0.3);
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .ticket-card {
            background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
            border: 2px dashed #667eea;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .ticket-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
        }
        
        .qr-code {
            width: 200px;
            height: 200px;
            margin: 0 auto 20px;
            border: 3px solid #667eea;
            border-radius: 10px;
            background: white;
            padding: 10px;
            display: block;
        }
        
        .ticket-info {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-top: 20px;
            border-left: 4px solid #667eea;
        }
        
        .ticket-info h3 {
            color: #667eea;
            font-size: 20px;
            margin-bottom: 15px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .info-row:last-child {
            border-bottom: none;
        }
        
        .info-label {
            font-weight: 600;
            color: #666;
        }
        
        .info-value {
            font-weight: 700;
            color: #333;
        }
        
        .event-details {
            background: linear-gradient(135deg, #667eea10, #764ba210);
            border-radius: 15px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .event-details h3 {
            color: #667eea;
            font-size: 18px;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .detail-item {
            display: flex;
            align-items: center;
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 8px;
            border-left: 3px solid #764ba2;
        }
        
        .detail-icon {
            width: 20px;
            height: 20px;
            margin-right: 12px;
            color: #667eea;
        }
        
        .instructions {
            background: #fff8e1;
            border: 1px solid #ffc107;
            border-radius: 10px;
            padding: 20px;
            margin: 30px 0;
        }
        
        .instructions h4 {
            color: #f57c00;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .instructions ul {
            list-style: none;
            padding: 0;
        }
        
        .instructions li {
            margin: 8px 0;
            padding-left: 20px;
            position: relative;
        }
        
        .instructions li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #4caf50;
            font-weight: bold;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer p {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            padding: 8px 16px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
        }
        
        .backup-info {
            background: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        
        .backup-info h4 {
            color: #1976d2;
            margin-bottom: 10px;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 15px;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .ticket-card {
                padding: 20px;
            }
            
            .qr-code {
                width: 150px;
                height: 150px;
            }
            
            .info-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div style="width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255,255,255,0.3); position: relative; z-index: 1;">
                <span style="font-size: 24px; font-weight: bold; color: #667eea;">K</span>
            </div>
            <h1>🎉 Your Ticket is Ready!</h1>
            <p>Kaspa's 4th Birthday Celebration</p>
        </div>
        
        <div class="content">
            <h2 style="color: #667eea; text-align: center; margin-bottom: 20px;">
                Welcome to the Celebration, ${ticket.customerName}!
            </h2>
            
            <p style="text-align: center; color: #666; font-size: 16px; margin-bottom: 30px;">
                Your payment has been confirmed and your ticket is ready! We can't wait to see you at Kaspa's biggest celebration of the year.
            </p>
            
            <div class="ticket-card">
                <img src="${qrCodeDataUrl}" alt="Ticket QR Code" class="qr-code">
                
                <div class="backup-info">
                    <h4>📱 Save This QR Code</h4>
                    <p style="font-size: 14px; color: #666;">Screenshot or save this email to your phone for easy access at the event</p>
                </div>
                
                <div class="ticket-info">
                    <h3>🎫 Your Digital Ticket</h3>
                    <div class="info-row">
                        <span class="info-label">Event:</span>
                        <span class="info-value">Kaspa's 4th Birthday</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Ticket Type:</span>
                        <span class="info-value">${ticket.ticketName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Quantity:</span>
                        <span class="info-value">${ticket.quantity} ticket${ticket.quantity > 1 ? "s" : ""}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Order ID:</span>
                        <span class="info-value">${ticket.orderId}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Total Paid:</span>
                        <span class="info-value">$${ticket.totalAmount}</span>
                    </div>
                </div>
            </div>
            
            <div class="event-details">
                <h3>📅 Event Information</h3>
                <div class="detail-item">
                    <span class="detail-icon">📅</span>
                    <div>
                        <strong>Date:</strong> ${eventDate}<br>
                        <small style="color: #666;">3 days of blockchain innovation and community</small>
                    </div>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">📍</span>
                    <div>
                        <strong>Venue:</strong> ${venue}<br>
                        <small style="color: #666;">4225 Long Branch Rd, Liverpool, NY 13088</small>
                    </div>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">🎯</span>
                    <div>
                        <strong>What's Included:</strong> All workshops, meals, networking, and daily raffles<br>
                        <small style="color: #666;">Plus exclusive access to Kaspa community leaders</small>
                    </div>
                </div>
            </div>
            
            <div class="instructions">
                <h4>📱 Important Instructions</h4>
                <ul>
                    <li>Save this email and QR code to your phone</li>
                    <li>Present the QR code at event check-in</li>
                    <li>Arrive 15 minutes early for smooth entry</li>
                    <li>Bring a valid photo ID for verification</li>
                    <li>Keep your ticket safe - it cannot be replaced if lost</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/ticket-success?order=${ticket.orderId}" class="cta-button">
                    📱 View Online Ticket
                </a>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea10, #f093fb10); border-radius: 15px; padding: 25px; margin: 30px 0; text-align: center;">
                <h3 style="color: #667eea; margin-bottom: 15px;">🎁 What to Expect</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
                    <div style="background: white; padding: 15px; border-radius: 10px; border-left: 3px solid #667eea;">
                        <strong style="color: #667eea;">🔧 Hackathon</strong><br>
                        <small>Build on Kaspa's DAG technology</small>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 10px; border-left: 3px solid #764ba2;">
                        <strong style="color: #764ba2;">⚡ Mining Zone</strong><br>
                        <small>Interactive mining demonstrations</small>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 10px; border-left: 3px solid #f093fb;">
                        <strong style="color: #f093fb;">🎁 Daily Raffles</strong><br>
                        <small>Win ASIC miners and $KAS tokens</small>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <a href="https://x.com/FundingKaspa">Follow @FundingKaspa</a>
                <a href="https://x.com/kaspercoin">Follow @KasperCoin</a>
            </div>
            
            <p><strong>Questions?</strong> Reply to this email or contact the event team</p>
            <p>This ticket was generated for ${ticket.customerEmail}</p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                Kaspa Community • Building the future of blockchain technology<br>
                BlockDAG • Parallel Blocks • Instant Finality
            </p>
        </div>
    </div>
</body>
</html>
    `
  }

  static generateTicketEmailText(ticket: KaspaBirthdayTicket): string {
    return `
🎉 Your Kaspa 4th Birthday Ticket is Ready!

Hi ${ticket.customerName},

Your payment has been confirmed and your ticket is ready for Kaspa's 4th Birthday Celebration!

TICKET DETAILS:
- Event: Kaspa's 4th Birthday Celebration  
- Date: November 7-9, 2025
- Venue: Kaspa Community Center, Liverpool, NY
- Ticket Type: ${ticket.ticketName}
- Quantity: ${ticket.quantity}
- Order ID: ${ticket.orderId}
- Total Paid: $${ticket.totalAmount}

IMPORTANT INSTRUCTIONS:
✓ Save this email and QR code to your phone
✓ Present the QR code at event check-in  
✓ Arrive 15 minutes early for smooth entry
✓ Bring a valid photo ID for verification
✓ Keep your ticket safe - it cannot be replaced if lost

WHAT TO EXPECT:
🔧 Hackathon - Build on Kaspa's DAG technology
⚡ Mining Zone - Interactive mining demonstrations  
🎁 Daily Raffles - Win ASIC miners and $KAS tokens
🍕 Free meals and beverages all 3 days
🤝 Networking with Kaspa developers and community

View your digital ticket: ${process.env.NEXT_PUBLIC_BASE_URL}/ticket-success?order=${ticket.orderId}

Questions? Reply to this email or contact the event team.

Follow us:
- @FundingKaspa on X
- @KasperCoin on X

See you at the celebration!
The Kaspa Community Team

---
Kaspa Community • Building the future of blockchain technology
BlockDAG • Parallel Blocks • Instant Finality
    `
  }

  static async sendPaymentConfirmationEmail(ticket: KaspaBirthdayTicket) {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured")
      return false
    }

    try {
      console.log(`Sending payment confirmation to: ${ticket.customerEmail}`)

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Kaspa Birthday Event <${FROM_EMAIL}>`,
          to: [ticket.customerEmail],
          reply_to: REPLY_TO_EMAIL,
          subject: `💰 Payment Received - Kaspa Birthday Ticket Processing`,
          html: this.generatePaymentConfirmationHTML(ticket),
          text: this.generatePaymentConfirmationText(ticket),
        }),
      })

      const responseData = await response.json()

      if (response.ok) {
        console.log(`✅ Payment confirmation sent to ${ticket.customerEmail}`)
        console.log(`Email ID: ${responseData.id}`)
        return true
      } else {
        console.error("❌ Failed to send payment confirmation:", responseData)
        return false
      }
    } catch (error) {
      console.error("Payment confirmation email error:", error)
      return false
    }
  }

  static generatePaymentConfirmationHTML(ticket: KaspaBirthdayTicket): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #667eea, #764ba2); 
            padding: 20px; 
            margin: 0;
        }
        .container { 
            max-width: 500px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 15px; 
            padding: 30px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
        }
        .status { 
            background: linear-gradient(135deg, #667eea10, #764ba210); 
            padding: 20px; 
            border-radius: 10px; 
            text-align: center; 
            border: 1px solid #667eea30;
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            color: #666; 
            font-size: 14px; 
        }
        .logo-placeholder {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-placeholder">K</div>
            <h1 style="color: #667eea; margin: 0;">💰 Payment Received!</h1>
            <p style="color: #666; margin: 10px 0;">Your Kaspa Birthday ticket is being processed</p>
        </div>
        
        <div class="status">
            <h3 style="color: #333; margin-bottom: 15px;">Hi ${ticket.customerName},</h3>
            <p style="color: #666; margin-bottom: 15px;">We've received your payment for <strong>${ticket.ticketName}</strong>!</p>
            <p style="color: #666; margin-bottom: 20px;">Your ticket is being generated and will be sent to you shortly.</p>
            
            <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e0e0e0;">
                <div style="margin-bottom: 8px;"><strong>Order ID:</strong> ${ticket.orderId}</div>
                <div style="margin-bottom: 8px;"><strong>Amount:</strong> $${ticket.totalAmount}</div>
                <div><strong>Status:</strong> <span style="color: #4caf50; font-weight: bold;">Payment Confirmed ✓</span></div>
            </div>
        </div>
        
        <div class="footer">
            <p>You'll receive your digital ticket with QR code within the next few minutes.</p>
            <p style="margin-top: 15px;">Questions? Reply to this email and we'll help you out!</p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                Kaspa Community • Building the future together
            </p>
        </div>
    </div>
</body>
</html>
    `
  }

  static generatePaymentConfirmationText(ticket: KaspaBirthdayTicket): string {
    return `
💰 Payment Received - Kaspa Birthday Ticket

Hi ${ticket.customerName},

We've received your payment for ${ticket.ticketName}!

Order Details:
- Order ID: ${ticket.orderId}
- Amount: $${ticket.totalAmount}  
- Status: Payment Confirmed ✓

Your ticket is being generated and will be sent to you shortly.

Questions? Reply to this email and we'll help you out!

The Kaspa Community Team
    `
  }
}
