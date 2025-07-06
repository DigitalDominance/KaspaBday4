import clientPromise from "@/lib/mongodb"
import type { ObjectId } from "mongodb"

export interface TicketReservation {
  _id?: ObjectId
  orderId: string
  paymentId: string
  ticketType: string
  quantity: number
  customerEmail: string
  status: "active" | "confirmed" | "cancelled" | "expired"
  createdAt: Date
  expiresAt: Date
  updatedAt: Date
}

export class TicketReservationModel {
  private static collectionName = "ticket_reservations"
  private static RESERVATION_DURATION_MINUTES = 15

  static async getCollection() {
    const client = await clientPromise
    const db = client.db("kaspa_birthday")
    return db.collection<TicketReservation>(this.collectionName)
  }

  // Create a new reservation with 15-minute expiry
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
      status: "active",
      createdAt: now,
      expiresAt,
      updatedAt: now,
    }

    const result = await collection.insertOne(reservation)
    console.log(`🔒 Created reservation for ${quantity}x ${ticketType} tickets, expires at ${expiresAt.toISOString()}`)

    return { ...reservation, _id: result.insertedId }
  }

  // Get reservation by payment ID
  static async getByPaymentId(paymentId: string): Promise<TicketReservation | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ paymentId })
  }

  // Get remaining time for a reservation
  static async getRemainingTime(
    paymentId: string,
  ): Promise<{ valid: boolean; timeRemaining: number; expired: boolean }> {
    const reservation = await this.getByPaymentId(paymentId)

    if (!reservation || reservation.status !== "active") {
      return { valid: false, timeRemaining: 0, expired: true }
    }

    const now = new Date()
    const timeRemaining = Math.max(0, Math.floor((reservation.expiresAt.getTime() - now.getTime()) / 1000))
    const expired = timeRemaining === 0

    if (expired && reservation.status === "active") {
      // Mark as expired
      await this.expireReservation(paymentId)
    }

    return {
      valid: !expired,
      timeRemaining,
      expired,
    }
  }

  // Confirm reservation (when payment is successful)
  static async confirmReservation(paymentId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.updateOne(
      { paymentId, status: "active" },
      {
        $set: {
          status: "confirmed",
          updatedAt: new Date(),
        },
      },
    )

    console.log(`✅ Confirmed reservation for payment: ${paymentId}`)
    return result.modifiedCount > 0
  }

  // Cancel reservation (user cancellation)
  static async cancelReservation(paymentId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.updateOne(
      { paymentId, status: "active" },
      {
        $set: {
          status: "cancelled",
          updatedAt: new Date(),
        },
      },
    )

    console.log(`❌ Cancelled reservation for payment: ${paymentId}`)
    return result.modifiedCount > 0
  }

  // Expire reservation (automatic expiry)
  static async expireReservation(paymentId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.updateOne(
      { paymentId, status: "active" },
      {
        $set: {
          status: "expired",
          updatedAt: new Date(),
        },
      },
    )

    if (result.modifiedCount > 0) {
      console.log(`⏰ Expired reservation for payment: ${paymentId}`)
    }
    return result.modifiedCount > 0
  }

  // Get all expired reservations that need cleanup
  static async getExpiredReservations(): Promise<TicketReservation[]> {
    const collection = await this.getCollection()
    const now = new Date()

    return await collection
      .find({
        status: "active",
        expiresAt: { $lt: now },
      })
      .toArray()
  }

  // Clean up expired reservations
  static async cleanupExpiredReservations(): Promise<void> {
    const expiredReservations = await this.getExpiredReservations()

    for (const reservation of expiredReservations) {
      await this.expireReservation(reservation.paymentId)
    }

    console.log(`🧹 Cleaned up ${expiredReservations.length} expired reservations`)
  }
}
