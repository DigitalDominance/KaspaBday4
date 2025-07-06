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
      width: 200,
    })

    return qrCodeSVG
  } catch (error) {
    console.error("Error generating QR code SVG:", error)
    throw new Error("Failed to generate QR code SVG")
  }
}

export function createTicketData(
  orderId: string,
  customerName: string,
  ticketType: string,
  quantity: number,
): TicketData {
  return {
    orderId,
    customerName,
    ticketType,
    quantity,
    event: "Kaspa 4th Birthday Celebration",
    date: "November 7-9, 2025",
    venue: "Kaspa Community Center, Liverpool, NY",
    verified: true,
    timestamp: Date.now(),
  }
}
