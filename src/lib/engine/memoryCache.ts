import { CoinGeckoResponse } from "./coingecko"

export interface CachedMarketData {
  timestamp: number
  prices: Record<
    string,
    {
      usd: number
      usd_24h_change: number
      image: string
      status: "stable" | "alert"
      alert_type?: "CRASH" | "SPIKE"
    }
  >
}

export class MemoryCache {
  private cache: CachedMarketData | null = null
  private readonly MAX_AGE_MS = 60000 // 1 minute

  public update(prices: CoinGeckoResponse, alertsMap: Map<string, "CRASH" | "SPIKE">) {
    const formattedPrices: CachedMarketData["prices"] = {}

    for (const [assetId, data] of Object.entries(prices)) {
      const isAlert = alertsMap.has(assetId)
      formattedPrices[assetId] = {
        usd: data.usd,
        usd_24h_change: data.usd_24h_change,
        image: data.image,
        status: isAlert ? "alert" : "stable",
        alert_type: alertsMap.get(assetId),
      }
    }

    this.cache = {
      timestamp: Date.now(),
      prices: formattedPrices,
    }
  }

  public getCache(): CachedMarketData | null {
    return this.cache
  }

  public getCacheAgeMs(): number {
    if (!this.cache) return -1
    return Date.now() - this.cache.timestamp
  }

  public isStale(): boolean {
    if (!this.cache) return true
    return this.getCacheAgeMs() > this.MAX_AGE_MS
  }
}
