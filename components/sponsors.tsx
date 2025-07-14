"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Award, Heart, Mail, ExternalLink, Building, Handshake, Star } from "lucide-react"
import { ElegantShape } from "@/components/ui/elegant-shape"
import { Space_Grotesk } from "next/font/google"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })

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

const sponsorTiers = [
  {
    name: "Platinum Sponsors",
    icon: <Crown className="h-8 w-8" />,
    color: "from-blue-400 to-blue-600",
    bgColor: "from-blue-500/5 to-transparent border-blue-500/20",
    description: "Premier partnership with maximum visibility and exclusive benefits",
    benefits: [
      "Logo on all event materials",
      "Dedicated booth space",
      "Speaking opportunity",
      "VIP networking access",
      "Social media promotion",
      "Post-event report",
    ],
    investment: "Contact for custom package",
  },
  {
    name: "Gold Sponsors",
    icon: <Award className="h-8 w-8" />,
    color: "from-purple-400 to-purple-600",
    bgColor: "from-purple-500/5 to-transparent border-purple-500/20",
    description: "Significant brand exposure with valuable networking opportunities",
    benefits: [
      "Logo on event signage",
      "Booth space available",
      "Newsletter mention",
      "Social media features",
      "Networking sessions",
      "Event photography",
    ],
    investment: "Starting at $5,000",
  },
  {
    name: "Community Partners",
    icon: <Heart className="h-8 w-8" />,
    color: "from-blue-400 to-purple-600",
    bgColor: "from-blue-500/5 to-purple-500/5 border-blue-500/20",
    description: "Local businesses and organizations supporting our community",
    benefits: [
      "Website listing",
      "Event program mention",
      "Community recognition",
      "Networking opportunities",
      "Local partnership",
      "Future collaboration",
    ],
    investment: "Starting at $1,000",
  },
]

const currentSponsors = [
  {
    name: "Kaspa Community Center",
    tier: "Venue Partner",
    description:
      "Providing our beautiful event space and serving as the heart of our local blockchain community, fostering innovation and collaboration",
    logo: "/kaspafunding-logo.webp",
    website: "https://kasmixer.com/",
  },
  {
    name: "KaspaFunding",
    tier: "Title Sponsor",
    description:
      "Supporting Kaspa community development through funding initiatives, educational programs, and organizing events that bring the ecosystem together",
    logo: "/kaspafunding-logo.webp",
    website: "https://kasmixer.com/",
  },
  {
    name: "Proof Of Works",
    tier: "Technology Partner",
    description: "The First Fully On-Chain Trustless Hiring, Payroll, and Reputation platform",
    logo: "/powmobile.png",
    website: "https://www.proofofworks.com/",
  },
  {
    name: "KASPER (Kasper Coin)",
    tier: "KRC20 Partner",
    description: "The first KRC20 Community, building incredible applications like POW",
    logo: "/kasper-logo.webp",
    website: "https://www.kaspercoin.net/",
  },
]

export function Sponsors() {
  return (
    <section
      id="sponsors"
      className="py-20 px-4 md:px-6 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden"
    >
      {/* Add geometric shapes - exact copy from hero */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/5 md:hidden" />
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
            Our Sponsors
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Supporting innovation and community growth in the blockchain space
          </motion.p>
        </motion.div>

        {/* Current Sponsors */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16"
        >
          <motion.h3 variants={itemVariants} className="text-2xl font-bold text-center mb-8">
            Thank You to Our Current Sponsors
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentSponsors.map((sponsor, index) => (
              <motion.div key={sponsor.name} variants={itemVariants}>
                <Card className="text-center border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-4 md:pt-6">
                    <div className="mb-4">
                      <img
                        src={sponsor.logo || "/placeholder.svg"}
                        alt={sponsor.name}
                        className="h-12 md:h-16 w-auto mx-auto mb-3"
                      />
                      <Badge variant="outline" className="mb-2 border-blue-500/20">
                        {sponsor.tier}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-lg mb-2">{sponsor.name}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{sponsor.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className={`border-blue-500/20 bg-transparent ${spaceGrotesk.className}`}
                    >
                      <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sponsorship Tiers */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-8"
        >
          <motion.h3 variants={itemVariants} className="text-2xl font-bold text-center mb-8">
            Sponsorship Opportunities
          </motion.h3>

          {sponsorTiers.map((tier, index) => (
            <motion.div key={tier.name} variants={itemVariants}>
              <Card className={`bg-gradient-to-br ${tier.bgColor}`}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${tier.color} text-white`}>{tier.icon}</div>
                    <div>
                      <CardTitle className="text-2xl">{tier.name}</CardTitle>
                      <CardDescription className="text-lg">{tier.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="gap-4 md:gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <h4 className="font-semibold mb-3">Benefits Include:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {tier.benefits.map((benefit, benefitIndex) => (
                          <div key={benefitIndex} className="flex items-center gap-2 text-sm md:text-base">
                            <Star className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Investment</h4>
                        <p className="text-lg font-bold text-primary">{tier.investment}</p>
                      </div>
                      <Button className={`w-full ${spaceGrotesk.className}`} size="lg" asChild>
                        <a href="mailto:tickets@kaspaevents.xyz">
                          <Mail className="h-4 w-4 mr-2" />
                          Become a Sponsor
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16"
        >
          <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
            <CardContent className="pt-8 text-center">
              <Building className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <h3 className="text-2xl font-bold mb-4">Partner With Us</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join us in supporting the Kaspa community and blockchain innovation. Your sponsorship helps us create an
                amazing experience while supporting the preservation of our community center.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className={`bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white ${spaceGrotesk.className}`}
                  asChild
                >
                  <a href="mailto:tickets@kaspaevents.xyz">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Sponsor Team
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`border-blue-500/20 bg-transparent ${spaceGrotesk.className}`}
                  asChild
                >
                  <a href="mailto:tickets@kaspaevents.xyz">
                    <Handshake className="h-4 w-4 mr-2" />
                    Download Sponsor Kit
                  </a>
                </Button>
              </div>
              <div className="mt-6 text-sm text-muted-foreground">
                <p>25% of event proceeds support KaspaFunding community initiatives</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
