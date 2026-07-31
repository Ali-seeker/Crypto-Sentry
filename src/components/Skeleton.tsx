"use client"

import { motion } from "framer-motion"

export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-bg-card/40 border border-white/5 ${className}`}>
      <motion.div
        className="absolute inset-0 w-[200%] -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      />
    </div>
  )
}
