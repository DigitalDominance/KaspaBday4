export interface TicketType {
  id: string
  name: string
  price: number
  originalPrice?: number
  description: string
  features: string[]
  maxStock: number
  currentStock: number
  soldOut: boolean
}

export interface CustomerInfo {
  name: string
  email: string
}

export interface PaymentData {
  ticketType: string
  quantity: number
  customerInfo: CustomerInfo
  currency: string
  totalAmount: number
}

export interface NOWPaymentResponse {
  payment_id: string
  payment_status: string
  pay_address: string
  price_amount: number
  price_currency: string
  pay_amount: number
  pay_currency: string
  order_id: string
  order_description: string
  purchase_id: string
}

export interface TicketOrder {
  id: string
  customerName: string
  customerEmail: string
  ticketType: string
  quantity: number
  totalAmount: number
  currency: string
  paymentId: string
  paymentStatus: string
  createdAt: Date
  paidAt?: Date
  qrCode?: string
}
