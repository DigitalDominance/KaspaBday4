import mongoose from "mongoose"

const TicketStockSchema = new mongoose.Schema({
  ticketType: {
    type: String,
    required: true,
    enum: ["1-day", "3-day", "vip"],
  },
  totalStock: {
    type: Number,
    required: true,
  },
  sold: {
    type: Number,
    default: 0,
  },
  reserved: {
    type: Number,
    default: 0,
  },
  reservations: [
    {
      reservationId: String,
      quantity: Number,
      expiresAt: Date,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

TicketStockSchema.methods.getAvailable = function () {
  return this.totalStock - this.sold - this.reserved
}

TicketStockSchema.statics.reserveTickets = async function (ticketType: string, quantity: number) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Clean up expired reservations first
    await this.cleanupExpiredReservations(ticketType)

    const stock = await this.findOne({ ticketType }).session(session)
    if (!stock) {
      throw new Error("Ticket type not found")
    }

    const available = stock.getAvailable()
    if (available < quantity) {
      throw new Error(`Only ${available} tickets available`)
    }

    // Create reservation
    const reservationId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    stock.reserved += quantity
    stock.reservations.push({
      reservationId,
      quantity,
      expiresAt,
    })
    stock.updatedAt = new Date()

    await stock.save({ session })
    await session.commitTransaction()

    return {
      success: true,
      reservationId,
      expiresAt,
    }
  } catch (error) {
    await session.abortTransaction()
    return {
      success: false,
      error: error instanceof Error ? error.message : "Reservation failed",
    }
  } finally {
    session.endSession()
  }
}

TicketStockSchema.statics.releaseReservation = async function (reservationId: string) {
  try {
    const stock = await this.findOne({
      "reservations.reservationId": reservationId,
    })

    if (!stock) {
      console.log("Reservation not found:", reservationId)
      return { success: false, error: "Reservation not found" }
    }

    const reservation = stock.reservations.find((r: any) => r.reservationId === reservationId)
    if (!reservation) {
      return { success: false, error: "Reservation not found" }
    }

    // Remove reservation and decrease reserved count
    stock.reserved -= reservation.quantity
    stock.reservations = stock.reservations.filter((r: any) => r.reservationId !== reservationId)
    stock.updatedAt = new Date()

    await stock.save()
    console.log(`Released ${reservation.quantity} tickets for ${stock.ticketType}`)

    return { success: true }
  } catch (error) {
    console.error("Error releasing reservation:", error)
    return { success: false, error: "Failed to release reservation" }
  }
}

TicketStockSchema.statics.confirmSale = async function (reservationId: string) {
  try {
    const stock = await this.findOne({
      "reservations.reservationId": reservationId,
    })

    if (!stock) {
      return { success: false, error: "Reservation not found" }
    }

    const reservation = stock.reservations.find((r: any) => r.reservationId === reservationId)
    if (!reservation) {
      return { success: false, error: "Reservation not found" }
    }

    // Move from reserved to sold
    stock.reserved -= reservation.quantity
    stock.sold += reservation.quantity
    stock.reservations = stock.reservations.filter((r: any) => r.reservationId !== reservationId)
    stock.updatedAt = new Date()

    await stock.save()
    console.log(`Confirmed sale of ${reservation.quantity} tickets for ${stock.ticketType}`)

    return { success: true }
  } catch (error) {
    console.error("Error confirming sale:", error)
    return { success: false, error: "Failed to confirm sale" }
  }
}

TicketStockSchema.statics.cleanupExpiredReservations = async function (ticketType?: string) {
  try {
    const query = ticketType ? { ticketType } : {}
    const stocks = await this.find(query)

    for (const stock of stocks) {
      const now = new Date()
      const expiredReservations = stock.reservations.filter((r: any) => r.expiresAt < now)

      if (expiredReservations.length > 0) {
        const expiredQuantity = expiredReservations.reduce((sum: number, r: any) => sum + r.quantity, 0)

        stock.reserved -= expiredQuantity
        stock.reservations = stock.reservations.filter((r: any) => r.expiresAt >= now)
        stock.updatedAt = new Date()

        await stock.save()
        console.log(`Cleaned up ${expiredReservations.length} expired reservations for ${stock.ticketType}`)
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error cleaning up expired reservations:", error)
    return { success: false, error: "Cleanup failed" }
  }
}

TicketStockSchema.statics.getStockInfo = async function () {
  await this.cleanupExpiredReservations()

  const stocks = await this.find({})
  return stocks.map((stock) => ({
    ticketType: stock.ticketType,
    totalStock: stock.totalStock,
    sold: stock.sold,
    reserved: stock.reserved,
    available: stock.getAvailable(),
    updatedAt: stock.updatedAt,
  }))
}

export const TicketStockModel = mongoose.models.TicketStock || mongoose.model("TicketStock", TicketStockSchema)
