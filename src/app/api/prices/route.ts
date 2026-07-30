import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

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
      const response = await fetch("http://localhost:4000/cache", {
        signal: controller.signal,
        cache: "no-store", // Don't cache on Next.js side
      })
      if (response.ok) {
        liveData = await response.json()
      }
    } catch (e) {
      console.warn("Express cache unreachable or timed out")
    } finally {
      clearTimeout(timeoutId)
    }

    if (liveData) {
      const ageMs = Date.now() - liveData.timestamp
      if (ageMs < 60000) {
        let finalPrices = liveData.prices
        if (requestedIds) {
          finalPrices = {}
          for (const id of requestedIds) {
            if (liveData.prices[id]) {
              finalPrices[id] = liveData.prices[id]
            }
          }
        }
        return NextResponse.json({
          source: "live",
          stale: false,
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
    latestAlerts.forEach((alert) => {
      if (requestedIds && !requestedIds.has(alert.asset_id)) return
      if (!stalePrices[alert.asset_id]) {
        stalePrices[alert.asset_id] = {
          usd: alert.price_at_drop,
          usd_24h_change: 0,
          status: "stable", // It's stale, don't show active alert status
        }
      }
    })

    return NextResponse.json({
      source: "database",
      stale: true,
      prices: stalePrices,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve prices" },
      { status: 500 }
    )
  }
}
