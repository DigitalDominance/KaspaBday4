import clientPromise from "@/lib/mongodb"
import type { ObjectId } from "mongodb"
import { TicketReservationModel } from "./TicketReservation"

export interface TicketStockRecord {
  _id?: ObjectId
  ticketType: string
  maxQuantity: number
  soldQuantity: number
  reservedQuantity: number
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
          reservedQuantity: 0,
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

  // Reserve tickets (when payment is created) - now with expiration tracking
  static async reserveTickets(ticketType: string, quantity: number): Promise<boolean> {
    const collection = await this.getCollection()

    // First clean up any expired reservations
    await this.releaseExpiredReservations()

    const result = await collection.updateOne(
      {
        ticketType,
        $expr: {
          $gte: [{ $subtract: ["$maxQuantity", { $add: ["$soldQuantity", "$reservedQuantity"] }] }, quantity],
        },
      },
      {
        $inc: {
          reservedQuantity: quantity,
        },
        $set: {
          lastUpdated: new Date(),
        },
      },
    )

    if (result.modifiedCount > 0) {
      console.log(`🔒 Reserved ${quantity}x ${ticketType} tickets for 15 minutes`)
    }

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
          reservedQuantity: -quantity, // Remove from reserved
        },
        $set: {
          lastUpdated: new Date(),
        },
      },
    )

    console.log(`✅ Confirmed sale: ${quantity}x ${ticketType} tickets`)
    return result.modifiedCount > 0
  }

  // Release reserved tickets (when payment fails/expires/cancelled)
  static async releaseReservation(ticketType: string, quantity: number): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { ticketType },
      {
        $inc: {
          reservedQuantity: -quantity,
        },
        $set: {
          lastUpdated: new Date(),
        },
      },
    )

    console.log(`🔄 Released reservation: ${quantity}x ${ticketType} tickets`)
    return result.modifiedCount > 0
  }

  // Release expired reservations
  static async releaseExpiredReservations(): Promise<void> {
    // Clean up expired reservations first
    await TicketReservationModel.cleanupExpiredReservations()

    // Get all expired reservations that need stock released
    const expiredReservations = await TicketReservationModel.getExpiredReservations()

    for (const reservation of expiredReservations) {
      await this.releaseReservation(reservation.ticketType, reservation.quantity)
    }

    // Remove the expired reservations from the reservation collection
    if (expiredReservations.length > 0) {
      const collection = await TicketReservationModel.getCollection()
      await collection.deleteMany({
        status: "expired",
        updatedAt: { $lt: new Date(Date.now() - 60000) }, // Only delete if expired for more than 1 minute
      })
    }
  }

  // Check if tickets are available (considering reservations)
  static async isAvailable(ticketType: string, quantity: number): Promise<boolean> {
    // Clean up expired reservations first
    await this.releaseExpiredReservations()

    const stock = await this.getStock(ticketType)
    if (!stock) return false

    const actuallyAvailable = stock.maxQuantity - stock.soldQuantity - stock.reservedQuantity
    return actuallyAvailable >= quantity
  }

  // Get formatted stock info for frontend
  static async getStockInfo() {
    // Clean up expired reservations first
    await this.releaseExpiredReservations()

    const allStock = await this.getAllStock()

    return allStock.map((stock) => {
      const actuallyAvailable = stock.maxQuantity - stock.soldQuantity - stock.reservedQuantity

      return {
        type: stock.ticketType,
        available: actuallyAvailable,
        reserved: stock.reservedQuantity,
        total: stock.maxQuantity,
        sold: stock.soldQuantity,
        soldOut: actuallyAvailable === 0,
      }
    })
  }
}
