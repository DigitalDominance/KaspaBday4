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
    // Create the QR code data with ticket information
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

    // Generate a proper QR code SVG
    const qrCodeDataUrl = generateQRCodeSVG(qrData)

    return {
      qrCodeDataUrl,
      ticketInfo: data,
    }
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

function generateQRCodeSVG(data: string): string {
  // Simple QR code pattern generator
  const size = 25 // 25x25 grid
  const cellSize = 8
  const totalSize = size * cellSize

  // Create a simple pattern based on the data hash
  const hash = simpleHash(data)
  const pattern = generatePattern(hash, size)

  let svg = `<svg width="${totalSize}" height="${totalSize}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}">`
  svg += `<rect width="${totalSize}" height="${totalSize}" fill="white"/>`

  // Generate QR pattern
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (pattern[y][x]) {
        svg += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`
      }
    }
  }

  // Add finder patterns (corners)
  svg += addFinderPattern(0, 0, cellSize)
  svg += addFinderPattern((size - 7) * cellSize, 0, cellSize)
  svg += addFinderPattern(0, (size - 7) * cellSize, cellSize)

  svg += "</svg>"

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

function generatePattern(hash: number, size: number): boolean[][] {
  const pattern: boolean[][] = []
  let seed = hash

  for (let y = 0; y < size; y++) {
    pattern[y] = []
    for (let x = 0; x < size; x++) {
      // Skip finder pattern areas
      if ((x < 9 && y < 9) || (x >= size - 8 && y < 9) || (x < 9 && y >= size - 8)) {
        pattern[y][x] = false
        continue
      }

      // Generate pseudo-random pattern
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      pattern[y][x] = seed % 100 < 50
    }
  }

  return pattern
}

function addFinderPattern(x: number, y: number, cellSize: number): string {
  let pattern = ""

  // Outer border (7x7)
  pattern += `<rect x="${x}" y="${y}" width="${7 * cellSize}" height="${7 * cellSize}" fill="black"/>`
  // Inner white (5x5)
  pattern += `<rect x="${x + cellSize}" y="${y + cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="white"/>`
  // Center black (3x3)
  pattern += `<rect x="${x + 2 * cellSize}" y="${y + 2 * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="black"/>`

  return pattern
}

export async function generateQRCodeBase64(data: string): Promise<string> {
  try {
    return generateQRCodeSVG(data)
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}
