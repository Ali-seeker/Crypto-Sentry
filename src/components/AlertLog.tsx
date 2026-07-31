"use client"

import { motion } from "framer-motion"
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

interface AlertLogProps {
  asset_name: string
  asset_id: string
  price_at_drop: number
  drop_percentage: number
  alert_type: string
  image?: string
  detected_at: string | Date
  index?: number
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
  alert_type,
  image,
  detected_at,
  index = 0,
}: AlertLogProps) {
  const [relativeTime, setRelativeTime] = useState("")
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const d = new Date(detected_at)
    setRelativeTime(timeAgo(d))
    
    // Update every minute
    const interval = setInterval(() => setRelativeTime(timeAgo(d)), 60000)
    return () => clearInterval(interval)
  }, [detected_at])

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 30 }}
      className={`flex items-center justify-between p-4 bg-bg-card/40 border rounded-lg hover:bg-bg-card/60 transition-colors ${
        alert_type === "SPIKE" ? "border-status-up/20" : "border-status-down/20"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            alert_type === "SPIKE" ? "bg-status-up/10" : "bg-status-down/10"
          }`}
        >
          {alert_type === "SPIKE" ? (
            <TrendingUp size={18} className="text-status-up" />
          ) : (
            <TrendingDown size={18} className="text-status-down" />
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {image && !imgError ? (
            <img 
              src={image} 
              alt={asset_name} 
              className="w-8 h-8 rounded-full"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white uppercase">
              {asset_name.charAt(0)}
            </div>
          )}
          
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white">{asset_name}</h4>
              <span className="text-xs text-white/40 uppercase tracking-widest">{asset_id}</span>
            </div>
            <p
              className={`text-sm font-medium mt-0.5 ${
                alert_type === "SPIKE" ? "text-status-up" : "text-status-down"
              }`}
            >
              {alert_type === "SPIKE" ? "Flash Spike: " : "Flash Crash: "}
              {Math.abs(drop_percentage).toFixed(2)}% {alert_type === "SPIKE" ? "surge" : "drop"}
            </p>
          </div>
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
