"use client"

import { useId } from "react"
import { motion } from "framer-motion"

export type SparkDir = "up" | "down" | "flat"

// Minimal inline SVG line chart (no external lib). The color is driven ONLY by
// the latest 30-second price tick (new vs previous poll) passed in as `dir`:
// green = price rose since last poll, red = price fell, flat = price unchanged.
// It has NO connection to the 24H change % shown elsewhere on the card.
// A brief one-time pulse plays when a fresh, differing price arrives (pulseKey
// increments only on a real change); otherwise the card stays static.
export default function Sparkline({
  points,
  dir,
  pulseKey,
}: {
  points: number[]
  dir: SparkDir
  pulseKey: number
}) {
  const gradientId = useId().replace(/[^a-zA-Z0-9]/g, "")
  const color = dir === "up" ? "#39ff14" : dir === "down" ? "#ef4444" : "#9ca3af"

  if (points.length < 2) return null

  const w = 100
  const h = 28
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1

  let coords: string
  if (dir === "flat") {
    // No change between polls → flat neutral line at the current level.
    const y = h - ((points[points.length - 1] - min) / span) * (h - 4) - 2
    coords = `0,${y.toFixed(1)} ${w},${y.toFixed(1)}`
  } else {
    coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((p - min) / span) * (h - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    }).join(" ")
  }

  return (
    <motion.div
      key={pulseKey}
      initial={pulseKey === 0 ? false : { opacity: 0.35 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={`g${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={coords} fill="none" stroke={color} strokeWidth="1.5" />
        <polygon points={`${coords} ${w},${h} 0,${h}`} fill={`url(#g${gradientId})`} />
      </svg>
    </motion.div>
  )
}