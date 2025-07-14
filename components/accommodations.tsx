"use client"

import React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Star,
  MapPin,
  Car,
  ExternalLink,
  GlassWaterIcon as Waterfall,
  Building,
  TreePine,
  Camera,
  Mail,
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

const premiumHotels = [
  {
    name: "Crowne Plaza Syracuse",
    distance: "9.1 miles",
    rating: 4.5,
    amenities: ["Pool", "Fitness Center", "Restaurant", "Business Center"],
    description: "Upscale hotel with modern amenities and excellent service",
    bookingUrl: "https://www.ihg.com/crowneplaza/hotels/us/en/syracuse/syrcp/hoteldetail/rooms",
  },
  {
    name: "Marriott Syracuse Downtown",
    distance: "10.2 miles",
    rating: 4.4,
    amenities: ["Restaurant", "Fitness Center", "Meeting Rooms", "Parking"],
    description: "Downtown location with easy access to Syracuse attractions",
    bookingUrl: "https://www.marriott.com/en-us/hotels/syrmc-marriott-syracuse-downtown/overview/",
  },
  {
    name: "Turning Stone Resort",
    distance: "35 miles",
    rating: 4.6,
    amenities: ["Casino", "Spa", "Golf", "Multiple Restaurants", "Shuttle Available"],
    description: "Full-service resort with casino and entertainment",
    bookingUrl: "https://www.turningstone.com/",
  },
]

const budgetOptions = [
  {
    name: "Inn at the Fairgrounds",
    distance: "0.8 miles",
    rating: 3.8,
    amenities: ["Free WiFi", "Parking", "Pet Friendly"],
    description: "Convenient location, walking distance to venue",
    bookingUrl:
      "https://www.bestwestern.com/en_US/book/hotels-in-syracuse/best-western-the-inn-at-the-fairgrounds/propertyCode.33154.html",
  },
  {
    name: "Microtel Inn",
    distance: "1.5 miles",
    rating: 4.0,
    amenities: ["Continental Breakfast", "Free WiFi", "Fitness Center"],
    description: "Clean, comfortable rooms with modern amenities",
    bookingUrl:
      "https://www.wyndhamhotels.com/en-ca/microtel/baldwinsville-new-york/microtel-inn-and-suites-syracuse-baldwinsville/overview",
  },
  {
    name: "Residence Inn",
    distance: "3 miles",
    rating: 4.2,
    amenities: ["Kitchenette", "Pool", "Free Breakfast", "Pet Friendly"],
    description: "Extended stay suites perfect for longer visits",
    bookingUrl:
      "https://www.marriott.com/en-us/hotels/syrdr-residence-inn-syracuse-downtown-at-armory-square/overview/",
  },
]

const attractions = [
  {
    name: "Pratt's Falls",
    distance: "15 miles",
    description: "137-foot cascade with hiking trails",
    icon: <Waterfall className="h-5 w-5" />,
  },
  {
    name: "Chittenango Falls",
    distance: "20 miles",
    description: "167-foot gorge waterfall",
    icon: <Waterfall className="h-5 w-5" />,
  },
  {
    name: "Tinker Falls",
    distance: "35 miles",
    description: "Unique 'hanging waterfall' experience",
    icon: <TreePine className="h-5 w-5" />,
  },
  {
    name: "Buttermilk Falls",
    distance: "40 miles",
    description: "Natural pools & stone stairways",
    icon: <Camera className="h-5 w-5" />,
  },
  {
    name: "Onondaga Lake Park",
    distance: "2 miles",
    description: "Waterfront trails & kayaking",
    icon: <TreePine className="h-5 w-5" />,
  },
  {
    name: "Destiny USA",
    distance: "7 miles",
    description: "America's 6th-largest mall",
    icon: <Building className="h-5 w-5" />,
  },
]

export function Accommodations() {
  return (
    <section
      id="accommodations"
      className="py-20 px-4 md:px-6 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden"
    >
      {/* Add geometric shapes - exact copy from hero */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          mobileWidth={180}
          mobileHeight={42}
          rotate={12}
          gradient="from-blue-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          mobileWidth={150}
          mobileHeight={36}
          rotate={-15}
          gradient="from-purple-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          mobileWidth={90}
          mobileHeight={24}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          mobileWidth={60}
          mobileHeight={18}
          rotate={20}
          gradient="from-cyan-500/[0.15]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />
        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          mobileWidth={45}
          mobileHeight={12}
          rotate={-25}
          gradient="from-pink-500/[0.15]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
        <ElegantShape
          delay={0.8}
          width={400}
          height={100}
          mobileWidth={120}
          mobileHeight={30}
          rotate={45}
          gradient="from-blue-500/[0.12]"
          className="left-[60%] md:left-[65%] top-[40%] md:top-[45%]"
        />
        <ElegantShape
          delay={0.9}
          width={250}
          height={70}
          mobileWidth={75}
          mobileHeight={21}
          rotate={-30}
          gradient="from-purple-500/[0.12]"
          className="right-[40%] md:right-[45%] bottom-[20%] md:bottom-[25%]"
        />
        <ElegantShape
          delay={1.0}
          width={180}
          height={50}
          mobileWidth={54}
          mobileHeight={15}
          rotate={15}
          gradient="from-blue-400/[0.10]"
          className="left-[40%] md:left-[45%] top-[25%] md:top-[30%]"
        />
        <ElegantShape
          delay={1.1}
          width={320}
          height={90}
          mobileWidth={96}
          mobileHeight={27}
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
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 font-space-grotesk"
          >
            Stay & Explore
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comfortable accommodations and amazing attractions in Central New York
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12"
        >
          {/* Premium Hotels */}
          <motion.div variants={itemVariants}>
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2 font-space-grotesk">
                <Star className="h-6 w-6 text-yellow-500" />
                Premium Hotels
              </h3>
              <p className="text-muted-foreground">Luxury accommodations with full amenities</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumHotels.map((hotel, index) => (
                <Card key={hotel.name} className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{hotel.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          {hotel.distance}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-medium">{hotel.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{hotel.description}</p>
                    <div className="flex flex-wrap gap-1 md:gap-2 mb-4">
                      {hotel.amenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("w-full bg-transparent", spaceGrotesk.className)}
                      asChild
                    >
                      <a href={hotel.bookingUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Book Now
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Budget Options */}
          <motion.div variants={itemVariants}>
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2 font-space-grotesk">
                <Car className="h-6 w-6 text-green-500" />
                Budget Options
              </h3>
              <p className="text-muted-foreground">Affordable stays within 3 miles of the venue</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgetOptions.map((hotel, index) => (
                <Card key={hotel.name} className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{hotel.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          {hotel.distance}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-medium">{hotel.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{hotel.description}</p>
                    <div className="flex flex-wrap gap-1 md:gap-2 mb-4">
                      {hotel.amenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("w-full bg-transparent", spaceGrotesk.className)}
                      asChild
                    >
                      <a href={hotel.bookingUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Book Now
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Local Attractions */}
          <motion.div variants={itemVariants}>
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2 font-space-grotesk">
                <Camera className="h-6 w-6 text-purple-500" />
                Local Attractions
              </h3>
              <p className="text-muted-foreground">Explore the natural beauty and culture of Central New York</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attractions.map((attraction, index) => (
                <Card
                  key={attraction.name}
                  className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="text-purple-500 mt-1">
                        {React.cloneElement(attraction.icon, { className: "h-4 w-4 md:h-5 md:w-5" })}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{attraction.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{attraction.description}</p>
                        <Badge variant="outline" className="text-xs">
                          {attraction.distance}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* College Welcome */}
          <motion.div variants={itemVariants}>
            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building className="h-6 w-6 text-blue-500" />
                  Welcome College Students & Academics
                </CardTitle>
                <CardDescription>Special invitation to students and faculty from nearby universities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Nearby Universities</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Syracuse University</li>
                      <li>• Cornell University</li>
                      <li>• University at Buffalo (UB)</li>
                      <li>• SUNY Oswego</li>
                      <li>• Le Moyne College</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Academic Opportunities</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Blockchain technology workshops</li>
                      <li>• Networking with industry professionals</li>
                      <li>• Research collaboration opportunities</li>
                      <li>• Campus visit coordination</li>
                      <li>• Student-friendly pricing available</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    className={cn(
                      "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white",
                      spaceGrotesk.className,
                    )}
                    asChild
                  >
                    <a href="mailto:tickets@kaspaevents.xyz?subject=Student Registration Inquiry">
                      <Mail className="h-4 w-4 mr-2" />
                      Student Registration
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
