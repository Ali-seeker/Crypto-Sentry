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
      } catch (e) {
        setStale(true)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  if (stale) {
    return (
      <div className="flex items-center gap-2 bg-status-down/10 border border-status-down/20 px-2 py-1 rounded-full">
        <motion.span 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full bg-status-down"
        />
        <span className="text-[10px] font-bold text-status-down uppercase tracking-wider">Delayed</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-status-up/10 border border-status-up/20 px-2 py-1 rounded-full">
      <motion.span 
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-2 h-2 rounded-full bg-status-up"
      />
      <span className="text-[10px] font-bold text-status-up uppercase tracking-wider">Live</span>
    </div>
  )
}
