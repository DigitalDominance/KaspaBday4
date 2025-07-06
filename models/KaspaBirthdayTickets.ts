import mongoose from "mongoose"

const KaspaBirthdayTicketsSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  ticketQuantity: { type: Number, required: true },
  totalAmount: { type: String, required: true },
  currency: { type: String, required: true },
  paymentId: { type: String, required: true },
  paymentAddress: { type: String, required: true },
  paymentAmount: { type: String, required: true },
  status: { type: String, default: "pending" },
  emailSent: { type: Boolean, default: false },
  paymentConfirmationEmailSent: { type: Boolean, default: false },
  ticketNumbers: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const KaspaBirthdayTickets =
  mongoose.models.KaspaBirthdayTickets || mongoose.model("KaspaBirthdayTickets", KaspaBirthdayTicketsSchema)

export default KaspaBirthdayTickets
