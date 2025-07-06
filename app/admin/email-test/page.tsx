"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Mail, CheckCircle, AlertCircle, Send } from "lucide-react"
import { Space_Grotesk } from "next/font/google"
import { cn } from "@/lib/utils"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })

export default function EmailTestPage() {
  const [email, setEmail] = useState("")
  const [testType, setTestType] = useState("ticket")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const sendTestEmail = async () => {
    if (!email) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/email-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, testType }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message })
      } else {
        setResult({ success: false, message: data.error || "Failed to send email" })
      }
    } catch (error) {
      setResult({ success: false, message: "Network error occurred" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="container mx-auto max-w-2xl pt-20">
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
          <CardHeader>
            <CardTitle className={cn("text-2xl text-center", spaceGrotesk.className)}>
              <Mail className="w-8 h-8 mx-auto mb-4 text-blue-500" />
              Email Template Test
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Test the Kaspa Birthday email templates with beautiful formatting
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Test Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to receive test"
                className="border-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testType">Email Type</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger className="border-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ticket">🎫 Full Ticket Email (with QR code)</SelectItem>
                  <SelectItem value="confirmation">💰 Payment Confirmation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={sendTestEmail}
              disabled={!email || loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Test Email...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>

            {result && (
              <div
                className={cn(
                  "p-4 rounded-lg border flex items-center gap-3",
                  result.success
                    ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
                    : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
                )}
              >
                {result.success ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span>{result.message}</span>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg border border-blue-500/20">
              <h4 className="font-semibold mb-3 text-foreground">✨ Super Easy Setup:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Uses Resend's free onboarding domain (no custom domain needed!)</li>
                <li>• Beautiful responsive design matching site theme</li>
                <li>• QR code embedded directly in email</li>
                <li>• Works with any email provider</li>
                <li>• Professional sender name: "Kaspa Birthday Event"</li>
                <li>• Replies go to any email you specify</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded-lg border border-green-500/20">
              <h4 className="font-semibold mb-3 text-foreground">🚀 Quick Setup Steps:</h4>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Sign up for free Resend account at resend.com</li>
                <li>Get your API key from the dashboard</li>
                <li>Add RESEND_API_KEY to your environment variables</li>
                <li>That's it! No domain verification needed</li>
              </ol>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>This sends real emails using Resend's default domain.</p>
              <p>Perfect for testing and production use without custom domain setup!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
