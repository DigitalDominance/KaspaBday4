import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Kaspa's 4th Birthday Celebration | Liverpool, NY",
  description:
    "Join us for Kaspa's 4th Birthday Celebration - A weekend of blockchain innovation, community, and celebration in Central New York.",
  keywords: [
    "Kaspa",
    "blockchain",
    "cryptocurrency",
    "birthday",
    "celebration",
    "Liverpool NY",
    "blockDAG",
    "GHOSTDAG",
    "community event",
  ],
  authors: [{ name: "Kaspa Community" }],
  creator: "Kaspa Community",
  publisher: "KaspaFunding",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://kaspa-birthday.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kaspa's 4th Birthday Celebration | Liverpool, NY",
    description:
      "Join us for Kaspa's 4th Birthday Celebration - A weekend of blockchain innovation, community, and celebration in Central New York.",
    url: "https://kaspa-birthday.vercel.app",
    siteName: "Kaspa's 4th Birthday Celebration",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Kaspa's 4th Birthday Celebration",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaspa's 4th Birthday Celebration | Liverpool, NY",
    description:
      "Join us for Kaspa's 4th Birthday Celebration - A weekend of blockchain innovation, community, and celebration in Central New York.",
    images: ["/android-chrome-512x512.png"],
    creator: "@FundingKaspa",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Replace with actual verification code
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" disableSystemTheme>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
