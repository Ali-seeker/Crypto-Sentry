"use client"

import { useState, useEffect } from "react"
import PriceCard from "./PriceCard"

interface WatchlistGridProps {
  initialWatchlist: Array<{
    id: string
    asset_id: string
    asset_name: string
  }>
}

export default function WatchlistGrid({ initialWatchlist }: WatchlistGridProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStale, setIsStale] = useState(false)
  const [ageMs, setAgeMs] = useState<number | null>(null)

  // We maintain a local copy of watchlist so if user unstars, we don't immediately remove it
  // until they refresh, or we can remove it immediately. The spec says:
  // "Unstarring removes it from the DB". Usually if they unstar on the watchlist page,
  // we might hide it or just leave it unstarred. Let's just leave it there but unstarred for now.

  const fetchData = async () => {
    try {
      const assetIds = initialWatchlist.map(w => w.asset_id).join(",")
      if (!assetIds) return
      
      const res = await fetch(`/api/prices?ids=${assetIds}&t=${Date.now()}`)
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
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [initialWatchlist])

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
        {initialWatchlist.map((asset) => (
          <div key={asset.id} className="h-32 bg-bg-card/40 border border-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
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
        {initialWatchlist.map((asset) => {
          const priceData = data?.[asset.asset_id]
          if (!priceData) {
            return (
              <div key={asset.id} className="p-5 rounded-xl border border-white/5 bg-bg-card/30 opacity-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">{asset.asset_name}</h3>
                  <span className="text-sm text-white/30">{asset.asset_id}</span>
                </div>
                <p className="text-sm italic">Data unavailable</p>
              </div>
            )
          }

          return (
            <PriceCard
              key={asset.id}
              asset_id={asset.asset_id}
              asset_name={priceData.name || asset.asset_name}
              usd={priceData.usd}
              usd_24h_change={priceData.usd_24h_change}
              image={priceData.image}
              status={priceData.status}
              alert_type={priceData.alert_type}
              initialIsStarred={true}
              initialWatchlistId={asset.id}
              ageMs={ageMs}
            />
          )
        })}
      </div>
    </div>
  )
}
