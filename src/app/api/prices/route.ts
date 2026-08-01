import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { logger } from "@/lib/logger"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const idsParam = searchParams.get("ids")
    const requestedIds = idsParam ? new Set(idsParam.split(",")) : null

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2500) // 2.5s timeout

    let liveData
    try {
      const engineUrl = process.env.ENGINE_URL || "http://localhost:4000"
      const response = await fetch(`${engineUrl}/cache`, {
        signal: controller.signal,
        cache: "no-store", // Don't cache on Next.js side
      })
      if (response.ok) {
        liveData = await response.json()
      }
    } catch (e: any) {
      logger.warn("PricesAPI", "Express cache unreachable or timed out", { error: e.message })
    } finally {
      clearTimeout(timeoutId)
    }

    if (liveData) {
      const ageMs = Date.now() - liveData.timestamp
      if (ageMs < 60000) {
        let finalPrices = liveData.prices
        if (requestedIds) {
          finalPrices = {}
          Array.from(requestedIds).forEach((id) => {
            if (liveData.prices[id]) {
              finalPrices[id] = liveData.prices[id]
            }
          })
        }
        return NextResponse.json({
          source: "live",
          stale: false,
          ageMs: ageMs,
          prices: finalPrices,
        })
      }
    }

    // Fallback: Query DB to return last known prices if engine is down
    const latestAlerts = await prisma.cryptoAlert.findMany({
      orderBy: { detected_at: "desc" },
      take: 10,
    })

    // Try to construct a stale prices object from DB alerts
    const stalePrices: Record<string, any> = {}
    
    // Estimate age based on the most recent alert, or default to a high number if none exist
    const latestTimestamp = latestAlerts.length > 0 ? new Date(latestAlerts[0].detected_at).getTime() : Date.now() - 999999
    const dbAgeMs = Date.now() - latestTimestamp

    latestAlerts.forEach((alert) => {
      if (requestedIds && !requestedIds.has(alert.asset_id)) return
      if (!stalePrices[alert.asset_id]) {
        stalePrices[alert.asset_id] = {
          name: alert.asset_name,
          usd: alert.price_at_drop,
          usd_24h_change: 0,
          image: "",
          status: "stable", // It's stale, don't show active alert status
        }
      }
    })

    return NextResponse.json({
      source: "database",
      stale: true,
      ageMs: dbAgeMs,
      prices: stalePrices,
    })
  } catch (error) {
    logger.error("PricesAPI", "Prices GET error", { error: (error as Error).message })
    return NextResponse.json(
      { error: "Failed to retrieve prices", code: "PRICES_FETCH_FAILED" },
      { status: 500 }
    )
  }
}
