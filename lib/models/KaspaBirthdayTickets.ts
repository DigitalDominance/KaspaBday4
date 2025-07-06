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
  reservationExpiresAt?: Date
  ticketGenerated?: boolean
  ticketCode?: string
  qrCodeUrl?: string
  emailSent?: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export class KaspaBirthdayTicketsModel {
  private static collectionName = "kaspa_birthday_tickets"

  static async getCollection() {
    const client = await clientPromise
    const db = client.db("kaspa_birthday")
    return db.collection<KaspaBirthdayTicket>(this.collectionName)
  }

  static async create(
    ticketData: Omit<KaspaBirthdayTicket, "_id" | "createdAt" | "updatedAt">,
  ): Promise<KaspaBirthdayTicket> {
    const collection = await this.getCollection()

    const ticket: Omit<KaspaBirthdayTicket, "_id"> = {
      ...ticketData,
      ticketGenerated: false,
      emailSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(ticket)
    return { ...ticket, _id: result.insertedId }
  }

  static async findByPaymentId(paymentId: string): Promise<KaspaBirthdayTicket | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ paymentId })
  }

  static async findByOrderId(orderId: string): Promise<KaspaBirthdayTicket | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ orderId })
  }

  static async updatePaymentStatus(
    paymentId: string,
    updates: {
      paymentStatus?: string
      ticketGenerated?: boolean
      ticketCode?: string
      qrCodeUrl?: string
      emailSent?: boolean
      notes?: string
    },
  ): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { paymentId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  }

  static async findExpiredReservations(): Promise<KaspaBirthdayTicket[]> {
    const collection = await this.getCollection()

    return await collection
      .find({
        paymentStatus: "waiting",
        reservationExpiresAt: { $lt: new Date() },
      })
      .toArray()
  }

  static async findByEmail(email: string): Promise<KaspaBirthdayTicket[]> {
    const collection = await this.getCollection()
    return await collection.find({ customerEmail: email }).toArray()
  }

  static async getAllTickets(): Promise<KaspaBirthdayTicket[]> {
    const collection = await this.getCollection()
    return await collection.find({}).sort({ createdAt: -1 }).toArray()
  }

  static async getTicketStats() {
    const collection = await this.getCollection()

    const stats = await collection
      .aggregate([
        {
          $group: {
            _id: "$ticketType",
            totalSold: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "finished"] }, "$quantity", 0],
              },
            },
            totalRevenue: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "finished"] }, { $multiply: ["$quantity", "$pricePerTicket"] }, 0],
              },
            },
            pendingCount: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "waiting"] }, "$quantity", 0],
              },
            },
          },
        },
      ])
      .toArray()

    return stats
  }
}
