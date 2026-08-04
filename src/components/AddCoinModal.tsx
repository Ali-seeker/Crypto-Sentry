"use client"

import { useState, useEffect } from "react"
import { Search, X, Loader2, Plus, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface CoinResult {
  id: string
  name: string
  symbol: string
  thumb?: string
}

export default function AddCoinModal({ isOpen, onClose, existingAssetIds = [] }: { isOpen: boolean; onClose: () => void; existingAssetIds?: string[] }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CoinResult[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const [addedMessage, setAddedMessage] = useState<string | null>(null)

  // Debounced search
  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/coingecko-search?query=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.coins || [])
        }
      } catch (e) {
        console.error("Search failed", e)
      } finally {
        setLoading(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [query])

  const handleAddCoin = async (coin: CoinResult) => {
    setAdding(coin.id)
    try {
      const res = await fetch("/api/monitored-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset_id: coin.id }),
      })
      if (res.ok) {
        setAddedMessage(`Successfully added ${coin.name}. It will appear in the engine feed in ~30s.`)
        setTimeout(() => {
          setAddedMessage(null)
          onClose()
        }, 4000)
      } else {
        alert("Failed to add coin.")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAdding(null)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="cyber-panel cyber-corners relative w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
        <div className="corner" />
        {/* Header */}
        <div className="px-6 py-5 border-b border-neon-cyan/15 flex items-center justify-between">
          <h2 className="cyber-title text-xl font-bold">Add New Coin</h2>
          <button 
            onClick={onClose}
            className="p-2 text-white/50 hover:text-neon-cyan rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {addedMessage ? (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/40 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                <Check size={32} />
              </div>
              <p className="text-lg font-semibold text-white">{addedMessage}</p>
            </div>
          ) : (
            <>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-cyan/50" size={20} />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search CoinGecko (e.g. Bitcoin)..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-neon-cyan/60 focus:shadow-[0_0_18px_rgba(34,197,94,0.2)] transition-all"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12 text-white/50">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="ml-3">Searching...</span>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((coin) => {
                    const isAlreadyAdded = existingAssetIds.includes(coin.id)
                    
                    return (
                    <div key={coin.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-neon-cyan/20 group">
                      <div className="flex items-center gap-3">
                        {coin.thumb && (
                          <img src={coin.thumb} alt={coin.name} className="w-8 h-8 rounded-full border border-neon-cyan/20" />
                        )}
                        <div>
                          <h4 className="font-bold text-white leading-tight">{coin.name}</h4>
                          <span className="cyber-label">{coin.symbol}</span>
                        </div>
                      </div>
                      {isAlreadyAdded ? (
                        <div className="px-4 py-2 text-white/50 text-sm font-semibold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Check size={16} className="text-neon-cyan" />
                          <span>Already Added</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddCoin(coin)}
                          disabled={adding === coin.id}
                          className="px-4 py-2 bg-neon-cyan/10 text-neon-cyan font-bold text-sm rounded-lg hover:bg-neon-cyan hover:text-black transition-all disabled:opacity-50 flex items-center gap-2 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          {adding === coin.id ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                          Add
                        </button>
                      )}
                    </div>
                  )})}
                </div>
              ) : query.length > 0 ? (
                <div className="text-center py-12 text-white/40">
                  No coins found matching &quot;{query}&quot;
                </div>
              ) : (
                <div className="text-center py-12 text-white/20 flex flex-col items-center">
                  <Search size={32} className="mb-3 opacity-50 text-neon-cyan/40" />
                  <p>Type to search real-time CoinGecko database.</p>
                </div>
              )}
            </>
          )}
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
