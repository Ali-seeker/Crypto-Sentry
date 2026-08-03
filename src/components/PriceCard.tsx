"use client"
import { TrendingUp, TrendingDown, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useWatchlistAction } from "@/hooks/useWatchlist"
import { useEffect, useRef, useState } from "react"
import AnimatedNumber from "./AnimatedNumber"

interface PriceCardProps {
  asset_id: string
  asset_name: string
  usd: number
  usd_24h_change: number
  image?: string
  status: "stable" | "alert" | "recovering"
  alert_type?: "CRASH" | "SPIKE"
  initialIsStarred?: boolean
  initialWatchlistId?: string
  ageMs?: number | null
  index?: number
}

export default function PriceCard({
  asset_id,
  asset_name,
  usd,
  usd_24h_change,
  image,
  status,
  initialIsStarred = false,
  initialWatchlistId,
  alert_type,
  ageMs,
  index = 0,
}: PriceCardProps) {
  const { isStarred, toggleStar } = useWatchlistAction(initialIsStarred, initialWatchlistId)
  const isAlert = status === "alert"
  const isSpike = alert_type === "SPIKE"
  const alertRgb = isSpike ? "14, 203, 129" : "246, 70, 93"

  // Track previous price for flash animation
  const prevUsd = useRef(usd)
  const [flashColor, setFlashColor] = useState<"up" | "down" | null>(null)
  const [imgError, setImgError] = useState(false)
  
  const dataTimestamp = useRef(Date.now())
  const [secondsAgo, setSecondsAgo] = useState(0)

  useEffect(() => {
    // If ageMs is provided, calculate the exact timestamp the engine fetched the data.
    // If not, fallback to Date.now() when usd changes.
    if (ageMs !== undefined && ageMs !== null) {
      dataTimestamp.current = Date.now() - ageMs
    } else {
      dataTimestamp.current = Date.now()
    }
  }, [ageMs, usd, usd_24h_change])

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - dataTimestamp.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (usd > prevUsd.current) {
      setFlashColor("up")
    } else if (usd < prevUsd.current) {
      setFlashColor("down")
    }
    prevUsd.current = usd

    const timeout = setTimeout(() => {
      setFlashColor(null)
    }, 500)
    return () => clearTimeout(timeout)
  }, [usd])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        borderColor: isAlert ? `rgba(${alertRgb}, 0.4)` : "rgba(255, 255, 255, 0.1)",
        backgroundColor: isAlert ? `rgba(${alertRgb}, 0.1)` : "rgba(30, 35, 41, 0.6)",
        boxShadow: isAlert ? `0 0 20px rgba(${alertRgb}, 0.2)` : "none"
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ 
        duration: 0.4, 
        ease: "easeOut",
        delay: index * 0.05,
        borderColor: { duration: 0.5 },
        backgroundColor: { duration: 0.5 }
      }}
      className="relative p-4 rounded-xl border overflow-hidden backdrop-blur-md"
    >
      <AnimatePresence>
        {isAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatType: "reverse" }}
            className={`absolute inset-0 pointer-events-none ${isSpike ? "bg-status-up/10" : "bg-status-down/10"}`}
          />
        )}
        {flashColor && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`absolute inset-0 pointer-events-none ${flashColor === "up" ? "bg-status-up" : "bg-status-down"}`}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-start mb-4 relative">
        <div className="flex items-center gap-3 relative z-10 min-w-0 flex-1 pr-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
            {!imgError && image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={image} 
                alt={asset_name} 
                className="w-full h-full object-cover" 
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/50">
                {asset_name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg leading-tight truncate">{asset_name}</h3>
              {initialWatchlistId !== undefined && (
                <motion.button 
                  id={index === 0 ? "watchlist-star" : undefined}
                  onClick={toggleStar}
                  whileTap={{ scale: 1.5 }}
                  className="hover:scale-110 transition-transform flex-shrink-0"
                >
                  <Star 
                    size={16} 
                    className={isStarred ? "fill-binance-yellow text-binance-yellow" : "text-white/30"} 
                  />
                </motion.button>
              )}
            </div>
          </div>
        </div>
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider truncate max-w-[80px] text-right flex-shrink-0 pt-1">
          {asset_id}
        </span>
      </div>

      <div className="flex items-end justify-between relative z-10">
        <div className="text-2xl font-bold font-mono leading-none">
          $<AnimatedNumber value={(usd || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })} />
        </div>
        <div
          className={`flex items-center gap-1 font-semibold ${
            (usd_24h_change || 0) >= 0 ? "text-status-up" : "text-status-down"
          }`}
        >
          {(usd_24h_change || 0) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="text-sm">{Math.abs(usd_24h_change || 0).toFixed(2)}%</span>
        </div>
      </div>
      
      <div className="flex justify-end mt-2">
        <span className="text-[10px] text-white/30 uppercase tracking-wider">
          Updated {secondsAgo === 0 ? "Just now" : `${secondsAgo}s ago`}
        </span>
      </div>
    </motion.div>
  )
}
