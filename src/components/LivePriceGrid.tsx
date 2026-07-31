"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import PriceCard from "./PriceCard"
import Skeleton from "./Skeleton"

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
      const res = await fetch(`/api/prices?t=${Date.now()}`)
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
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    )
  }

  const watchlistEntries = Object.entries(watchlist)

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
        {watchlistEntries.length === 0 ? (
          <div className="col-span-full py-16 px-4 text-center border border-dashed border-white/10 rounded-xl bg-bg-card/20">
            <h3 className="text-2xl font-bold text-white mb-3">Your Watchlist is Empty</h3>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              Monitor your favorite crypto assets in real-time. Head over to the Market page to discover and star assets.
            </p>
            <a href="/market" className="px-8 py-3 bg-binance-yellow text-bg-dark font-bold rounded-lg hover:bg-binance-yellow/90 transition-colors inline-block">
              Explore Market
            </a>
          </div>
        ) : (
          watchlistEntries.map(([assetId, watchlistId], index) => {
            const priceData = data?.[assetId]
            
            if (!priceData) {
              return (
                <div key={assetId} className="p-5 rounded-xl border border-white/5 bg-bg-card/30 opacity-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg capitalize">{assetId.replace('-', ' ')}</h3>
                    <span className="text-sm text-white/30">{assetId}</span>
                  </div>
                  <p className="text-sm italic text-white/40">Waiting for data...</p>
                </div>
              )
            }

            return (
              <PriceCard
                key={assetId}
                asset_id={assetId}
                asset_name={priceData.name || assetId}
                usd={priceData.usd}
                usd_24h_change={priceData.usd_24h_change}
                image={priceData.image}
                status={priceData.status}
                alert_type={priceData.alert_type}
                initialIsStarred={true}
                initialWatchlistId={watchlistId}
                ageMs={ageMs}
                index={index}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
