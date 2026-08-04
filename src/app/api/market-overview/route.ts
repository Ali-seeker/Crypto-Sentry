import { NextResponse } from "next/server"

interface MarketOverviewData {
  totalMarketCap: number
  totalVolume: number
  marketCapChange24h: number
}

// Simple in-memory cache
let cachedData: MarketOverviewData | null = null
let cacheTimestamp: number = 0
const CACHE_TTL = 60 * 1000 // 60 seconds

export const dynamic = "force-dynamic"

export async function GET() {
  const now = Date.now()

  if (cachedData && now - cacheTimestamp < CACHE_TTL) {
    return NextResponse.json(cachedData)
  }

  try {
    const res = await fetch("https://api.coingecko.com/api/v3/global", {
      next: { revalidate: 60 }
    })
    
    if (!res.ok) {
      // Fallback to cache if available, even if stale
      if (cachedData) return NextResponse.json(cachedData)
      throw new Error("Failed to fetch global market data")
    }

    const json = await res.json()
    
    cachedData = {
      totalMarketCap: json.data.total_market_cap.usd,
      totalVolume: json.data.total_volume.usd,
      marketCapChange24h: json.data.market_cap_change_percentage_24h_usd
    }
    cacheTimestamp = now

    return NextResponse.json(cachedData)
  } catch {
    if (cachedData) return NextResponse.json(cachedData)
    return NextResponse.json({ error: "Failed to fetch market overview" }, { status: 500 })
  }
}
