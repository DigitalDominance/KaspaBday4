import { NextResponse } from "next/server"
import { TicketStockModel } from "@/lib/models/TicketStock"
import clientPromise from "@/lib/mongodb"

export async function POST() {
  try {
    console.log("🧹 Starting cleanup of expired reservations...")

    // Clean up expired reservations in the stock model
    const expiredCount = await TicketStockModel.cleanupExpiredReservations()

    // Also update any expired tickets in the main collection
    const client = await clientPromise
    const db = client.db("kaspa_birthday")
    const ticketsCollection = db.collection("kaspa_birthday_tickets")

    // Find tickets that are still "waiting" but have expired
    const expiredTickets = await ticketsCollection
      .find({
        paymentStatus: "waiting",
        expiresAt: { $lt: new Date() },
      })
      .toArray()

    // Update their status
    for (const ticket of expiredTickets) {
      await ticketsCollection.updateOne(
        { _id: ticket._id },
        {
          $set: {
            paymentStatus: "expired",
            updatedAt: new Date(),
          },
        },
      )
    }

    console.log(`✅ Cleanup complete: ${expiredCount} reservations, ${expiredTickets.length} tickets expired`)

    return NextResponse.json({
      success: true,
      expiredReservations: expiredCount,
      expiredTickets: expiredTickets.length,
    })
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json({ error: "Failed to cleanup expired items" }, { status: 500 })
  }
}
