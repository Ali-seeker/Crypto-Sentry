"use client"

import { motion } from "framer-motion"

// Small colored status pill reused across price cards (Dashboard + Watchlist).
// Uses the same `status` flag already provided by the live price data.
export default function StatusBadge({ status }: { status: "stable" | "alert" | "recovering" }) {
  const isAlert = status === "alert"
  const isRecovering = status === "recovering"
  const label = isAlert ? "CRITICAL" : isRecovering ? "RECOVERING" : "STABLE"

  const classes = isAlert
    ? "bg-neon-red/15 text-neon-red border-neon-red/40"
    : isRecovering
      ? "bg-neon-amber/15 text-neon-amber border-neon-amber/40"
      : "bg-neon-green/15 text-neon-green border-neon-green/40"

  return (
    <motion.span
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${classes}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isAlert ? "bg-neon-red" : isRecovering ? "bg-neon-amber" : "bg-neon-green"
        } ${isAlert ? "animate-pulse" : ""}`}
      />
      {label}
    </motion.span>
  )
}