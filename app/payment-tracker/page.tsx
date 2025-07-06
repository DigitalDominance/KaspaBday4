"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PaymentStatusTracker } from "@/components/payment-status-tracker"
import { PaymentStorage, type StoredPayment } from "@/lib/payment-storage"
import { Clock, CheckCircle, AlertCircle, Trash2 } from "lucide-react"
import { Space_Grotesk } from "next/font/google"
import { cn } from "@/lib/utils"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })

export default function PaymentTrackerPage() {
  const [payments, setPayments] = useState<StoredPayment[]>([])
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = () => {
    const allPayments = PaymentStorage.getAllPayments()
    setPayments(allPayments)

    // Auto-select the most recent pending payment
    const pendingPayments = PaymentStorage.getPendingPayments()
    if (pendingPayments.length > 0 && !selectedPayment) {
      setSelectedPayment(pendingPayments[pendingPayments.length - 1].paymentId)
    }
  }

  const removePayment = (paymentId: string) => {
    PaymentStorage.removePayment(paymentId)
    loadPayments()
    if (selectedPayment === paymentId) {
      setSelectedPayment(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "finished":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "waiting":
      case "confirming":
      case "confirmed":
      case "sending":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finished":
        return "bg-green-500"
      case "waiting":
      case "confirming":
      case "confirmed":
      case "sending":
        return "bg-blue-500"
      default:
        return "bg-red-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="container mx-auto max-w-6xl pt-20">
        <div className="text-center mb-8">
          <h1
            className={cn(
              "text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400",
              spaceGrotesk.className,
            )}
          >
            Payment Tracker
          </h1>
          <p className="text-muted-foreground">Track your Kaspa Birthday ticket payments in real-time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment List */}
          <div className="lg:col-span-1">
            <Card className="border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-lg">Your Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No payments found</p>
                    <p className="text-sm">Your payments will appear here</p>
                  </div>
                ) : (
                  payments.map((payment) => (
                    <div
                      key={payment.paymentId}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all duration-200",
                        selectedPayment === payment.paymentId
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-border hover:border-blue-500/50",
                      )}
                      onClick={() => setSelectedPayment(payment.paymentId)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(payment.paymentStatus)}
                            <span className="font-medium text-sm">{payment.ticketName}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {payment.customerName} • {payment.quantity} ticket{payment.quantity > 1 ? "s" : ""}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge className={cn("text-white text-xs", getStatusColor(payment.paymentStatus))}>
                              {payment.paymentStatus}
                            </Badge>
                            <span className="text-xs font-medium">${payment.totalAmount}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            removePayment(payment.paymentId)
                          }}
                          className="ml-2 h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Details */}
          <div className="lg:col-span-2">
            {selectedPayment ? (
              <PaymentStatusTracker paymentId={selectedPayment} onStatusChange={() => loadPayments()} />
            ) : (
              <Card className="border-blue-500/20">
                <CardContent className="pt-8 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-bold mb-2">Select a Payment</h3>
                  <p className="text-muted-foreground">Choose a payment from the list to view its status and details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
