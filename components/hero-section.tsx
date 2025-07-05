"use client"

import { motion } from "framer-motion"
import { Space_Grotesk } from "next/font/google"
import { cn } from "@/lib/utils"
import { Calendar, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ElegantShape } from "@/components/ui/elegant-shape"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-grotesk",
})

export function HeroSection() {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  const scrollToTickets = () => {
    const element = document.querySelector("#tickets")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToEventDetails = () => {
    const element = document.querySelector("#event-details")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      id="home"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Mobile darker overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-blue-900/15 to-purple-900/20 md:from-blue-500/[0.05] md:via-transparent md:to-purple-500/[0.05] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          width={600}
          height={140}
          mobileWidth={180}
          mobileHeight={42}
          rotate={45}
          gradient="from-blue-400/[0.25]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />
        <ElegantShape
          width={500}
          height={120}
          mobileWidth={150}
          mobileHeight={36}
          rotate={-30}
          gradient="from-purple-400/[0.25]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <ElegantShape
          width={300}
          height={80}
          mobileWidth={90}
          mobileHeight={24}
          rotate={15}
          gradient="from-blue-500/[0.20]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
        <ElegantShape
          width={200}
          height={60}
          mobileWidth={60}
          mobileHeight={18}
          rotate={-45}
          gradient="from-purple-500/[0.20]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />
        <ElegantShape
          width={150}
          height={40}
          mobileWidth={45}
          mobileHeight={12}
          rotate={60}
          gradient="from-blue-300/[0.18]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
        <ElegantShape
          width={400}
          height={100}
          mobileWidth={120}
          mobileHeight={30}
          rotate={-15}
          gradient="from-purple-300/[0.18]"
          className="left-[60%] md:left-[65%] top-[40%] md:top-[45%]"
        />
        <ElegantShape
          width={250}
          height={70}
          mobileWidth={75}
          mobileHeight={21}
          rotate={30}
          gradient="from-blue-400/[0.15]"
          className="right-[40%] md:right-[45%] bottom-[20%] md:bottom-[25%]"
        />
        <ElegantShape
          width={180}
          height={50}
          mobileWidth={54}
          mobileHeight={15}
          rotate={-60}
          gradient="from-purple-400/[0.15]"
          className="left-[40%] md:left-[45%] top-[25%] md:top-[30%]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3 py-2 md:px-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-8 md:mb-16"
          >
            <img src="/kaspa-logo.webp" alt="Kaspa" className="w-5 h-5 md:w-6 md:h-6 rounded-full" />
            <span className="text-xs md:text-sm text-muted-foreground tracking-wide">4th Birthday Celebration</span>
          </motion.div>

          <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-6 md:mb-12 tracking-tight leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80">
                Kaspa's
              </span>
              <br />
              <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600",
                  spaceGrotesk.className,
                )}
              >
                4th Birthday
              </span>
            </h1>
          </motion.div>

          <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-8 md:mb-12 leading-relaxed font-light tracking-wide max-w-2xl mx-auto px-2 md:px-4">
              Join us for a weekend of blockDAG innovation, parallel block processing, and GHOSTDAG protocol celebration
              in the heart of Central New York.
            </p>
          </motion.div>

          <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-12 md:mb-16 text-sm md:text-base">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                <span>November 7-9, 2025</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                <span>Liverpool, NY</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                <span>150 guests/day</span>
              </div>
            </div>
          </motion.div>

          <motion.div custom={4} variants={fadeUpVariants} initial="hidden" animate="visible">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
              <Button
                size="lg"
                onClick={scrollToTickets}
                className={cn(
                  "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 w-full sm:w-auto",
                  spaceGrotesk.className,
                )}
              >
                Get Tickets
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToEventDetails}
                className={cn(
                  "border-blue-500/20 hover:bg-blue-500/10 bg-transparent w-full sm:w-auto",
                  spaceGrotesk.className,
                )}
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none" />
    </section>
  )
}
