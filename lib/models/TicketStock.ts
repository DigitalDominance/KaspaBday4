import mongoose from "mongoose"

export interface ITicketStock {
  ticketType: string
  totalAvailable: number
  sold: number
  reserved: number
  remaining: number
  lastUpdated: Date
}

const TicketStockSchema = new mongoose.Schema<ITicketStock>({
  ticketType: {
    type: String,
    required: true,
    unique: true,
    enum: ["1-day", "2-day", "3-day", "vip"],
  },
  totalAvailable: {
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
  remaining: {
    type: Number,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
})

// Update remaining count before saving
TicketStockSchema.pre("save", function () {
  this.remaining = this.totalAvailable - this.sold - this.reserved
})

export const TicketStock = mongoose.models.TicketStock || mongoose.model<ITicketStock>("TicketStock", TicketStockSchema)
