"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, Heart, Users, Globe } from "lucide-react"
import { ElegantShape } from "@/components/ui/elegant-shape"

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

const organizers = [
  {
    name: "Kaspa Community Center",
    role: "Venue Host",
    description: "Our beautiful community center providing the perfect space for innovation and connection",
    image: "/kaspafunding-logo.webp",
    details: [
      "4225 Long Branch Rd, Liverpool, NY 13088",
      "Fully ADA accessible facility",
      "150 person capacity per day",
      "Free on-site parking",
    ],
    contact: {
      website: "https://kasmixer.com/",
      twitter: "https://x.com/FundingKaspa",
    },
  },
  {
    name: "KaspaFunding",
    role: "Community Organizer",
    description: "Dedicated to supporting and growing the Kaspa ecosystem through community initiatives",
    image: "/kaspafunding-logo.webp",
    details: [
      "Community-driven funding platform",
      "Supporting Kaspa development",
      "Organizing global events",
      "Building decentralized future",
    ],
    contact: {
      website: "https://kasmixer.com/",
      twitter: "https://x.com/FundingKaspa",
    },
  },
  {
    name: "KASPER (Kasper Coin)",
    role: "KRC20 Community Partner",
    description: "The first KRC20 Community, building incredible applications like POW (Proof Of Works)",
    image: "/kasper-logo.webp",
    details: [
      "First KRC20 token community",
      "Building Proof Of Works platform",
      "Trustless hiring and payroll",
      "On-chain reputation system",
    ],
    contact: {
      website: "https://www.kaspercoin.net/",
      twitter: "https://x.com/kaspercoin",
    },
  },
]

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

export function HostedBy() {
  return (
    <section
      id="hosted-by"
      className="py-20 px-4 md:px-6 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden"
    >
      {/* Add geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={500}
          height={120}
          rotate={12}
          gradient="from-blue-500/[0.12]"
          className="left-[-5%] top-[20%]"
          mobileWidth={150}
          mobileHeight={36}
        />
        <ElegantShape
          delay={0.5}
          width={400}
          height={100}
          rotate={-15}
          gradient="from-purple-500/[0.12]"
          className="right-[0%] top-[70%]"
          mobileWidth={120}
          mobileHeight={30}
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-blue-400/[0.10]"
          className="left-[10%] bottom-[10%]"
          mobileWidth={90}
          mobileHeight={24}
        />
        <ElegantShape
          delay={0.6}
          width={250}
          height={70}
          rotate={20}
          gradient="from-purple-400/[0.10]"
          className="right-[20%] top-[15%]"
          mobileWidth={75}
          mobileHeight={21}
        />
      </div>

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
            Hosted By
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet the organizations making this celebration possible
          </motion.p>
        </motion.div>

        {/* Main Organizers */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
        >
          {organizers.map((org, index) => (
            <motion.div key={org.name} variants={itemVariants}>
              <Card className="h-full border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                <CardHeader>
                  <div className="flex items-start gap-3 md:gap-4">
                    <img
                      src={org.image || "/placeholder.svg"}
                      alt={org.name}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-xl">{org.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 border-blue-500/20">
                        {org.role}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{org.description}</p>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Key Details:</h4>
                    <ul className="space-y-1">
                      {org.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Connect:</h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-blue-500/20 bg-transparent font-space-grotesk"
                      >
                        <a href={org.contact.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Visit Website
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-blue-500/20 bg-transparent font-space-grotesk"
                      >
                        <a href={org.contact.twitter} target="_blank" rel="noopener noreferrer">
                          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                          Visit X
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Card className="border-gradient-to-r from-blue-500/20 to-purple-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
            <CardContent className="pt-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground mb-6 max-w-3xl mx-auto text-lg leading-relaxed">
                We believe in the power of community to drive innovation and create positive change. This celebration
                brings together blockchain enthusiasts, developers, academics, and local community members to build
                connections, share knowledge, and support the future of decentralized technology while preserving our
                community spaces.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={scrollToTickets}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-space-grotesk"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Join Our Community
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={scrollToEventDetails}
                  className="border-blue-500/20 bg-transparent font-space-grotesk"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Support the Center
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
