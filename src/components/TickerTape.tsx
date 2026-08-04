"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useSettings } from "./SettingsProvider"
import { pollIntervalFor } from "@/lib/clientSettings"

interface TickerItem {
  asset_id: string
  name: string
  usd: number
  usd_24h_change: number
}

interface TickerPrice {
  name: string
  usd: number
  usd_24h_change: number
}

export default function TickerTape() {
  const [items, setItems] = useState<TickerItem[]>([])
  const { settings } = useSettings()
  const pollInterval = pollIntervalFor(settings)

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const res = await fetch(`/api/prices?t=${Date.now()}`)
        if (!res.ok) return
        const result = await res.json()
        const prices: Record<string, TickerPrice> = result.prices || {}
        const list: TickerItem[] = Object.entries(prices).map(([id, p]) => ({
          asset_id: id,
          name: p.name || id,
          usd: p.usd || 0,
          usd_24h_change: p.usd_24h_change || 0,
        }))
        setItems(list)
      } catch {
        // Silent — ticker is decorative
      }
    }

    fetchTicker()
    const interval = setInterval(fetchTicker, pollInterval)
    return () => clearInterval(interval)
  }, [pollInterval])

  if (items.length === 0) return null

  // Duplicate list so the -50% translateX scroll loops seamlessly
  const doubled = [...items, ...items]

  return (
    <div className="fixed top-0 left-0 right-0 z-30 h-9 flex items-center overflow-hidden border-b border-neon-cyan/20 bg-[#070a12]/85 backdrop-blur-md">
      <div className="flex-shrink-0 h-full px-3 flex items-center gap-2 bg-gradient-to-r from-neon-cyan to-neon-cyan text-black text-[10px] font-bold tracking-[0.2em] uppercase z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
        Live Feed
      </div>
      <div className="relative flex-1 overflow-hidden h-full flex items-center [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="flex whitespace-nowrap will-change-transform" style={{ animation: "ticker-scroll 160s linear infinite" }}>
          {doubled.map((item, i) => {
            const up = item.usd_24h_change >= 0
            return (
              <span
                key={`${item.asset_id}-${i}`}
                className="inline-flex items-center gap-2 mx-6 font-mono text-xs"
              >
                <span className="text-white/80 font-semibold uppercase tracking-wider">
                  {item.name}
                </span>
                <span className="text-white/60">
                  ${item.usd.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })}
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${up ? "text-neon-green" : "text-neon-red"
                    }`}
                >
                  {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(item.usd_24h_change).toFixed(2)}%
                </span>
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}