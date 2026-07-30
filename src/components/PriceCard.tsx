"use client"
import { TrendingUp, TrendingDown, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { useWatchlistAction } from "@/hooks/useWatchlist"
import { useEffect, useRef, useState } from "react"

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
}: PriceCardProps) {
  const { data: session } = useSession()
  const { isStarred, toggleStar } = useWatchlistAction(initialIsStarred, initialWatchlistId)
  const isAlert = status === "alert"
  const isSpike = alert_type === "SPIKE"
  const alertRgb = isSpike ? "14, 203, 129" : "246, 70, 93"

  // Track previous price for flash animation
  const prevUsd = useRef(usd)
  const [flashColor, setFlashColor] = useState<"up" | "down" | null>(null)
  const [imgError, setImgError] = useState(false)
  const [lastUpdated, setLastUpdated] = useState("Just now")

  useEffect(() => {
    setLastUpdated("Just now")
    const timer = setTimeout(() => setLastUpdated("3s ago"), 3000)
    return () => clearTimeout(timer)
  }, [usd])

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

  const handleStarClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleStar(asset_id, asset_name)
  }

  return (
    <motion.div
      initial={false}
      animate={{
        borderColor: isAlert ? `rgba(${alertRgb}, 0.4)` : "rgba(255, 255, 255, 0.1)",
        backgroundColor: isAlert ? `rgba(${alertRgb}, 0.1)` : "rgba(30, 35, 41, 0.6)"
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="relative p-4 rounded-xl border overflow-hidden transition-all duration-300 backdrop-blur-md"
    >
      <AnimatePresence>
        {isAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
            className={`absolute inset-0 pointer-events-none ${isSpike ? "bg-status-up/5" : "bg-status-down/5"}`}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-3 relative z-10">
        <div className="flex items-center gap-2">
          {image && !imgError ? (
            <img 
              src={image} 
              alt={asset_name} 
              className="w-6 h-6 rounded-full"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white uppercase">
              {asset_name.charAt(0)}
            </div>
          )}
          <h3 className="font-semibold text-lg">{asset_name}</h3>
          {session && (
            <button
              id={asset_id === "bitcoin" ? "watchlist-star" : undefined}
              onClick={handleStarClick}
              className="text-binance-yellow hover:scale-110 transition-transform"
            >
              <Star
                size={18}
                fill={isStarred ? "currentColor" : "none"}
                className={isStarred ? "text-binance-yellow" : "text-white/30 hover:text-white/70"}
              />
            </button>
          )}
        </div>
        <span className="text-sm font-medium text-white/50 uppercase tracking-wider">
          {asset_id}
        </span>
      </div>

      <div className="flex items-end justify-between relative z-10">
        <motion.div
          animate={{
            color: flashColor === "up" ? "#0ECB81" : flashColor === "down" ? "#F6465D" : "#FFFFFF"
          }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-2xl font-bold font-mono leading-none">
            ${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </p>
        </motion.div>
        <div
          className={`flex items-center gap-1 font-semibold ${
            usd_24h_change >= 0 ? "text-status-up" : "text-status-down"
          }`}
        >
          {usd_24h_change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="text-sm">{Math.abs(usd_24h_change).toFixed(2)}%</span>
        </div>
      </div>
      
      <div className="flex justify-end mt-2">
        <span className="text-[10px] text-white/30 uppercase tracking-wider">Updated {lastUpdated}</span>
      </div>
    </motion.div>
  )
}
