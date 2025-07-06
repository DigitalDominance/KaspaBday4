export interface TicketQRData {
  orderId: string
  customerName: string
  customerEmail: string
  ticketType: string
  quantity: number
  eventDate: string
}

export interface GeneratedTicketData {
  qrCodeDataUrl: string
  ticketInfo: TicketQRData
}

export function generateTicketQR(data: TicketQRData): GeneratedTicketData {
  try {
    // Create the QR code data
    const qrData = JSON.stringify({
      orderId: data.orderId,
      customerName: data.customerName,
      ticketType: data.ticketType,
      quantity: data.quantity,
      event: "Kaspa 4th Birthday Celebration",
      date: data.eventDate,
      venue: "Kaspa Community Center, Liverpool, NY",
      verified: true,
      timestamp: Date.now(),
    })

    // For now, return a placeholder data URL since we can't use QRCode.toDataURL in this environment
    // In production, this would generate the actual QR code
    const qrCodeDataUrl = `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="40" y="40" width="120" height="120" fill="white"/>
        <text x="100" y="105" text-anchor="middle" font-family="Arial" font-size="12" fill="black">
          QR Code for ${data.orderId}
        </text>
      </svg>
    `).toString("base64")}`

    return {
      qrCodeDataUrl,
      ticketInfo: data,
    }
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

export async function generateQRCodeBase64(data: string): Promise<string> {
  try {
    // In a real implementation, this would use the QRCode library
    // For now, return a placeholder
    return `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="300" fill="white"/>
        <rect x="30" y="30" width="240" height="240" fill="black"/>
        <rect x="60" y="60" width="180" height="180" fill="white"/>
        <text x="150" y="155" text-anchor="middle" font-family="Arial" font-size="14" fill="black">
          QR Code
        </text>
      </svg>
    `).toString("base64")}`
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}
