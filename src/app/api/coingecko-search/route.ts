import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json({ coins: [] })
    }

    const COINGECKO_API_URL = "https://api.coingecko.com/api/v3"
    const apiKey = process.env.COINGECKO_API_KEY
    
    let url = `${COINGECKO_API_URL}/search?query=${encodeURIComponent(query)}`
    if (apiKey) {
      url += `&x_cg_demo_api_key=${apiKey}`
    }

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`CoinGecko search failed: ${res.statusText}`)
    }

    const data = await res.json()
    // Return the top 10 matches to keep the modal clean
    const coins: Array<{ id: string; name: string; symbol: string; thumb?: string }> = data.coins || []
    const topMatches = coins.slice(0, 10)

    return NextResponse.json({ coins: topMatches })
  } catch (error: unknown) {
    console.error("CoinGecko Search Error:", error)
    return NextResponse.json({ error: "Failed to search coins" }, { status: 500 })
  }
}
