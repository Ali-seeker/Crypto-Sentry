"use client"

import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"

interface AlertLogProps {
  asset_name: string
  asset_id: string
  price_at_drop: number
  drop_percentage: number
  detected_at: string | Date
}

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return `${seconds} seconds ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

export default function AlertLog({
  asset_name,
  asset_id,
  price_at_drop,
  drop_percentage,
  detected_at,
}: AlertLogProps) {
  const [relativeTime, setRelativeTime] = useState("")

  useEffect(() => {
    const d = new Date(detected_at)
    setRelativeTime(timeAgo(d))
    
    // Update every minute
    const interval = setInterval(() => setRelativeTime(timeAgo(d)), 60000)
    return () => clearInterval(interval)
  }, [detected_at])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 bg-bg-card/40 border border-status-down/20 rounded-lg hover:bg-bg-card/60 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-status-down/10 flex items-center justify-center">
          <AlertTriangle size={18} className="text-status-down" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white">{asset_name}</h4>
            <span className="text-xs text-white/40 uppercase tracking-widest">{asset_id}</span>
          </div>
          <p className="text-sm text-status-down font-medium mt-0.5">
            Flash Crash: {drop_percentage.toFixed(2)}% drop
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono text-lg font-bold text-white">
          ${price_at_drop.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
        </p>
        <p className="text-xs text-white/40 mt-1">{relativeTime || "Just now"}</p>
      </div>
    </motion.div>
  )
}
