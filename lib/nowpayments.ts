const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1"
const API_KEY = process.env.NOWPAYMENTS_API_KEY!
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET!

export class NOWPaymentsAPI {
  private headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json",
  }

  async getStatus() {
    const response = await fetch(`${NOWPAYMENTS_API_URL}/status`, {
      headers: this.headers,
    })
    return response.json()
  }

  async getCurrencies() {
    const response = await fetch(`${NOWPAYMENTS_API_URL}/currencies`, {
      headers: this.headers,
    })
    return response.json()
  }

  async getMinAmount(currencyFrom: string, currencyTo = "usd") {
    const response = await fetch(
      `${NOWPAYMENTS_API_URL}/min-amount?currency_from=${currencyFrom}&currency_to=${currencyTo}`,
      {
        headers: this.headers,
      },
    )
    return response.json()
  }

  async getEstimate(amount: number, currencyFrom: string, currencyTo: string) {
    const response = await fetch(
      `${NOWPAYMENTS_API_URL}/estimate?amount=${amount}&currency_from=${currencyFrom}&currency_to=${currencyTo}`,
      {
        headers: this.headers,
      },
    )
    return response.json()
  }

  async createPayment(paymentData: {
    price_amount: number
    price_currency: string
    pay_currency: string
    order_id: string
    order_description: string
    ipn_callback_url: string
    success_url: string
    cancel_url: string
  }) {
    console.log(`🚀 Creating NOWPayments payment:`, {
      ...paymentData,
      ipn_callback_url: paymentData.ipn_callback_url,
    })

    const response = await fetch(`${NOWPAYMENTS_API_URL}/payment`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(paymentData),
    })

    const result = await response.json()
    console.log(`📝 NOWPayments create response:`, result)

    return result
  }

  async getPaymentStatus(paymentId: string) {
    console.log(`🔍 Fetching payment status for ID: ${paymentId}`)

    const response = await fetch(`${NOWPAYMENTS_API_URL}/payment/${paymentId}`, {
      headers: this.headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ NOWPayments API error (${response.status}):`, errorText)
      throw new Error(`NOWPayments API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log(`📊 NOWPayments status response:`, {
      payment_id: result.payment_id,
      payment_status: result.payment_status,
      actually_paid: result.actually_paid,
      pay_amount: result.pay_amount,
      created_at: result.created_at,
      updated_at: result.updated_at,
    })

    return result
  }

  // NEW: Get payment status using the payments list endpoint (more reliable)
  async getPaymentStatusFromList(paymentId: string) {
    console.log(`🔍 Fetching payment status from list for ID: ${paymentId}`)

    // Get recent payments and find our specific payment
    const response = await fetch(`${NOWPAYMENTS_API_URL}/payment/?limit=100&page=0&sortBy=updated_at&orderBy=desc`, {
      headers: this.headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ NOWPayments payments list API error (${response.status}):`, errorText)
      throw new Error(`NOWPayments payments list API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log(`📊 NOWPayments payments list response: ${result.data?.length || 0} payments found`)

    // Find our specific payment in the list
    const payment = result.data?.find((p: any) => p.payment_id.toString() === paymentId.toString())

    if (!payment) {
      console.error(`❌ Payment ${paymentId} not found in payments list`)
      throw new Error(`Payment ${paymentId} not found`)
    }

    console.log(`✅ Found payment ${paymentId} in list:`, {
      payment_id: payment.payment_id,
      payment_status: payment.payment_status,
      actually_paid: payment.actually_paid,
      pay_amount: payment.pay_amount,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
    })

    return payment
  }

  // NEW: Get payment by order ID (useful for tracking)
  async getPaymentByOrderId(orderId: string) {
    console.log(`🔍 Fetching payment by order ID: ${orderId}`)

    // Search through recent payments for our order
    const response = await fetch(`${NOWPAYMENTS_API_URL}/payment/?limit=100&page=0&sortBy=updated_at&orderBy=desc`, {
      headers: this.headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ NOWPayments payments list API error (${response.status}):`, errorText)
      throw new Error(`NOWPayments payments list API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    // Find payment by order_id
    const payment = result.data?.find((p: any) => p.order_id === orderId)

    if (!payment) {
      console.error(`❌ Payment with order ID ${orderId} not found`)
      throw new Error(`Payment with order ID ${orderId} not found`)
    }

    console.log(`✅ Found payment for order ${orderId}:`, {
      payment_id: payment.payment_id,
      payment_status: payment.payment_status,
      order_id: payment.order_id,
      updated_at: payment.updated_at,
    })

    return payment
  }

  verifyIPN(signature: string, body: any): boolean {
    const crypto = require("crypto")

    function sortObject(obj: any): any {
      return Object.keys(obj)
        .sort()
        .reduce((result: any, key: string) => {
          result[key] = obj[key] && typeof obj[key] === "object" ? sortObject(obj[key]) : obj[key]
          return result
        }, {})
    }

    const sortedBody = sortObject(body)
    const hmac = crypto.createHmac("sha512", IPN_SECRET)
    hmac.update(JSON.stringify(sortedBody))
    const calculatedSignature = hmac.digest("hex")

    return calculatedSignature === signature
  }
}
