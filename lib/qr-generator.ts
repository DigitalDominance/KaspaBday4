import QRCode from "qrcode"

export interface TicketQRData {
  orderId: string
  customerName: string
  customerEmail: string
  ticketType: string
  quantity: number
  eventDate: string
  venue?: string
  verified: boolean
  timestamp: number
}

export async function generateQRCodeDataURL(data: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
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

    return qrCodeDataUrl
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

export async function generateQRCodeSVG(data: string): Promise<string> {
  try {
    const qrCodeSvg = await QRCode.toString(data, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 200,
    })

    return qrCodeSvg
  } catch (error) {
    console.error("Error generating QR code SVG:", error)
    throw new Error("Failed to generate QR code SVG")
  }
}

export function generateTicketQR(ticketData: Omit<TicketQRData, "verified" | "timestamp">) {
  const qrData: TicketQRData = {
    ...ticketData,
    venue: "Kaspa Community Center, Liverpool, NY",
    verified: true,
    timestamp: Date.now(),
  }

  const qrString = JSON.stringify(qrData)

  return {
    qrData,
    qrString,
    ticketInfo: {
      orderId: qrData.orderId,
      customerName: qrData.customerName,
      ticketType: qrData.ticketType,
      quantity: qrData.quantity,
      eventDate: qrData.eventDate,
      venue: qrData.venue,
    },
  }
}
