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
  }
}

export async function fetchMarketData(): Promise<CoinGeckoResponse> {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ASSETS.join(
    ","
  )}&vs_currencies=usd&include_24hr_change=true`
  return await fetchWithRetry(url)
}

async function fetchWithRetry(url: string, retries = 3, attempt = 0): Promise<CoinGeckoResponse> {
  try {
    const response = await fetch(url)

    if (response.status === 429) {
      if (attempt >= retries) {
        throw new Error("Rate limited (429) and max retries exceeded.")
      }
      const waitTime = Math.pow(2, attempt) * 1000
      console.warn(`[CoinGecko] 429 Rate Limit. Retrying in ${waitTime}ms (Attempt ${attempt + 1})`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      return fetchWithRetry(url, retries, attempt + 1)
    }

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (attempt >= retries) {
      console.error(`[CoinGecko] Fetch failed after ${retries} retries:`, error)
      throw error
    }
    const waitTime = Math.pow(2, attempt) * 1000
    console.error(`[CoinGecko] Network Error: ${(error as Error).message}. Retrying in ${waitTime}ms...`)
    await new Promise((resolve) => setTimeout(resolve, waitTime))
    return fetchWithRetry(url, retries, attempt + 1)
  }
}
