export function generateTicketQR(ticketData: {
  orderId: string
  customerName: string
  customerEmail: string
  ticketType: string
  quantity: number
  eventDate: string
}) {
  // Create ticket verification data
  const ticketInfo = {
    id: ticketData.orderId,
    name: ticketData.customerName,
    email: ticketData.customerEmail,
    type: ticketData.ticketType,
    qty: ticketData.quantity,
    event: "Kaspa 4th Birthday",
    date: ticketData.eventDate,
    venue: "Kaspa Community Center, Liverpool NY",
    verified: true,
  }

  // In production, you'd use a proper QR code library like 'qrcode'
  // For now, we'll create a data URL that represents the QR code
  const qrData = JSON.stringify(ticketInfo)
  const qrCodeDataUrl = `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="white"/>
      <text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="8" fill="black">
        QR: ${ticketData.orderId}
      </text>
    </svg>`,
  ).toString("base64")}`

  return {
    qrCodeDataUrl,
    ticketInfo,
    qrData,
  }
}
