"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Space_Grotesk } from "next/font/google"
import { cn } from "@/lib/utils"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-grotesk",
})

interface LoadingScreenProps {
  isLoading: boolean
}

export function LoadingScreen({ isLoading }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            x: "-100%",
            transition: {
              duration: 0.8,
              ease: [0.32, 0, 0.67, 0],
            },
          }}
          className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center overflow-hidden"
        >
          {/* Animated Background Particles */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                initial={{
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  opacity: 0,
                }}
                animate={{
                  y: [null, -100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 2,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* Geometric Background Shapes */}
          <div className="absolute inset-0 opacity-30">
            <motion.div
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-3/4 right-1/4 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1,
              }}
            />
            <motion.div
              className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-300/15 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.15, 0.3, 0.15],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center">
            {/* Logo with Advanced Animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              animate={{
                scale: 1,
                opacity: 1,
                rotateY: 0,
              }}
              transition={{
                duration: 1,
                ease: [0.25, 0.4, 0.25, 1],
              }}
              className="mb-16"
            >
              <div className="relative">
                {/* Outer rotating ring */}
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="absolute inset-0 w-32 h-32 mx-auto border-2 border-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 rounded-full p-[2px]"
                >
                  <div className="w-full h-full bg-slate-900 rounded-full" />
                </motion.div>

                {/* Inner counter-rotating ring */}
                <motion.div
                  animate={{
                    rotate: -360,
                  }}
                  transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="absolute inset-2 w-28 h-28 mx-auto border-2 border-white/30 rounded-full"
                />

                {/* Pulsing glow effect */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 w-32 h-32 mx-auto bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-md"
                />

                {/* Logo */}
                <motion.img
                  src="/kaspa-logo.webp"
                  alt="Kaspa"
                  className="w-24 h-24 mx-auto rounded-full relative z-10 shadow-2xl transform translate-y-16"
                  animate={{
                    y: [16, 11, 16],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>

            {/* Text Animations */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              transition={{
                duration: 0.8,
                delay: 0.5,
                ease: [0.25, 0.4, 0.25, 1],
              }}
            >
              <motion.h1
                className={cn("text-4xl md:text-6xl font-bold text-white mb-4", spaceGrotesk.className)}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{
                  background: "linear-gradient(90deg, #60A5FA, #A78BFA, #60A5FA, #A78BFA)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Kaspa's 4th Birthday
              </motion.h1>

              <motion.p
                className="text-white/70 text-lg mb-8"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.8,
                }}
              >
                Preparing an amazing celebration...
              </motion.p>
            </motion.div>

            {/* Advanced Loading Bar */}
            <motion.div
              className="w-80 mx-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                {/* Background glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-sm"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />

                {/* Main progress bar */}
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{
                    width: "100%",
                  }}
                  transition={{
                    duration: 2.5,
                    delay: 1.2,
                    ease: [0.25, 0.4, 0.25, 1],
                  }}
                  className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 rounded-full relative overflow-hidden"
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                </motion.div>

                {/* Particle trail */}
                <motion.div
                  className="absolute top-1/2 transform -translate-y-1/2 w-1 h-1 bg-white rounded-full"
                  animate={{
                    x: [0, 320],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: 1.2,
                    ease: [0.25, 0.4, 0.25, 1],
                  }}
                />
              </div>

              {/* Loading percentage */}
              <motion.div
                className="text-center mt-4 text-white/60 text-sm font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <motion.span
                  key={Math.floor(Date.now() / 2000) % 4} // Changes every 2 seconds
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: [0.6, 1, 0.6], y: 0 }}
                  transition={{
                    opacity: { duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                    y: { duration: 0.3 },
                  }}
                >
                  {
                    [
                      "Loading blockDAG innovation...",
                      "Initializing GHOSTDAG protocol...",
                      "Processing parallel blocks...",
                      "Preparing instant finality...",
                    ][Math.floor(Date.now() / 2000) % 4]
                  }
                </motion.span>
              </motion.div>
            </motion.div>

            {/* Floating Kaspa logo elements */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-slate-800/50 backdrop-blur-sm"
                  initial={{
                    x: `${Math.random() * 80 + 10}vw`,
                    y: `${Math.random() * 80 + 10}vh`,
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    y: [null, -100],
                    opacity: [0, 0.8, 0],
                    scale: [0, 1, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 4,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 3,
                    ease: "easeOut",
                  }}
                >
                  <img src="/kaspa-logo.webp" alt="Kaspa" className="w-full h-full object-cover rounded-full" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Corner decorations with Kaspa logos */}
          <motion.div
            className="absolute top-8 left-8 w-16 h-16 border-2 border-blue-400/30 rounded-full flex items-center justify-center bg-slate-800/30 backdrop-blur-sm"
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
              scale: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            }}
          >
            <img src="/kaspa-logo.webp" alt="Kaspa" className="w-10 h-10 rounded-full" />
          </motion.div>
          <motion.div
            className="absolute bottom-8 right-8 w-12 h-12 border-2 border-purple-400/30 rounded-full flex items-center justify-center bg-slate-800/30 backdrop-blur-sm"
            animate={{
              rotate: -360,
              scale: [1.1, 1, 1.1],
            }}
            transition={{
              rotate: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
              scale: { duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            }}
          >
            <img src="/kaspa-logo.webp" alt="Kaspa" className="w-8 h-8 rounded-full" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
