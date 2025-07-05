"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Code, Zap, Gift, Users, Lock } from "lucide-react"
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

const schedule = [
  {
    day: "Friday",
    date: "Opening Day",
    color: "blue",
    events: [
      {
        time: "TBA",
        title: "To Be Announced",
        description: "Exciting events and activities are being planned",
        icon: <Lock className="h-4 w-4" />,
        type: "announcement",
      },
    ],
  },
  {
    day: "Saturday",
    date: "Main Event",
    color: "purple",
    events: [
      {
        time: "TBA",
        title: "To Be Announced",
        description: "Amazing experiences await - stay tuned for details",
        icon: <Lock className="h-4 w-4" />,
        type: "announcement",
      },
    ],
  },
  {
    day: "Sunday",
    date: "Celebration Finale",
    color: "pink",
    events: [
      {
        time: "TBA",
        title: "To Be Announced",
        description: "Grand finale activities coming soon",
        icon: <Lock className="h-4 w-4" />,
        type: "announcement",
      },
    ],
  },
]

const getEventTypeColor = (type: string) => {
  switch (type) {
    case "tech":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    case "food":
      return "bg-green-500/10 text-green-500 border-green-500/20"
    case "prize":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    case "ceremony":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20"
    case "vendor":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20"
    case "social":
      return "bg-pink-500/10 text-pink-500 border-pink-500/20"
    case "academic":
      return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
    case "community":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    case "announcement":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20"
  }
}

const getDayColor = (color: string) => {
  switch (color) {
    case "blue":
      return "from-blue-500/5 to-transparent border-blue-500/20"
    case "purple":
      return "from-purple-500/5 to-transparent border-purple-500/20"
    case "pink":
      return "from-pink-500/5 to-transparent border-pink-500/20"
    default:
      return "from-gray-500/5 to-transparent border-gray-500/20"
  }
}

export function Itinerary() {
  return (
    <section
      id="itinerary"
      className="py-20 px-4 md:px-6 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden"
    >
      {/* Add geometric shapes with varied rotations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/10 md:bg-transparent" />
        <ElegantShape
          width={600}
          height={140}
          mobileWidth={180}
          mobileHeight={42}
          rotate={45}
          gradient="from-blue-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />
        <ElegantShape
          width={500}
          height={120}
          mobileWidth={150}
          mobileHeight={36}
          rotate={-30}
          gradient="from-purple-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <ElegantShape
          width={300}
          height={80}
          mobileWidth={90}
          mobileHeight={24}
          rotate={15}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
        <ElegantShape
          width={200}
          height={60}
          mobileWidth={60}
          mobileHeight={18}
          rotate={-45}
          gradient="from-cyan-500/[0.15]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />
        <ElegantShape
          width={150}
          height={40}
          mobileWidth={45}
          mobileHeight={12}
          rotate={60}
          gradient="from-pink-500/[0.15]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
        <ElegantShape
          width={400}
          height={100}
          mobileWidth={120}
          mobileHeight={30}
          rotate={-15}
          gradient="from-blue-500/[0.12]"
          className="left-[60%] md:left-[65%] top-[40%] md:top-[45%]"
        />
        <ElegantShape
          width={250}
          height={70}
          mobileWidth={75}
          mobileHeight={21}
          rotate={30}
          gradient="from-purple-500/[0.12]"
          className="right-[40%] md:right-[45%] bottom-[20%] md:bottom-[25%]"
        />
        <ElegantShape
          width={180}
          height={50}
          mobileWidth={54}
          mobileHeight={15}
          rotate={-60}
          gradient="from-blue-400/[0.10]"
          className="left-[40%] md:left-[45%] top-[25%] md:top-[30%]"
        />
        <ElegantShape
          width={320}
          height={90}
          mobileWidth={96}
          mobileHeight={27}
          rotate={20}
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
            Event Schedule
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three days packed with innovation, learning, and community celebration
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12"
        >
          {schedule.map((day, dayIndex) => (
            <motion.div key={day.day} variants={itemVariants}>
              <Card className={`bg-gradient-to-br ${getDayColor(day.color)}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Calendar className={`h-6 w-6 text-${day.color}-500`} />
                    <div>
                      <CardTitle className="text-xl md:text-2xl font-space-grotesk">{day.day}</CardTitle>
                      <CardDescription className="text-lg">{day.date}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                    {day.events.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className="flex flex-col sm:flex-row gap-4 p-3 md:p-4 rounded-lg bg-background/50 border border-border/50"
                      >
                        <div className="flex-shrink-0">
                          <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-muted-foreground mb-2">
                            <Clock className="h-4 w-4" />
                            {event.time}
                          </div>
                          <div className="text-muted-foreground">{event.icon}</div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold">{event.title}</h4>
                            <Badge variant="outline" className={`text-xs md:text-sm ${getEventTypeColor(event.type)}`}>
                              {event.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16"
        >
          <Card className="border-gradient-to-r from-blue-500/20 to-purple-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
            <CardHeader>
              <CardTitle className="text-xl text-center font-space-grotesk">Event Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div className="space-y-2">
                  <Code className="h-8 w-8 mx-auto text-blue-500" />
                  <h4 className="font-semibold">Hackathon</h4>
                  <p className="text-sm text-muted-foreground">Build on Kaspa's DAG</p>
                </div>
                <div className="space-y-2">
                  <Zap className="h-8 w-8 mx-auto text-yellow-500" />
                  <h4 className="font-semibold">Mining Zone</h4>
                  <p className="text-sm text-muted-foreground">Interactive demos</p>
                </div>
                <div className="space-y-2">
                  <Users className="h-8 w-8 mx-auto text-green-500" />
                  <h4 className="font-semibold">Networking</h4>
                  <p className="text-sm text-muted-foreground">Community building</p>
                </div>
                <div className="space-y-2">
                  <Gift className="h-8 w-8 mx-auto text-purple-500" />
                  <h4 className="font-semibold">Prizes</h4>
                  <p className="text-sm text-muted-foreground">Daily giveaways</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
