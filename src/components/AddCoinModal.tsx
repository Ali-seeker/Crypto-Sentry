"use client"

import { useState, useEffect } from "react"
import { Search, X, Loader2, Plus, Check } from "lucide-react"

export default function AddCoinModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
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

  const handleAddCoin = async (coin: any) => {
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#1E2329] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Add New Coin</h2>
          <button 
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {addedMessage ? (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-binance-yellow/20 text-binance-yellow rounded-full flex items-center justify-center">
                <Check size={32} />
              </div>
              <p className="text-lg font-semibold text-white">{addedMessage}</p>
            </div>
          ) : (
            <>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search CoinGecko (e.g. Bitcoin)..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-binance-yellow/50 transition-colors"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12 text-white/50">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="ml-3">Searching...</span>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((coin) => (
                    <div key={coin.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                      <div className="flex items-center gap-3">
                        {coin.thumb && (
                          <img src={coin.thumb} alt={coin.name} className="w-8 h-8 rounded-full" />
                        )}
                        <div>
                          <h4 className="font-bold text-white leading-tight">{coin.name}</h4>
                          <span className="text-xs text-white/40 uppercase">{coin.symbol}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddCoin(coin)}
                        disabled={adding === coin.id}
                        className="px-4 py-2 bg-binance-yellow/10 text-binance-yellow font-bold text-sm rounded-lg hover:bg-binance-yellow hover:text-black transition-colors disabled:opacity-50 flex items-center gap-2 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        {adding === coin.id ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              ) : query.length > 0 ? (
                <div className="text-center py-12 text-white/40">
                  No coins found matching "{query}"
                </div>
              ) : (
                <div className="text-center py-12 text-white/20 flex flex-col items-center">
                  <Search size={32} className="mb-3 opacity-50" />
                  <p>Type to search real-time CoinGecko database.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
