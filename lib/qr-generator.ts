export interface TicketData {
  orderId: string
  customerName: string
  ticketType: string
  quantity: number
  event: string
  date: string
  venue: string
}

export function generateTicketQRCode(data: TicketData): string {
  // Create the data to encode in the QR code
  const qrData = JSON.stringify({
    orderId: data.orderId,
    customerName: data.customerName,
    ticketType: data.ticketType,
    quantity: data.quantity,
    event: data.event,
    date: data.date,
    venue: data.venue,
    verified: true,
    timestamp: Date.now(),
  })

  // Generate QR code using qrcode library
  const QRCode = require("qrcode")

  try {
    // Generate QR code as SVG string
    const qrCodeSvg = QRCode.toString(qrData, {
      type: "svg",
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })

    return qrCodeSvg
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

export async function generateQRCodeDataURL(data: string): Promise<string> {
  const QRCode = require("qrcode")

  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })

    return qrCodeDataURL
  } catch (error) {
    console.error("Error generating QR code data URL:", error)
    throw new Error("Failed to generate QR code")
  }
}

export function generateTicketText(data: TicketData): string {
  const ticketTypeDisplay = data.ticketType
    .replace("-", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return `
KASPA 4TH BIRTHDAY CELEBRATION
================================

TICKET INFORMATION
------------------
Order ID: ${data.orderId}
Customer: ${data.customerName}
Ticket Type: ${ticketTypeDisplay}
Quantity: ${data.quantity}

EVENT DETAILS
-------------
Event: ${data.event}
Date: ${data.date}
Venue: ${data.venue}

IMPORTANT NOTES
---------------
• Present this ticket (digital or printed) at the event entrance
• Bring a valid ID for verification
• Tickets are non-refundable but transferable
• Contact tickets@kaspaevents.xyz for questions

Generated: ${new Date().toLocaleString()}
Verified: ✓

================================
Thank you for celebrating with us!
  `.trim()
}
