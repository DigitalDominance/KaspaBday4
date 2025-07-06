// Client-side payment tracking storage
export interface StoredPayment {
  paymentId: string
  orderId: string
  customerName: string
  customerEmail: string
  ticketType: string
  ticketName: string
  quantity: number
  totalAmount: number
  currency: string
  payAddress: string
  payAmount: number
  payCurrency: string
  paymentStatus: string
  createdAt: string
}

const STORAGE_KEY = "kaspa_payment_tracking"

export class PaymentStorage {
  static savePayment(payment: StoredPayment) {
    try {
      const existingPayments = this.getAllPayments()
      const updatedPayments = existingPayments.filter((p) => p.paymentId !== payment.paymentId)
      updatedPayments.push(payment)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPayments))
    } catch (error) {
      console.error("Failed to save payment:", error)
    }
  }

  static getPayment(paymentId: string): StoredPayment | null {
    try {
      const payments = this.getAllPayments()
      return payments.find((p) => p.paymentId === paymentId) || null
    } catch (error) {
      console.error("Failed to get payment:", error)
      return null
    }
  }

  static getAllPayments(): StoredPayment[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to get payments:", error)
      return []
    }
  }

  static updatePaymentStatus(paymentId: string, status: string) {
    try {
      const payments = this.getAllPayments()
      const paymentIndex = payments.findIndex((p) => p.paymentId === paymentId)

      if (paymentIndex !== -1) {
        payments[paymentIndex].paymentStatus = status
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payments))
      }
    } catch (error) {
      console.error("Failed to update payment status:", error)
    }
  }

  static removePayment(paymentId: string) {
    try {
      const payments = this.getAllPayments()
      const filteredPayments = payments.filter((p) => p.paymentId !== paymentId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPayments))
    } catch (error) {
      console.error("Failed to remove payment:", error)
    }
  }

  static getPendingPayments(): StoredPayment[] {
    const payments = this.getAllPayments()
    return payments.filter(
      (p) =>
        p.paymentStatus === "waiting" ||
        p.paymentStatus === "confirming" ||
        p.paymentStatus === "confirmed" ||
        p.paymentStatus === "sending",
    )
  }
}
