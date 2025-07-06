import clientPromise from "@/lib/mongodb"
import type { ObjectId } from "mongodb"

export interface TicketStockRecord {
  _id?: ObjectId
  ticketType: string
  maxQuantity: number
  soldQuantity: number
  availableQuantity: number
  lastUpdated: Date
  createdAt: Date
}

export class TicketStockModel {
  private static collectionName = "ticket_stock"

  static async getCollection() {
    const client = await clientPromise
    const db = client.db("kaspa_birthday")
    return db.collection<TicketStockRecord>(this.collectionName)
  }

  // Initialize stock for all ticket types
  static async initializeStock() {
    const collection = await this.getCollection()

    const ticketTypes = [
      { ticketType: "1-day", maxQuantity: 50 },
      { ticketType: "2-day", maxQuantity: 30 },
      { ticketType: "3-day", maxQuantity: 20 },
      { ticketType: "vip", maxQuantity: 10 },
    ]

    for (const ticket of ticketTypes) {
      const existing = await collection.findOne({ ticketType: ticket.ticketType })

      if (!existing) {
        await collection.insertOne({
          ticketType: ticket.ticketType,
          maxQuantity: ticket.maxQuantity,
          soldQuantity: 0,
          availableQuantity: ticket.maxQuantity,
          lastUpdated: new Date(),
          createdAt: new Date(),
        })
        console.log(`✅ Initialized stock for ${ticket.ticketType}: ${ticket.maxQuantity} tickets`)
      }
    }
  }

  // Get stock for a specific ticket type
  static async getStock(ticketType: string): Promise<TicketStockRecord | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ ticketType })
  }

  // Get all stock records
  static async getAllStock(): Promise<TicketStockRecord[]> {
    const collection = await this.getCollection()
    return await collection.find({}).toArray()
  }

  // Reserve tickets (when payment is created)
  static async reserveTickets(ticketType: string, quantity: number): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      {
        ticketType,
        availableQuantity: { $gte: quantity },
      },
      {
        $inc: {
          availableQuantity: -quantity,
        },
        $set: {
          lastUpdated: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  }

  // Confirm ticket sale (when payment is finished)
  static async confirmSale(ticketType: string, quantity: number): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { ticketType },
      {
        $inc: {
          soldQuantity: quantity,
        },
        $set: {
          lastUpdated: new Date(),
        },
      },
    )

    console.log(`✅ Confirmed sale: ${quantity}x ${ticketType} tickets`)
    return result.modifiedCount > 0
  }

  // Release reserved tickets (when payment fails/expires)
  static async releaseReservation(ticketType: string, quantity: number): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { ticketType },
      {
        $inc: {
          availableQuantity: quantity,
        },
        $set: {
          lastUpdated: new Date(),
        },
      },
    )

    console.log(`🔄 Released reservation: ${quantity}x ${ticketType} tickets`)
    return result.modifiedCount > 0
  }

  // Check if tickets are available
  static async isAvailable(ticketType: string, quantity: number): Promise<boolean> {
    const stock = await this.getStock(ticketType)
    return stock ? stock.availableQuantity >= quantity : false
  }

  // Get formatted stock info for frontend
  static async getStockInfo() {
    const allStock = await this.getAllStock()

    return allStock.map((stock) => ({
      type: stock.ticketType,
      available: stock.availableQuantity,
      total: stock.maxQuantity,
      sold: stock.soldQuantity,
      soldOut: stock.availableQuantity === 0,
    }))
  }
}
