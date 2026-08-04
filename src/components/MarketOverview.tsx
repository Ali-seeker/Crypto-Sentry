"use client"

import { useEffect, useState } from "react"
import { TrendingDown, TrendingUp, Activity, Globe, Zap } from "lucide-react"
import { motion } from "framer-motion"

export default function MarketOverview() {
  const [data, setData] = useState<{totalMarketCap: number, totalVolume: number, marketCapChange24h: number, error?: string} | null>(null)
  
  useEffect(() => {
    fetch("/api/market-overview")
      .then(res => res.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data || data.error) return null

  const formatCurrency = (val: number) => {
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`
    return `$${val.toLocaleString()}`
  }

  const isUp = data.marketCapChange24h >= 0

  const statCards = [
    {
      icon: Globe,
      label: "Global Market Cap",
      value: formatCurrency(data.totalMarketCap),
      accent: "from-neon-cyan/40 to-neon-cyan/0",
    },
    {
      icon: Activity,
      label: "24h Volume",
      value: formatCurrency(data.totalVolume),
      accent: "from-neon-cyan/40 to-neon-cyan/0",
    },
    {
      icon: Zap,
      label: "Market Cap Change",
      value: `${isUp ? "+" : ""}${data.marketCapChange24h.toFixed(2)}%`,
      accent: "from-neon-cyan/40 to-neon-cyan/0",
      up: isUp,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {statCards.map((card, i) => {
        const Icon = card.icon
        const colorClass = card.up === undefined
          ? "text-neon-cyan"
          : card.up ? "text-neon-green" : "text-neon-red"
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
            className="cyber-panel cyber-corners relative rounded-xl p-4 overflow-hidden group"
          >
            <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${card.accent}`} />
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="cyber-label">{card.label}</h4>
              <Icon size={16} className={`${colorClass} transition-transform group-hover:scale-125 group-hover:rotate-6 duration-300`} />
            </div>
            <p className="text-2xl font-mono font-bold text-white group-hover:drop-shadow-[0_0_12px_rgba(34,197,94,0.35)] transition-all duration-300">
              {card.value}
            </p>
            {card.up !== undefined && (
              <span className={`inline-flex items-center gap-1 mt-1 text-xs font-semibold ${colorClass}`}>
                {card.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                24h
              </span>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}