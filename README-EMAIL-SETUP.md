# 📧 Email System Setup - Production Ready

## Required Environment Variables

Add these to your `.env.local` file:

\`\`\`env
# Resend API Key (get from resend.com)
RESEND_API_KEY=re_your_actual_api_key_here

# NOWPayments API (already configured)
NOWPAYMENTS_API_KEY=your_nowpayments_key
NOWPAYMENTS_IPN_SECRET=your_ipn_secret

# MongoDB (already configured)
MONGODB_URI=your_mongodb_connection_string

# Base URL for your site
NEXT_PUBLIC_BASE_URL=https://www.kaspaevents.xyz
\`\`\`

## 🚀 Production Features

### ✅ What's Working:
- **Embedded Logo**: Kaspa logo shows in all emails
- **QR Code Generation**: Unique QR codes embedded as base64 images
- **Payment Confirmation**: Sent when payment is received
- **Ticket Delivery**: Full ticket with QR code sent when payment completes
- **Database Integration**: All orders tracked in MongoDB
- **Webhook Processing**: NOWPayments IPN properly triggers emails

### 📧 Email Flow:
1. **Customer pays** → Payment confirmation email sent
2. **Payment completes** → Full ticket email with QR code sent
3. **All data saved** → Customer info and ticket numbers stored in database

### 🎫 Ticket Email Includes:
- Kaspa logo (embedded, always shows)
- Customer details and order info
- Unique ticket numbers
- QR code with all ticket data (embedded, always shows)
- Event details and important notes
- Beautiful responsive design

### 🔧 Technical Details:
- Uses Resend's default domain (no custom domain needed)
- QR codes generated server-side and embedded as base64
- Logo embedded as base64 SVG
- Webhooks configured for https://www.kaspaevents.xyz/
- All images show in email clients (Gmail, Outlook, etc.)

## 🎉 Ready for Production!

The system is now production-ready with:
- Reliable email delivery
- Embedded images that always show
- Proper webhook handling
- Complete order tracking
- Beautiful email design matching your site
