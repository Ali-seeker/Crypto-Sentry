import { logger } from "@/lib/logger"
export const ASSETS = [
  "bitcoin",
  "ethereum",
  "tether",
  "binancecoin",
  "ripple",
  "usd-coin",
  "solana",
  "tron",
  "cardano",
  "polkadot",
]

export interface CoinGeckoResponse {
  [key: string]: {
    usd: number
    usd_24h_change: number
    image: string
  }
}

export async function fetchMarketData(): Promise<CoinGeckoResponse> {
  const COINGECKO_API_URL = "https://api.coingecko.com/api/v3"
  const url = `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&ids=${ASSETS.join(",")}`
  const rawData = await fetchWithRetry(url)
  
  // Map array response to dictionary format
  const formatted: CoinGeckoResponse = {}
  for (const coin of rawData) {
    formatted[coin.id] = {
      usd: coin.current_price,
      usd_24h_change: coin.price_change_percentage_24h || 0,
      image: coin.image,
    }
  }
  return formatted
}

async function fetchWithRetry(url: string, retries = 3, attempt = 0): Promise<any[]> {
  try {
    const response = await fetch(url)

    if (response.status === 429) {
      if (attempt >= retries) {
        throw new Error("Rate limited (429) and max retries exceeded.")
      }
      const waitTime = Math.pow(2, attempt) * 1000
      logger.warn("CoinGecko", `429 Rate Limit. Retrying in ${waitTime}ms (Attempt ${attempt + 1})`, { attempt, retries })
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      return fetchWithRetry(url, retries, attempt + 1)
    }

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (attempt >= retries) {
      logger.error("CoinGecko", `Fetch failed after ${retries} retries`, { error: (error as Error).message })
      throw error
    }
    const waitTime = Math.pow(2, attempt) * 1000
    logger.error("CoinGecko", `Network Error: ${(error as Error).message}. Retrying in ${waitTime}ms...`, { attempt, retries })
    await new Promise((resolve) => setTimeout(resolve, waitTime))
    return fetchWithRetry(url, retries, attempt + 1)
  }
}
