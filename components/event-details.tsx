"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  MapPin,
  Users,
  Car,
  Accessibility,
  Ticket,
  Code,
  Zap,
  MessageSquare,
  ShoppingBag,
  Gift,
  Utensils,
} from "lucide-react"
import { ElegantShape } from "@/components/ui/elegant-shape"
import { Space_Grotesk } from "next/font/google"
import { cn } from "@/lib/utils"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
}

export function EventDetails() {
  const scrollToTickets = () => {
    const element = document.querySelector("#tickets")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      id="event-details"
      className="py-20 px-4 md:px-6 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden"
    >
      {/* Add geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={500}
          mobileWidth={150}
          height={120}
          rotate={12}
          gradient="from-blue-500/[0.12]"
          className="left-[-5%] top-[20%]"
        />
        <ElegantShape
          delay={0.5}
          width={400}
          mobileWidth={120}
          height={100}
          rotate={-15}
          gradient="from-purple-500/[0.12]"
          className="right-[0%] top-[70%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          mobileWidth={90}
          height={80}
          rotate={-8}
          gradient="from-blue-400/[0.10]"
          className="left-[10%] bottom-[10%]"
        />
        <ElegantShape
          delay={0.6}
          width={250}
          mobileWidth={75}
          height={70}
          rotate={20}
          gradient="from-purple-400/[0.10]"
          className="right-[20%] top-[15%]"
        />
      </div>

      <div className="absolute inset-0 bg-slate-900/10 md:bg-transparent" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 font-space-grotesk"
          >
            Event Essentials
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about celebrating Kaspa's revolutionary blockDAG architecture
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-16"
        >
          <motion.div variants={itemVariants}>
            <Card className="h-full border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-blue-500" />
                  <CardTitle className="font-space-grotesk">Dates & Venue</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-blue-500/20 text-xs md:text-sm">
                    November 7-9, 2025
                  </Badge>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="text-sm md:text-base">
                    <p className="font-medium">Kaspa Community Center</p>
                    <p className="text-muted-foreground">4225 Long Branch Rd, Liverpool, NY 13088</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="h-full border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-purple-500" />
                  <CardTitle className="font-space-grotesk">Capacity & Access</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-purple-500/20 text-xs md:text-sm">
                    150 guests/day
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <Car className="h-4 w-4 text-blue-500" />
                  <span>Free parking</span>
                </div>
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <Accessibility className="h-4 w-4 text-purple-500" />
                  <span>ADA accessible</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="h-full border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Ticket className="h-6 w-6 text-blue-500" />
                  <CardTitle className="font-space-grotesk">Pass Options</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3">
                <div className="text-sm md:text-base space-y-1">
                  <p>
                    <span className="font-medium">1-Day Pass:</span> Single day + 5 raffle entries
                  </p>
                  <p>
                    <span className="font-medium">2-Day Pass:</span> Weekend combo + 12 raffle entries
                  </p>
                  <p>
                    <span className="font-medium">3-Day Pass:</span> Full experience + 20 raffle entries
                  </p>
                  <p>
                    <span className="font-medium">VIP Pass:</span> Premium access + bonus entries
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12"
        >
          <motion.div variants={itemVariants}>
            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code className="h-6 w-6 text-blue-500" />
                  <div>
                    <CardTitle className="font-space-grotesk">Tech & Innovation</CardTitle>
                    <CardDescription>Hands-on blockchain experiences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Code className="h-4 w-4 md:h-5 md:w-5" />
                      Hackathon
                    </h4>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Build dApps on Kaspa's GHOSTDAG protocol with parallel block processing
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4 md:h-5 md:w-5" />
                      Live Mining Zone
                    </h4>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Experience high-throughput DAG mining with interactive demonstrations
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                      Project & Community Leaders
                    </h4>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Kaspa roadmap discussions with project leaders
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-6 w-6 text-purple-500" />
                  <div>
                    <CardTitle className="font-space-grotesk">Marketplace & Vendors</CardTitle>
                    <CardDescription>Local artisans and crypto merchandise</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Local Artisans</h4>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Handcrafted goods from Central NY creators
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Crypto Merch</h4>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Exclusive Kaspa apparel, jewelry, and hardware wallets
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Syracuse Cuisine</h4>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Local food vendors with regional specialties
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gift className="h-6 w-6 text-blue-500" />
                  <div>
                    <CardTitle className="font-space-grotesk">Daily Raffle & Prizes</CardTitle>
                    <CardDescription>Win mining hardware every day!</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold font-space-grotesk">Daily Raffle</h4>
                    <ul className="text-sm md:text-base text-muted-foreground space-y-1">
                      <li>• 3 ASIC miners daily</li>
                      <li>• $KAS token bundles</li>
                      <li>• VIP upgrade chances</li>
                      <li>• Hardware wallet prizes</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold font-space-grotesk">Community Prize Wall</h4>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Donated items from local businesses and community partners
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Utensils className="h-6 w-6 text-purple-500" />
                  <div>
                    <CardTitle className="font-space-grotesk">Food & Refreshments</CardTitle>
                    <CardDescription>Complimentary dining throughout the event</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Open Buffet</h4>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Full meals provided throughout the weekend
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Food Trucks & Drinks</h4>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Local food trucks with complimentary beverages all 3 days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20">
            <h3 className="text-2xl font-bold mb-4">Why Attend?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm md:text-base">
              <p>• Network with Kaspa developers & crypto miners</p>
              <p>• Experience hands-on blockDAG and parallel processing technology</p>
              <p>• Explore stunning Central NY waterfalls</p>
              <p>• Enjoy authentic Syracuse cuisine</p>
              <p>• Win valuable crypto prizes</p>
              <p>• Support community center preservation</p>
            </div>
            <div className="mt-6">
              <Button
                size="lg"
                onClick={scrollToTickets}
                className={cn(
                  "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white",
                  spaceGrotesk.className,
                )}
              >
                Get Your Tickets Now
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
