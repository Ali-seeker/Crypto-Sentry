"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Filter } from "lucide-react"

interface AlertFiltersProps {
  assets: string[]
}

export default function AlertFilters({ assets }: AlertFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentAsset = searchParams.get("assetId") || "All"
  const currentTime = searchParams.get("timeRange") || "all"
  const currentSeverity = searchParams.get("severity") || "all"

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "All" || value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-bg-card/40 border border-white/10 p-4 rounded-xl mb-6">
      <div className="flex items-center gap-2 text-white/60 mr-2">
        <Filter size={18} />
        <span className="text-sm font-semibold uppercase tracking-wider">Filters</span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-white/40 uppercase">Asset</label>
        <select
          value={currentAsset}
          onChange={(e) => updateFilters("assetId", e.target.value)}
          className="bg-bg-dark border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-binance-yellow text-white"
        >
          <option value="All">All Watchlist</option>
          {assets.map((a) => (
            <option key={a} value={a}>
              {a.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-white/40 uppercase">Time</label>
        <select
          value={currentTime}
          onChange={(e) => updateFilters("timeRange", e.target.value)}
          className="bg-bg-dark border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-binance-yellow text-white"
        >
          <option value="all">All time</option>
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-white/40 uppercase">Severity</label>
        <select
          value={currentSeverity}
          onChange={(e) => updateFilters("severity", e.target.value)}
          className="bg-bg-dark border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-binance-yellow text-white"
        >
          <option value="all">All</option>
          <option value="minor">Minor (2-3%)</option>
          <option value="major">Major (3-5%)</option>
          <option value="severe">Severe (5%+)</option>
        </select>
      </div>
    </div>
  )
}
