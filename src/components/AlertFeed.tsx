"use client"

import { useEffect, useState } from "react"
import { Siren } from "lucide-react"
import { motion } from "framer-motion"
import { TrendingDown, TrendingUp } from "lucide-react"

interface AlertItem {
  id: string
  asset_name: string
  alert_type: string
  drop_percentage: number
  detected_at: string
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

// Live feed of the most recent system alerts (reuses the existing /api/alerts source).
export default function AlertFeed() {
  const [alerts, setAlerts] = useState<AlertItem[] | null>(null)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch("/api/alerts?limit=5")
        if (res.status === 401) {
          setUnauthorized(true)
          return
        }
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setAlerts(Array.isArray(data) ? data : [])
      } catch {
        // silent
      }
    }
    load()
    const interval = setInterval(load, 15000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return (
    <section className="cyber-panel cyber-corners relative rounded-xl p-5 h-full">
      <div className="corner" />
      <div className="flex items-center gap-2 mb-4">
        <Siren size={16} className="text-neon-cyan" />
        <h2 className="cyber-label">System Alerts</h2>
      </div>

      {unauthorized ? (
        <p className="text-sm text-white/40 py-4">Sign in to view your surveillance alerts.</p>
      ) : alerts === null ? (
        <p className="text-sm text-white/40 py-4">Loading feed...</p>
      ) : alerts.length === 0 ? (
        <div className="py-4 flex items-center gap-3 text-neon-green">
          <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <p className="text-sm">No alerts triggered — all clear.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert, i) => {
            const spike = alert.alert_type === "SPIKE"
            const Icon = spike ? TrendingUp : TrendingDown
            return (
              <motion.li
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  spike
                    ? "border-neon-green/25 bg-neon-green/5"
                    : "border-neon-red/25 bg-neon-red/5"
                }`}
              >
                <Icon size={16} className={spike ? "text-neon-green" : "text-neon-red"} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{alert.asset_name}</p>
                  <p className="text-xs text-white/50">
                    {Math.abs(alert.drop_percentage).toFixed(2)}% {spike ? "surge" : "drop"}
                  </p>
                </div>
                <span className="text-[10px] text-white/40 font-mono">{timeAgo(alert.detected_at)}</span>
              </motion.li>
            )
          })}
        </ul>
      )}
    </section>
  )
}