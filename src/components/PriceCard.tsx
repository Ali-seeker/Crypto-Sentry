"use client"
import { TrendingUp, TrendingDown, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useWatchlistAction } from "@/hooks/useWatchlist"
import { useEffect, useRef, useState } from "react"
import AnimatedNumber from "./AnimatedNumber"
import Sparkline, { SparkDir } from "./Sparkline"
import StatusBadge from "./StatusBadge"
import { useSettings } from "./SettingsProvider"

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
  history?: number[]
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
  history,
}: PriceCardProps) {
  const { isStarred, toggleStar } = useWatchlistAction(initialIsStarred, initialWatchlistId)
  const { settings } = useSettings()

  // Bug 4 + 7c: effective alert status = engine/DB flag (server overlay) OR a
  // client-side short-term move computed from the rolling price buffer against
  // the Critical Sensitivity setting. The Express engine still uses its own
  // hardcoded -2.0% threshold for detection; this client check is what makes the
  // Settings slider visibly affect card STABLE→ALERT sensitivity.
  const threshold = Math.abs(settings.criticalThreshold || 2.0)
  let clientAlert: "CRASH" | "SPIKE" | null = null
  if (history && history.length >= 2) {
    const first = history[0]
    const last = history[history.length - 1]
    if (first && last && first > 0) {
      const deltaPct = ((last - first) / first) * 100
      if (deltaPct <= -threshold) clientAlert = "CRASH"
      else if (deltaPct >= threshold) clientAlert = "SPIKE"
    }
  }

  const isAlert = status === "alert" || clientAlert !== null
  const isSpike = (status === "alert" && alert_type === "SPIKE") || clientAlert === "SPIKE"
  const effectiveStatus: "stable" | "alert" | "recovering" = isAlert ? "alert" : status
  const alertRgb = isSpike ? "14, 203, 129" : "246, 70, 93"

  // Track previous price for flash animation
  const prevUsd = useRef(usd)
  const [flashColor, setFlashColor] = useState<"up" | "down" | null>(null)
  const [imgError, setImgError] = useState(false)

  // Sparkline color + pulse are driven ONLY by the latest 30-second poll delta
  // (new price vs previous poll price) — never by the 24H change % shown above.
  // `ageMs` changes every poll, so this effect re-runs each cycle: a card whose
  // price is unchanged renders a neutral/flat line with no animation.
  const prevTickUsd = useRef<number | null>(null)
  const [sparkDir, setSparkDir] = useState<SparkDir>("flat")
  const [sparkPulse, setSparkPulse] = useState(0)
  
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

  useEffect(() => {
    const prev = prevTickUsd.current
    prevTickUsd.current = usd
    if (prev === null) {
      setSparkDir("flat")
      return
    }
    if (usd === prev) {
      setSparkDir("flat")
    } else {
      setSparkDir(usd > prev ? "up" : "down")
      setSparkPulse((p) => p + 1)
    }
    // ageMs changes on every poll → re-evaluate each cycle (incl. no-change case).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usd, ageMs])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        borderColor: isAlert ? `rgba(${alertRgb}, 0.6)` : "rgba(34, 197, 94, 0.15)",
        backgroundColor: isAlert ? `rgba(${alertRgb}, 0.12)` : "rgba(16, 24, 39, 0.55)",
        boxShadow: isAlert ? `0 0 28px rgba(${alertRgb}, 0.3)` : "0 0 14px rgba(34, 197, 94, 0.05)"
      }}
      whileHover={{ y: -5, scale: 1.02, boxShadow: `0 0 28px rgba(34, 197, 94, 0.15)` }}
      transition={{ 
        duration: 0.4, 
        ease: "easeOut",
        delay: index * 0.05,
        borderColor: { duration: 0.5 },
        backgroundColor: { duration: 0.5 },
        boxShadow: { duration: 0.3 }
      }}
      className="cyber-corners relative p-4 rounded-xl border overflow-hidden backdrop-blur-md bg-bg-card/50"
    >
      <div className="corner" />
      <div className="holo-sheen" />

      <AnimatePresence>
        {isAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.4, 1, 0.6] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className={`absolute inset-0 pointer-events-none ${isSpike ? "bg-neon-green/15" : "bg-neon-red/15"}`}
          />
        )}
        {isAlert && (
          <motion.span
            className={`absolute top-2 left-2 w-10 h-10 rounded-full pointer-events-none ${isSpike ? "bg-neon-green" : "bg-neon-red"}`}
            initial={{ scale: 0.6, opacity: 0.7 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
          />
        )}
        {flashColor && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`absolute inset-0 pointer-events-none ${flashColor === "up" ? "bg-neon-green" : "bg-neon-red"}`}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-start mb-4 relative">
        <div className="flex items-center gap-3 relative z-10 min-w-0 flex-1 pr-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-neon-cyan/30 bg-white/10 flex-shrink-0">
            {!imgError && image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={image} 
                alt={asset_name} 
                className="w-full h-full object-cover" 
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neon-cyan/60">
                {asset_name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg leading-tight truncate">{asset_name}</h3>
              {initialWatchlistId !== undefined && (
                <motion.button 
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleStar(asset_id, asset_name)
                  }}
                  whileTap={{ scale: 1.5 }}
                  className="hover:scale-110 transition-transform flex-shrink-0"
                >
                  <Star 
                    size={16} 
                    className={isStarred ? "fill-neon-cyan text-neon-cyan drop-shadow-[0_0_5px_rgba(34,197,94,0.9)]" : "text-white/30"} 
                  />
                </motion.button>
              )}
            </div>
          </div>
        </div>
        <span className="cyber-label truncate max-w-[80px] text-right flex-shrink-0 pt-1">
          {asset_id}
        </span>
      </div>

      <div className="flex items-end justify-between relative z-10">
        <div className="text-2xl font-bold font-mono leading-none">
          {isSpike && <span className="cyber-label block mb-0.5">SURGE</span>}
          {isAlert && alert_type === "CRASH" && <span className="cyber-label block mb-0.5">CRASH</span>}
          $<AnimatedNumber value={(usd || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })} />
        </div>
        <div
          className={`flex items-center gap-1 font-semibold ${
            (usd_24h_change || 0) >= 0 ? "text-neon-green" : "text-neon-red"
          }`}
        >
          {(usd_24h_change || 0) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="text-sm">{Math.abs(usd_24h_change || 0).toFixed(2)}%</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2 relative z-10">
        <StatusBadge status={effectiveStatus} />
        <span className="text-[10px] text-white/30 uppercase tracking-wider">
          {secondsAgo === 0 ? "Just now" : `${secondsAgo}s ago`}
        </span>
      </div>

      {history && history.length >= 2 && (
        <div className="mt-2 relative z-10">
          <Sparkline points={history} dir={sparkDir} pulseKey={sparkPulse} />
        </div>
      )}
    </motion.div>
  )
}
