"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import PriceCard from "./PriceCard"

// Assuming a predefined list since the backend might only return alert history as a fallback,
// which wouldn't contain all 10 assets if they haven't crashed.
// But we want to render skeleton cards.
const ASSETS_LIST = [
  { id: "bitcoin", name: "Bitcoin" },
  { id: "ethereum", name: "Ethereum" },
  { id: "tether", name: "Tether" },
  { id: "binancecoin", name: "BNB" },
  { id: "ripple", name: "XRP" },
  { id: "usd-coin", name: "USDC" },
  { id: "solana", name: "Solana" },
  { id: "tron", name: "TRON" },
  { id: "cardano", name: "Cardano" },
  { id: "polkadot", name: "Polkadot" },
]

export default function LivePriceGrid() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStale, setIsStale] = useState(false)
  const [ageMs, setAgeMs] = useState<number | null>(null)
  const [watchlist, setWatchlist] = useState<Record<string, string>>({}) // asset_id -> watchlist_id
  const { data: session } = useSession()

  const fetchWatchlist = async () => {
    if (!session) return
    try {
      const res = await fetch("/api/watchlist")
      if (res.ok) {
        const items = await res.json()
        const wlMap: Record<string, string> = {}
        items.forEach((item: any) => {
          wlMap[item.asset_id] = item.id
        })
        setWatchlist(wlMap)
      }
    } catch (e) {
      console.error("Failed to fetch watchlist", e)
    }
  }

  const fetchData = async () => {
    try {
      const res = await fetch("/api/prices")
      if (!res.ok) throw new Error("Failed to fetch prices")
      const result = await res.json()
      
      setData(result.prices || {})
      setIsStale(result.stale)
      setAgeMs(result.ageMs)
      setError(null)
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWatchlist()
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [session])

  if (error && !data) {
    return (
      <div className="p-6 bg-status-down/20 border border-status-down rounded-lg text-center">
        <h2 className="text-xl font-bold text-status-down mb-2">Error Loading Prices</h2>
        <p className="text-white/80">{error}</p>
        <button 
          onClick={() => { setLoading(true); setError(null); fetchData(); }}
          className="mt-4 px-4 py-2 bg-status-down text-white rounded hover:bg-status-down/80 transition"
        >
          Retry
        </button>
      </div>
    )
  }

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ASSETS_LIST.map((asset) => (
          <div key={asset.id} className="h-32 bg-bg-card/40 border border-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isStale && (
        <div className="bg-binance-yellow/20 border border-binance-yellow text-binance-yellow px-4 py-3 rounded-lg flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold">Live feed unavailable</p>
            <p className="text-sm opacity-80">
              Data is {ageMs ? Math.floor(ageMs / 1000) : '?'}s old — surveillance engine may be offline.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ASSETS_LIST.map((asset) => {
          const priceData = data?.[asset.id]
          if (!priceData) {
            return (
              <div key={asset.id} className="p-5 rounded-xl border border-white/5 bg-bg-card/30 opacity-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">{asset.name}</h3>
                  <span className="text-sm text-white/30">{asset.id}</span>
                </div>
                <p className="text-sm italic">Data unavailable</p>
              </div>
            )
          }

          return (
            <PriceCard
              key={asset.id}
              asset_id={asset.id}
              asset_name={asset.name}
              usd={priceData.usd}
              usd_24h_change={priceData.usd_24h_change}
              status={priceData.status}
              initialIsStarred={!!watchlist[asset.id]}
              initialWatchlistId={watchlist[asset.id]}
            />
          )
        })}
      </div>
    </div>
  )
}
