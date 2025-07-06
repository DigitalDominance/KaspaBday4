import clientPromise from "@/lib/mongodb"
import type { ObjectId } from "mongodb"

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

export interface ReservationRecord {
  _id?: ObjectId
  ticketType: string
  quantity: number
  orderId: string
  paymentId?: string
  expiresAt: Date
  createdAt: Date
  status: "active" | "confirmed" | "expired" | "cancelled"
}

export class TicketStockModel {
  private static stockCollectionName = "ticket_stock"
  private static reservationCollectionName = "ticket_reservations"

  static async getStockCollection() {
    const client = await clientPromise
    const db = client.db("kaspa_birthday")
    return db.collection<TicketStockRecord>(this.stockCollectionName)
  }

  static async getReservationCollection() {
    const client = await clientPromise
    const db = client.db("kaspa_birthday")
    return db.collection<ReservationRecord>(this.reservationCollectionName)
  }

  // Initialize stock for all ticket types
  static async initializeStock() {
    const collection = await this.getStockCollection()

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

  // Clean up expired reservations
  static async cleanupExpiredReservations() {
    const reservationCollection = await this.getReservationCollection()
    const stockCollection = await this.getStockCollection()

    // Find expired reservations
    const expiredReservations = await reservationCollection
      .find({
        expiresAt: { $lt: new Date() },
        status: "active",
      })
      .toArray()

    for (const reservation of expiredReservations) {
      // Update reservation status
      await reservationCollection.updateOne(
        { _id: reservation._id },
        {
          $set: {
            status: "expired",
            lastUpdated: new Date(),
          },
        },
      )

      // Release the reserved quantity
      await stockCollection.updateOne(
        { ticketType: reservation.ticketType },
        {
          $inc: {
            reservedQuantity: -reservation.quantity,
            availableQuantity: reservation.quantity,
          },
          $set: {
            lastUpdated: new Date(),
          },
        },
      )

      console.log(`🔄 Released expired reservation: ${reservation.quantity}x ${reservation.ticketType}`)
    }

    return expiredReservations.length
  }

  // Get stock for a specific ticket type
  static async getStock(ticketType: string): Promise<TicketStockRecord | null> {
    // Clean up expired reservations first
    await this.cleanupExpiredReservations()

    const collection = await this.getStockCollection()
    return await collection.findOne({ ticketType })
  }

  // Get all stock records
  static async getAllStock(): Promise<TicketStockRecord[]> {
    // Clean up expired reservations first
    await this.cleanupExpiredReservations()

    const collection = await this.getStockCollection()
    return await collection.find({}).toArray()
  }

  // Reserve tickets (when payment is created)
  static async reserveTickets(
    ticketType: string,
    quantity: number,
    expiresAt: Date,
    orderId: string,
    paymentId?: string,
  ): Promise<boolean> {
    const stockCollection = await this.getStockCollection()
    const reservationCollection = await this.getReservationCollection()

    // Clean up expired reservations first
    await this.cleanupExpiredReservations()

    // Check if we have enough available tickets
    const stock = await stockCollection.findOne({ ticketType })
    if (!stock || stock.availableQuantity < quantity) {
      return false
    }

    // Create reservation record
    await reservationCollection.insertOne({
      ticketType,
      quantity,
      orderId,
      paymentId,
      expiresAt,
      createdAt: new Date(),
      status: "active",
    })

    // Update stock quantities
    const result = await stockCollection.updateOne(
      { ticketType },
      {
        $inc: {
          reservedQuantity: quantity,
          availableQuantity: -quantity,
        },
        $set: {
          lastUpdated: new Date(),
        },
      },
    )

    console.log(`🔒 Reserved ${quantity}x ${ticketType} tickets until ${expiresAt.toISOString()}`)
    return result.modifiedCount > 0
  }

  // Confirm ticket sale (when payment is finished)
  static async confirmSale(ticketType: string, quantity: number, orderId: string): Promise<boolean> {
    const stockCollection = await this.getStockCollection()
    const reservationCollection = await this.getReservationCollection()

    // Find and update the reservation
    await reservationCollection.updateOne(
      { orderId, status: "active" },
      {
        $set: {
          status: "confirmed",
          lastUpdated: new Date(),
        },
      },
    )

    // Update stock - move from reserved to sold
    const result = await stockCollection.updateOne(
      { ticketType },
      {
        $inc: {
          reservedQuantity: -quantity,
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

  // Release reserved tickets (when payment fails/expires/cancelled)
  static async releaseReservation(ticketType: string, quantity: number, orderId?: string): Promise<boolean> {
    const stockCollection = await this.getStockCollection()
    const reservationCollection = await this.getReservationCollection()

    // Update reservation status if orderId provided
    if (orderId) {
      await reservationCollection.updateOne(
        { orderId, status: "active" },
        {
          $set: {
            status: "cancelled",
            lastUpdated: new Date(),
          },
        },
      )
    }

    // Release the reserved quantity
    const result = await stockCollection.updateOne(
      { ticketType },
      {
        $inc: {
          reservedQuantity: -quantity,
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
    // Clean up expired reservations first
    await this.cleanupExpiredReservations()

    const stock = await this.getStock(ticketType)
    return stock ? stock.availableQuantity >= quantity : false
  }

  // Get formatted stock info for frontend
  static async getStockInfo() {
    const allStock = await this.getAllStock()

    return allStock.map((stock) => ({
      type: stock.ticketType,
      available: stock.availableQuantity,
      reserved: stock.reservedQuantity,
      total: stock.maxQuantity,
      sold: stock.soldQuantity,
      soldOut: stock.availableQuantity === 0,
    }))
  }

  // Get reservation info for a specific order
  static async getReservationInfo(orderId: string): Promise<ReservationRecord | null> {
    const collection = await this.getReservationCollection()
    return await collection.findOne({ orderId, status: "active" })
  }
}
