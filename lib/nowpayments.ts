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
