"use client"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { EventDetails } from "@/components/event-details"
import { Tickets } from "@/components/tickets"
import { Accommodations } from "@/components/accommodations"
import { Itinerary } from "@/components/itinerary"
import { Sponsors } from "@/components/sponsors"
import { HostedBy } from "@/components/hosted-by"
import { Footer } from "@/components/footer"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time and wait for page to be ready
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // 3 second loading time

    // Also check if document is ready
    if (document.readyState === "complete") {
      const minLoadTime = setTimeout(() => {
        setIsLoading(false)
      }, 2000) // Minimum 2 seconds
      return () => clearTimeout(minLoadTime)
    }

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      <main className="min-h-screen bg-background">
        <Navigation />
        <HeroSection />
        <EventDetails />
        <Tickets />
        <Itinerary />
        <Sponsors />
        <HostedBy />
        <Accommodations />
        <Footer />
      </main>
    </>
  )
}
