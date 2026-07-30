"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { useSession } from "next-auth/react"
import { useWatchlistAction } from "@/hooks/useWatchlist"
import { Star, TrendingUp, TrendingDown } from "lucide-react"

// A simplified row component specifically for the market page
function MarketRow({ 
  asset_id, 
  asset_name, 
  usd, 
  usd_24h_change, 
  initialIsStarred, 
  initialWatchlistId 
}: any) {
  const { data: session } = useSession()
  const isUp = usd_24h_change >= 0
  const { isStarred, toggleStar } = useWatchlistAction(initialIsStarred, initialWatchlistId)

  return (
    <div className="flex items-center justify-between p-4 bg-bg-card/40 border border-white/5 rounded-lg hover:bg-bg-card/80 transition-colors">
      <div className="flex items-center gap-4 w-1/3">
        {session && (
          <button
            onClick={(e) => {
              e.preventDefault()
              toggleStar(asset_id, asset_name)
            }}
            className="text-binance-yellow hover:scale-110 transition-transform"
          >
            <Star
              size={18}
              fill={isStarred ? "currentColor" : "none"}
              className={isStarred ? "text-binance-yellow" : "text-white/30 hover:text-white/70"}
            />
          </button>
        )}
        <div>
          <h4 className="font-bold text-white text-lg">{asset_name}</h4>
          <span className="text-xs text-white/40 uppercase tracking-widest">{asset_id}</span>
        </div>
      </div>

      <div className="w-1/3 text-right font-mono text-lg font-bold">
        ${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
      </div>

      <div className={`w-1/3 flex items-center justify-end gap-1 font-semibold ${isUp ? "text-status-up" : "text-status-down"}`}>
        {isUp ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
        <span>{Math.abs(usd_24h_change).toFixed(2)}%</span>
      </div>
    </div>
  )
}

export default function MarketGrid() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStale, setIsStale] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [ageMs, setAgeMs] = useState(0)
  
  const [watchlist, setWatchlist] = useState<Record<string, string>>({})
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
        <h2 className="text-xl font-bold text-status-down mb-2">Error Loading Market Data</h2>
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

  const allAssets = [
    { id: "bitcoin", name: "Bitcoin" },
    { id: "ethereum", name: "Ethereum" },
    { id: "tether", name: "Tether" },
    { id: "binancecoin", name: "BNB" },
    { id: "solana", name: "Solana" },
    { id: "usd-coin", name: "USDC" },
    { id: "ripple", name: "XRP" },
    { id: "dogecoin", name: "Dogecoin" },
    { id: "toncoin", name: "Toncoin" },
    { id: "cardano", name: "Cardano" },
  ]

  const filteredAssets = allAssets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    asset.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
        <input 
          id="market-search"
          type="text" 
          placeholder="Search by coin name or symbol..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1E2329]/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-binance-yellow/50 transition-colors"
        />
      </div>

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

      {loading && !data ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-16 bg-bg-card/40 border border-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-10 text-white/40">No assets found matching "{searchQuery}"</div>
          ) : (
            filteredAssets.map(asset => {
              const priceData = data?.[asset.id]
              if (!priceData) {
                return (
                  <div key={asset.id} className="flex items-center justify-between p-4 bg-bg-card/20 border border-white/5 rounded-lg opacity-50">
                    <div>
                      <h4 className="font-bold text-white text-lg">{asset.name}</h4>
                      <span className="text-xs text-white/40 uppercase tracking-widest">{asset.id}</span>
                    </div>
                    <p className="text-sm italic text-white/40">Data unavailable</p>
                  </div>
                )
              }
              
              return (
                <MarketRow
                  key={asset.id}
                  asset_id={asset.id}
                  asset_name={asset.name}
                  usd={priceData.usd}
                  usd_24h_change={priceData.usd_24h_change}
                  initialIsStarred={!!watchlist[asset.id]}
                  initialWatchlistId={watchlist[asset.id]}
                />
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
