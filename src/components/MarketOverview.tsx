"use client"

import { useEffect, useState } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"

export default function MarketOverview() {
  const [data, setData] = useState<any>(null)
  
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-bg-card/40 border border-white/10 rounded-xl p-4">
        <h4 className="text-binance-yellow text-xs font-bold uppercase tracking-wider mb-1">Global Market Cap</h4>
        <p className="text-2xl font-mono font-bold text-white">{formatCurrency(data.totalMarketCap)}</p>
      </div>

      <div className="bg-bg-card/40 border border-white/10 rounded-xl p-4">
        <h4 className="text-binance-yellow text-xs font-bold uppercase tracking-wider mb-1">24h Volume</h4>
        <p className="text-2xl font-mono font-bold text-white">{formatCurrency(data.totalVolume)}</p>
      </div>

      <div className="bg-bg-card/40 border border-white/10 rounded-xl p-4">
        <h4 className="text-binance-yellow text-xs font-bold uppercase tracking-wider mb-1">Market Cap Change</h4>
        <div className={`flex items-center gap-2 font-mono font-bold text-2xl ${isUp ? "text-status-up" : "text-status-down"}`}>
          {isUp ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          <span>{Math.abs(data.marketCapChange24h).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  )
}
