"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Mail, Calendar, Globe, Heart, ExternalLink } from "lucide-react"
import { ElegantShape } from "@/components/elegant_shape"

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

export function Footer() {
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
    <footer className="py-20 px-4 md:px-6 bg-gradient-to-b from-muted/20 to-background border-t border-border/50 relative overflow-hidden">
      {/* Add geometric shapes - exact copy from hero */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm md:hidden"></div>
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          mobileWidth={210}
          mobileHeight={49}
          rotate={12}
          gradient="from-blue-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          mobileWidth={175}
          mobileHeight={42}
          rotate={-15}
          gradient="from-purple-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          mobileWidth={105}
          mobileHeight={28}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          mobileWidth={70}
          mobileHeight={21}
          rotate={20}
          gradient="from-cyan-500/[0.15]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />
        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          mobileWidth={52.5}
          mobileHeight={14}
          rotate={-25}
          gradient="from-pink-500/[0.15]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
        <ElegantShape
          delay={0.8}
          width={400}
          height={100}
          mobileWidth={140}
          mobileHeight={35}
          rotate={45}
          gradient="from-blue-500/[0.12]"
          className="left-[60%] md:left-[65%] top-[40%] md:top-[45%]"
        />
        <ElegantShape
          delay={0.9}
          width={250}
          height={70}
          mobileWidth={87.5}
          mobileHeight={24.5}
          rotate={-30}
          gradient="from-purple-500/[0.12]"
          className="right-[40%] md:right-[45%] bottom-[20%] md:bottom-[25%]"
        />
        <ElegantShape
          delay={1.0}
          width={180}
          height={50}
          mobileWidth={63}
          mobileHeight={17.5}
          rotate={15}
          gradient="from-blue-400/[0.10]"
          className="left-[40%] md:left-[45%] top-[25%] md:top-[30%]"
        />
        <ElegantShape
          delay={1.1}
          width={320}
          height={90}
          mobileWidth={112}
          mobileHeight={31.5}
          rotate={-40}
          gradient="from-purple-400/[0.10]"
          className="right-[25%] md:right-[30%] top-[60%] md:top-[65%]"
        />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Main Footer Content */}
          <motion.div variants={itemVariants} className="mb-12">
            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                  {/* Event Info */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 font-space-grotesk">
                      <img src="/kaspa-logo.webp" alt="Kaspa" className="w-6 h-6 rounded-full" />
                      Kaspa's 4th Birthday
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>November 7-9, 2025</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div>
                          <p>Kaspa Community Center</p>
                          <p>4225 Long Branch Rd</p>
                          <p>Liverpool, NY 13088</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="space-y-4">
                    <h4 className="font-semibold font-space-grotesk">Quick Links</h4>
                    <div className="space-y-2 text-sm">
                      <a href="#home" className="block text-muted-foreground hover:text-foreground transition-colors">
                        Home
                      </a>
                      <a
                        href="#tickets"
                        className="block text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Tickets
                      </a>
                      <a
                        href="#itinerary"
                        className="block text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Schedule
                      </a>
                      <a
                        href="#accommodations"
                        className="block text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Accommodations
                      </a>
                      <a
                        href="#sponsors"
                        className="block text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Sponsors
                      </a>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-4">
                    <h4 className="font-semibold font-space-grotesk">Contact</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <a href="mailto:tickets@kaspaevents.xyz" className="hover:text-foreground transition-colors">
                          tickets@kaspaevents.xyz
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <a href="#" className="hover:text-foreground transition-colors">
                          Event Website
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Social & Community */}
                  <div className="space-y-4">
                    <h4 className="font-semibold font-space-grotesk">Follow Us</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start bg-transparent font-space-grotesk"
                        asChild
                      >
                        <a href="https://x.com/kaspercoin" target="_blank" rel="noopener noreferrer">
                          <img src="/kasper-logo.webp" alt="KASPER" className="h-4 w-4 mr-2 rounded-full" />
                          KASPER Community
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start bg-transparent font-space-grotesk"
                        asChild
                      >
                        <a href="https://x.com/FundingKaspa" target="_blank" rel="noopener noreferrer">
                          <img src="/kaspafunding-logo.webp" alt="KaspaFunding" className="h-4 w-4 mr-2 rounded-full" />
                          KaspaFunding
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Call to Action */}
          <motion.div variants={itemVariants} className="mb-12">
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
              <div className="p-8 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <h3 className="text-2xl font-bold mb-4">Ready to Join Us?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Don't miss out on Kaspa's biggest celebration of the year. Get your tickets now and be part of the
                  future of blockchain technology.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={scrollToTickets}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-space-grotesk text-sm md:text-base"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Get Tickets
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={scrollToEventDetails}
                    className="font-space-grotesk bg-transparent text-sm md:text-base"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Bottom Footer */}
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for the Kaspa community</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Kaspa: BlockDAG. Parallel Blocks. Instant Finality.</p>
              <p className="mt-2">© 2025 Kaspa Community. Building a decentralized future - powered by community!</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  )
}
