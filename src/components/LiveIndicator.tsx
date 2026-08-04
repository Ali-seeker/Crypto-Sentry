"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function LiveIndicator() {
  const [stale, setStale] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/prices")
        if (res.ok) {
          const data = await res.json()
          setStale(data.stale)
        } else {
          setStale(true)
        }
      } catch {
        setStale(true)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  if (stale) {
    return (
      <div className="flex items-center gap-2 bg-neon-red/10 border border-neon-red/30 px-3 py-1 rounded-full shadow-[0_0_14px_rgba(255,59,92,0.25)]">
        <span className="relative flex w-2 h-2">
          <motion.span
            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-2 rounded-full bg-neon-red"
          />
        </span>
        <span className="text-[10px] font-bold text-neon-red uppercase tracking-wider">Delayed</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-neon-green/10 border border-neon-green/30 px-3 py-1 rounded-full shadow-[0_0_14px_rgba(38,255,168,0.25)]">
      <span className="relative flex w-2 h-2">
        <motion.span
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full bg-neon-green"
        />
      </span>
      <span className="text-[10px] font-bold text-neon-green uppercase tracking-wider">Live</span>
    </div>
  )
}
