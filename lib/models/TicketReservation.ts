import clientPromise from "@/lib/mongodb"
import type { ObjectId } from "mongodb"

export interface TicketReservation {
  _id?: ObjectId
  orderId: string
  paymentId: string
  ticketType: string
  quantity: number
  customerEmail: string
  reservedAt: Date
  expiresAt: Date
  status: "active" | "expired" | "confirmed" | "cancelled"
  createdAt: Date
}

export class TicketReservationModel {
  private static collectionName = "ticket_reservations"
  private static RESERVATION_DURATION_MINUTES = 15

  static async getCollection() {
    const client = await clientPromise
    const db = client.db("kaspa_birthday")
    return db.collection<TicketReservation>(this.collectionName)
  }

  // Create a new reservation
  static async createReservation(
    orderId: string,
    paymentId: string,
    ticketType: string,
    quantity: number,
    customerEmail: string,
  ): Promise<TicketReservation> {
    const collection = await this.getCollection()

    const now = new Date()
    const expiresAt = new Date(now.getTime() + this.RESERVATION_DURATION_MINUTES * 60 * 1000)

    const reservation: TicketReservation = {
      orderId,
      paymentId,
      ticketType,
      quantity,
      customerEmail,
      reservedAt: now,
      expiresAt,
      status: "active",
      createdAt: now,
    }

    const result = await collection.insertOne(reservation)
    return { ...reservation, _id: result.insertedId }
  }

  // Get reservation by payment ID
  static async getByPaymentId(paymentId: string): Promise<TicketReservation | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ paymentId })
  }

  // Get reservation by order ID
  static async getByOrderId(orderId: string): Promise<TicketReservation | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ orderId })
  }

  // Cancel a reservation
  static async cancelReservation(paymentId: string): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { paymentId, status: "active" },
      {
        $set: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  }

  // Confirm a reservation (when payment is completed)
  static async confirmReservation(paymentId: string): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { paymentId },
      {
        $set: {
          status: "confirmed",
          confirmedAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  }

  // Clean up expired reservations
  static async cleanupExpiredReservations(): Promise<number> {
    const collection = await this.getCollection()

    const now = new Date()
    const result = await collection.updateMany(
      {
        status: "active",
        expiresAt: { $lt: now },
      },
      {
        $set: {
          status: "expired",
          expiredAt: now,
        },
      },
    )

    console.log(`🧹 Cleaned up ${result.modifiedCount} expired reservations`)
    return result.modifiedCount
  }

  // Get all expired reservations that need stock released
  static async getExpiredReservations(): Promise<TicketReservation[]> {
    const collection = await this.getCollection()

    return await collection
      .find({
        status: "expired",
        expiredAt: { $exists: true },
      })
      .toArray()
  }

  // Check if reservation is still valid
  static async isReservationValid(paymentId: string): Promise<boolean> {
    const reservation = await this.getByPaymentId(paymentId)

    if (!reservation || reservation.status !== "active") {
      return false
    }

    const now = new Date()
    if (now > reservation.expiresAt) {
      // Mark as expired
      await this.cleanupExpiredReservations()
      return false
    }

    return true
  }

  // Get time remaining for reservation
  static async getTimeRemaining(paymentId: string): Promise<number> {
    const reservation = await this.getByPaymentId(paymentId)

    if (!reservation || reservation.status !== "active") {
      return 0
    }

    const now = new Date()
    const remaining = reservation.expiresAt.getTime() - now.getTime()

    return Math.max(0, Math.floor(remaining / 1000)) // Return seconds
  }
}
