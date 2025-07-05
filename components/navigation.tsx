"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, MapPin, Award, Building2, Home, Menu, X, Ticket } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

interface MenuItem {
  icon: React.ReactNode
  label: string
  href: string
  iconColor: string
}

const menuItems: MenuItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: "Home",
    href: "#home",
    iconColor: "text-blue-500",
  },
  {
    icon: <Ticket className="h-5 w-5" />,
    label: "Tickets",
    href: "#tickets",
    iconColor: "text-purple-500",
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    label: "Itinerary",
    href: "#itinerary",
    iconColor: "text-blue-500",
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    label: "Stay",
    href: "#accommodations",
    iconColor: "text-purple-500",
  },
  {
    icon: <Award className="h-5 w-5" />,
    label: "Sponsors",
    href: "#sponsors",
    iconColor: "text-blue-500",
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    label: "Host",
    href: "#hosted-by",
    iconColor: "text-purple-500",
  },
]

export function Navigation() {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
      <motion.nav
        className="p-2 rounded-2xl bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-lg border border-border/40 shadow-lg relative overflow-hidden"
        initial="initial"
        whileHover="hover"
      >
        <motion.div
          className={`absolute -inset-2 bg-gradient-radial from-transparent ${
            isDarkTheme
              ? "via-blue-400/20 via-50% via-purple-400/20 via-100%"
              : "via-blue-400/15 via-50% via-purple-400/15 via-100%"
          } to-transparent rounded-3xl z-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500`}
        />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <img src="/kaspa-logo.webp" alt="Kaspa" className="w-8 h-8 rounded-full" />
            <span className="font-space-grotesk font-bold text-lg">4th Birthday</span>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => scrollToSection(item.href)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors font-space-grotesk hover:bg-blue-500/10"
                >
                  <span className={`transition-colors duration-300 ${item.iconColor}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 border-t border-border/40 pt-2"
            >
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => scrollToSection(item.href)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground transition-colors font-space-grotesk hover:bg-blue-500/10 text-left"
                    >
                      <span className={`transition-colors duration-300 ${item.iconColor}`}>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  )
}
