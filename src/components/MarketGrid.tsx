"use client"
// Trigger HMR rebuild

import { useState, useEffect } from "react"
import { Search, Plus } from "lucide-react"
import { useSession } from "next-auth/react"
import { useWatchlistAction } from "@/hooks/useWatchlist"
import { Star, TrendingUp, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"
import AddCoinModal from "./AddCoinModal"
import AnimatedNumber from "./AnimatedNumber"
import Skeleton from "./Skeleton"
import { useSettings } from "./SettingsProvider"
import { pollIntervalFor } from "@/lib/clientSettings"
import { SEARCH_EVENT } from "@/lib/searchEvents"

// A simplified row component specifically for the market page
function MarketRow({ 
  asset_id, 
  asset_name, 
  usd, 
  usd_24h_change, 
  image,
  initialIsStarred,
  initialWatchlistId,
  index = 0
}: { asset_id: string; asset_name: string; usd: number; usd_24h_change: number; image: string; initialIsStarred: boolean; initialWatchlistId: string; index?: number }) {
  const { data: session } = useSession()
  const { isStarred, toggleStar } = useWatchlistAction(initialIsStarred, initialWatchlistId)
  const [imgError, setImgError] = useState(false)

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 30 }}
      whileHover={{ x: 6 }}
      className="cyber-panel cyber-corners relative flex items-center justify-between py-3 px-4 rounded-lg overflow-hidden group"
    >
      <div className="corner" />
      <div className="flex items-center gap-4 w-1/3">
        {session && (
          <motion.button
            id={index === 0 ? "watchlist-star" : undefined}
            onClick={(e) => {
              e.preventDefault()
              toggleStar(asset_id, asset_name)
            }}
            whileTap={{ scale: 1.5 }}
            className="hover:scale-110 transition-transform"
          >
            <Star
              size={18}
              fill={isStarred ? "currentColor" : "none"}
              className={isStarred ? "text-neon-cyan drop-shadow-[0_0_6px_rgba(34,197,94,0.9)]" : "text-white/30 hover:text-white/70"}
            />
          </motion.button>
        )}
        <div className="flex items-center gap-3">
          {image && !imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={image} 
              alt={asset_name} 
              className="w-8 h-8 rounded-full border border-neon-cyan/20"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white uppercase">
              {asset_name.charAt(0)}
            </div>
          )}
          <div>
            <h4 className="font-bold text-white text-lg capitalize">{asset_name}</h4>
            <span className="cyber-label">{asset_id}</span>
          </div>
        </div>
      </div>

      <div className="w-1/3 text-right font-mono text-lg font-bold text-white group-hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-300">
        $<AnimatedNumber value={(usd || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })} />
      </div>

      <div className={`w-1/3 flex items-center justify-end gap-1 font-semibold ${(usd_24h_change || 0) >= 0 ? "text-neon-green" : "text-neon-red"}`}>
        {(usd_24h_change || 0) >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
        <span>{Math.abs(usd_24h_change || 0).toFixed(2)}%</span>
      </div>
    </motion.div>
  )
}

export default function MarketGrid({ initialQuery = "" }: { initialQuery?: string }) {
  const [data, setData] = useState<Record<string, {name: string, usd: number, usd_24h_change: number, image: string, status: "stable" | "alert", alert_type?: "CRASH" | "SPIKE"}> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStale, setIsStale] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [ageMs, setAgeMs] = useState(0)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  const [watchlist, setWatchlist] = useState<Record<string, string>>({})
  const { data: session } = useSession()
  const { settings } = useSettings()
  const pollInterval = pollIntervalFor(settings)

  const fetchWatchlist = async () => {
    if (!session) return
    try {
      const res = await fetch("/api/watchlist")
      if (res.ok) {
        const items = await res.json()
        const wlMap: Record<string, string> = {}
        items.forEach((item: {asset_id: string; id: string}) => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWatchlist()
    fetchData()
    const interval = setInterval(fetchData, pollInterval)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, pollInterval])

  // TopBar global search → sync this grid's filter.
  useEffect(() => {
    const onSearch = (e: Event) => {
      setSearchQuery((e as CustomEvent<string>).detail ?? "")
    }
    window.addEventListener(SEARCH_EVENT, onSearch)
    return () => window.removeEventListener(SEARCH_EVENT, onSearch)
  }, [])

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

  const marketAssets = data ? Object.entries(data).map(([id, info]: [string, {name?: string, usd: number, usd_24h_change: number, image: string}]) => ({
    id,
    name: info.name || id,
    usd: info.usd,
    usd_24h_change: info.usd_24h_change,
    image: info.image,
  })) : []

  const filteredAssets = marketAssets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    asset.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-cyan/50" size={20} />
          <input 
            id="market-search"
            type="text" 
            placeholder="Search by coin name or symbol..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-neon-cyan/20 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-neon-cyan/60 focus:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all"
          />
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-neon-cyan to-neon-cyan text-black font-bold px-6 py-4 rounded-xl flex items-center gap-2 hover:shadow-[0_0_24px_rgba(34,197,94,0.4)] transition-all shrink-0"
        >
          <Plus size={20} />
          Add Coin
        </button>
      </div>

      {isStale && (
        <div className="bg-neon-amber/10 border border-neon-amber/30 text-neon-amber px-4 py-3 rounded-lg flex items-center gap-3 shadow-[0_0_16px_rgba(255,213,61,0.15)]">
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
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-10 text-white/40">No assets found matching &quot;{searchQuery}&quot;</div>
          ) : (
            filteredAssets.map((asset, index) => {
              return (
                <MarketRow
                  key={asset.id}
                  asset_id={asset.id}
                  asset_name={asset.name}
                  usd={asset.usd}
                  usd_24h_change={asset.usd_24h_change}
                  image={asset.image}
                  initialIsStarred={!!watchlist[asset.id]}
                  initialWatchlistId={watchlist[asset.id]}
                  index={index}
                />
              )
            })
          )}
        </div>
      )}
      
      <AddCoinModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        existingAssetIds={data ? Object.keys(data) : []}
      />
    </div>
  )
}
