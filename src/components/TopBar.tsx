"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { emitSearch } from "@/lib/searchEvents"

// Command/search bar + network status strip fixed below the price ticker.
// On asset-list pages (Dashboard / Watchlist / Market) typing live-filters the
// visible grid via a global event. On other pages (Profile/Settings/Alerts),
// Enter jumps to the Market page and applies the query there. Reuses the
// existing client-side filtering already built into the grids.
export default function TopBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState("")

  const liveFilter = pathname === "/dashboard" || pathname === "/watchlist" || pathname === "/market"
  const queryParam = query.trim()

  const onChange = (value: string) => {
    setQuery(value)
    if (liveFilter) emitSearch(value)
  }

  const onSubmit = () => {
    if (!queryParam) return
    if (liveFilter) {
      // Already filtering live; nothing else to do.
      return
    }
    router.push(`/market?q=${encodeURIComponent(queryParam)}`)
  }

  return (
    <div className="fixed top-9 left-0 right-0 z-20 h-12 flex items-center gap-4 px-4 md:px-6 border-b border-neon-cyan/10 bg-[#070a12]/85 backdrop-blur-md">
      <form
        className="flex-1 flex items-center gap-3 max-w-xl"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <Search size={16} className="text-neon-cyan/60 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search Assets, Protocols or TX IDs…"
          className="w-full bg-transparent text-sm text-white/70 placeholder-white/30 focus:outline-none"
        />
        {liveFilter && queryParam && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              emitSearch("")
            }}
            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-neon-cyan"
          >
            Clear
          </button>
        )}
      </form>

      <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neon-green shrink-0">
        <span className="relative flex w-2 h-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-60" />
          <span className="relative inline-flex rounded-full w-2 h-2 bg-neon-green shadow-[0_0_8px_rgba(57,255,20,0.9)]" />
        </span>
        Mainnet Operational
      </div>
    </div>
  )
}