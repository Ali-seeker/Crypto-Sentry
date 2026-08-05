"use client"

import { useEffect, useState } from "react"
import { BrainCircuit, Activity, Gauge } from "lucide-react"
import { motion } from "framer-motion"

interface SentryMetrics {
  volatility: number // avg |24h change| across tracked assets
  buyPressure: number // % of assets currently up
  tracked: number
}

// Sentry Analytics — AI-sentiment style readout.
// NOTE: placeholder metrics derived live from tracked asset price deltas.
// Wire to real backend metrics (volatility index, order-flow sentiment)
// in a follow-up task; no new API calls were added.
export default function SentryAnalytics() {
  const [metrics, setMetrics] = useState<SentryMetrics | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/prices?t=${Date.now()}`)
        if (!res.ok) return
        const data = await res.json()
        const prices: Record<string, { usd_24h_change?: number }> = data.prices || {}
        const changes = Object.values(prices).map((p) => p.usd_24h_change ?? 0)
        if (changes.length === 0) return
        const volatility = changes.reduce((a, b) => a + Math.abs(b), 0) / changes.length
        const buyPressure = (changes.filter((c) => c > 0).length / changes.length) * 100
        setMetrics({ volatility, buyPressure, tracked: changes.length })
      } catch {
        // silent
      }
    }
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [])

  const mood =
    metrics === null
      ? "CALCULATING..."
      : metrics.volatility > 3
        ? "ELEVATED VOLATILITY — DEFENSIVE STANCE"
        : metrics.buyPressure > 60
          ? "BULLISH BID TONE ACROSS THE GRID"
          : "RANGED MARKET — SENTIMENT NEUTRAL"

  return (
    <section id="sentry-analytics" className="cyber-panel cyber-corners relative rounded-xl p-5 h-full">
      <div className="corner" />
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit size={16} className="text-neon-cyan" />
        <h2 className="cyber-label">Sentry Analytics</h2>
      </div>

      <p className="text-sm text-white/80 font-mono mb-4 leading-relaxed">
        <span className="text-neon-cyan">AI&nbsp;MODE:</span> {mood}
      </p>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 p-3"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Gauge size={14} className="text-neon-cyan" />
            <span className="cyber-label">Volatility Index</span>
          </div>
          <p className="font-mono text-2xl font-bold text-white">
            {metrics ? metrics.volatility.toFixed(2) : "—"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-neon-green/20 bg-neon-green/5 p-3"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Activity size={14} className="text-neon-green" />
            <span className="cyber-label">Buy Pressure</span>
          </div>
          <p className="font-mono text-2xl font-bold text-white">
            {metrics ? `${metrics.buyPressure.toFixed(0)}%` : "—"}
          </p>
        </motion.div>
      </div>

      <p className="text-[10px] text-white/30 mt-4 font-mono">
        TRACKING {metrics?.tracked ?? 0} ASSETS // PLACEHOLDER METRICS
      </p>
    </section>
  )
}