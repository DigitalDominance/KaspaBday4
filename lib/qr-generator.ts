import QRCode from "qrcode"

export interface TicketData {
  orderId: string
  customerName: string
  ticketType: string
  quantity: number
  event: string
  date: string
  venue: string
  verified: boolean
  timestamp: number
}

export async function generateQRCodeDataURL(data: TicketData): Promise<string> {
  try {
    const qrData = JSON.stringify(data)

    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: "M",
      type: "image/png",
      quality: 0.92,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 256,
    })

    return qrCodeDataURL
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

export async function generateQRCodeSVG(data: TicketData): Promise<string> {
  try {
    const qrData = JSON.stringify(data)

    const qrCodeSVG = await QRCode.toString(qrData, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 256,
    })

    return qrCodeSVG
  } catch (error) {
    console.error("Error generating QR code SVG:", error)
    throw new Error("Failed to generate QR code SVG")
  }
}

export function generateTicketText(data: TicketData): string {
  return `
KASPA 4TH BIRTHDAY CELEBRATION
================================

TICKET INFORMATION
------------------
Order ID: ${data.orderId}
Customer: ${data.customerName}
Ticket Type: ${data.ticketType}
Quantity: ${data.quantity}

EVENT DETAILS
-------------
Event: ${data.event}
Date: ${data.date}
Venue: ${data.venue}

QR CODE DATA
------------
${JSON.stringify(data, null, 2)}

IMPORTANT NOTES
---------------
• Present this ticket (digital or printed) at the event entrance
• Bring a valid ID for verification
• Tickets are non-refundable but transferable
• Contact tickets@kaspaevents.xyz for questions

Generated: ${new Date().toLocaleString()}
Verified: ${data.verified ? "✓" : "✗"}

================================
Thank you for celebrating with us!
  `.trim()
}
