import clientPromise from "@/lib/mongodb"
import type { ObjectId } from "mongodb"

export interface KaspaBirthdayTicket {
  _id?: ObjectId
  orderId: string
  customerName: string
  customerEmail: string
  ticketType: string
  ticketName: string
  quantity: number
  pricePerTicket: number
  totalAmount: string
  currency: string
  paymentId: string
  paymentStatus: string
  payAddress?: string
  payAmount?: number
  payCurrency?: string
  actuallyPaid?: number
  qrCode?: string
  ticketData?: any
  createdAt: Date
  updatedAt: Date
  paidAt?: Date
  emailSent?: boolean
  paymentConfirmationEmailSent?: boolean
  notes?: string
  reservationExpiresAt?: Date
}

export class KaspaBirthdayTicketsModel {
  private static collectionName = "kaspa_birthday_tickets"

  static async getCollection() {
    const client = await clientPromise
    const db = client.db("kaspa_birthday")
    return db.collection<KaspaBirthdayTicket>(this.collectionName)
  }

  static async create(ticketData: Omit<KaspaBirthdayTicket, "_id" | "createdAt" | "updatedAt">) {
    const collection = await this.getCollection()
    const now = new Date()

    const ticket: KaspaBirthdayTicket = {
      ...ticketData,
      createdAt: now,
      updatedAt: now,
      emailSent: false,
      paymentConfirmationEmailSent: false,
    }

    const result = await collection.insertOne(ticket)
    return { ...ticket, _id: result.insertedId }
  }

  static async findByOrderId(orderId: string) {
    const collection = await this.getCollection()
    return await collection.findOne({ orderId })
  }

  static async findByPaymentId(paymentId: string) {
    const collection = await this.getCollection()
    return await collection.findOne({ paymentId })
  }

  static async findExpiredReservations() {
    const collection = await this.getCollection()
    const now = new Date()

    return await collection
      .find({
        paymentStatus: "waiting",
        reservationExpiresAt: { $lt: now },
      })
      .toArray()
  }

  static async updatePaymentStatus(paymentId: string, updateData: Partial<KaspaBirthdayTicket>) {
    const collection = await this.getCollection()
    const now = new Date()

    const result = await collection.updateOne(
      { paymentId },
      {
        $set: {
          ...updateData,
          updatedAt: now,
          ...(updateData.paymentStatus === "finished" && { paidAt: now }),
        },
      },
    )

    return result
  }

  static async findByEmail(email: string) {
    const collection = await this.getCollection()
    return await collection.find({ customerEmail: email }).toArray()
  }

  static async getAllTickets(limit = 100, skip = 0) {
    const collection = await this.getCollection()
    return await collection.find({}).sort({ createdAt: -1 }).limit(limit).skip(skip).toArray()
  }

  static async getTicketStats() {
    const collection = await this.getCollection()

    const stats = await collection
      .aggregate([
        {
          $group: {
            _id: "$ticketType",
            totalSold: { $sum: "$quantity" },
            totalRevenue: { $sum: "$totalAmount" },
            paidTickets: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "finished"] }, "$quantity", 0],
              },
            },
          },
        },
      ])
      .toArray()

    return stats
  }

  static async getEmailStats() {
    const collection = await this.getCollection()

    const emailStats = await collection
      .aggregate([
        {
          $group: {
            _id: null,
            totalTickets: { $sum: 1 },
            emailsSent: { $sum: { $cond: ["$emailSent", 1, 0] } },
            paymentConfirmationsSent: { $sum: { $cond: ["$paymentConfirmationEmailSent", 1, 0] } },
            finishedPayments: { $sum: { $cond: [{ $eq: ["$paymentStatus", "finished"] }, 1, 0] } },
          },
        },
      ])
      .toArray()

    return (
      emailStats[0] || {
        totalTickets: 0,
        emailsSent: 0,
        paymentConfirmationsSent: 0,
        finishedPayments: 0,
      }
    )
  }
}
