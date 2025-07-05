"use client"

import { cn } from "@/lib/utils"

/**
 * Static blurred pill / ellipse used as a decorative background element.
 *
 * Props:
 *  - className (string): extra Tailwind classes for positioning
 *  - delay (number): not used anymore, kept for compatibility
 *  - width / height (number): size of the shape on desktop
 *  - mobileWidth / mobileHeight (number): size of the shape on mobile
 *  - rotate (number): rotation in degrees
 *  - gradient (string): Tailwind gradient classes (e.g. "from-blue-500/[0.15]")
 */
export function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  mobileWidth,
  mobileHeight,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  mobileWidth?: number
  mobileHeight?: number
  rotate?: number
  gradient?: string
}) {
  const finalMobileWidth = mobileWidth || Math.floor(width * 0.4)
  const finalMobileHeight = mobileHeight || Math.floor(height * 0.4)

  return (
    <div className={cn("absolute", className)}>
      {/* Mobile version */}
      <div
        style={{
          width: finalMobileWidth,
          height: finalMobileHeight,
          transform: `rotate(${rotate}deg)`,
        }}
        className="relative md:hidden"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient.replace(/\[0\.\d+\]/, "[0.08]"), // Make mobile even more subtle
            "backdrop-blur-[1px] border border-white/[0.08]",
            "shadow-[0_4px_16px_0_rgba(255,255,255,0.05)]",
          )}
        />
      </div>

      {/* Desktop version */}
      <div
        style={{
          width,
          height,
          transform: `rotate(${rotate}deg)`,
        }}
        className="relative hidden md:block"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]",
          )}
        />
      </div>
    </div>
  )
}
