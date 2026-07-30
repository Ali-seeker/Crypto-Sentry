"use client"
import { TrendingUp, TrendingDown, Star } from "lucide-react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { useWatchlistAction } from "@/hooks/useWatchlist"

interface PriceCardProps {
  asset_id: string
  asset_name: string
  usd: number
  usd_24h_change: number
  status: "stable" | "alert"
  initialIsStarred?: boolean
  initialWatchlistId?: string
}

export default function PriceCard({
  asset_id,
  asset_name,
  usd,
  usd_24h_change,
  status,
  initialIsStarred = false,
  initialWatchlistId,
}: PriceCardProps) {
  const { data: session } = useSession()
  const isUp = usd_24h_change >= 0
  const isAlert = status === "alert"

  const { isStarred, toggleStar } = useWatchlistAction(initialIsStarred, initialWatchlistId)

  const handleStarClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleStar(asset_id, asset_name)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative p-5 rounded-xl border overflow-hidden transition-all duration-300 backdrop-blur-md ${
        isAlert
          ? "bg-status-down/10 border-status-down/50 shadow-[0_0_15px_rgba(246,70,93,0.3)]"
          : "bg-bg-card/60 border-white/10"
      }`}
    >
      {isAlert && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute inset-0 bg-status-down/5 pointer-events-none"
        />
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">{asset_name}</h3>
          {session && (
            <button
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

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold font-mono">
            ${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </p>
        </div>
        <div
          className={`flex items-center gap-1 font-semibold ${
            isUp ? "text-status-up" : "text-status-down"
          }`}
        >
          {isUp ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          <span>{Math.abs(usd_24h_change).toFixed(2)}%</span>
        </div>
      </div>
    </motion.div>
  )
}
