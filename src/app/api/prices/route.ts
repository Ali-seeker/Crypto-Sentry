import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { logger } from "@/lib/logger"

export const dynamic = "force-dynamic"

// Recency window for showing an asset as ALERT on price cards.
// Mirrors the engine's recent-detection intent (1-min cooldown) but is
// generous enough to keep a card flagged for a short while after a crash/spike
// is written to the DB. The engine cache itself only flags the current cycle,
// so this overlay is what keeps Dashboard/Watchlist badges truthful.
const ACTIVE_ALERT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

// Map of asset_id -> alert_type for alerts detected within the active window.
async function getActiveAlertMap(): Promise<Map<string, "CRASH" | "SPIKE">> {
  const map = new Map<string, "CRASH" | "SPIKE">()
  try {
    const recent = await prisma.cryptoAlert.findMany({
      where: { detected_at: { gte: new Date(Date.now() - ACTIVE_ALERT_WINDOW_MS) } },
      orderBy: { detected_at: "desc" },
      select: { asset_id: true, alert_type: true },
    })
    for (const alert of recent) {
      if (!map.has(alert.asset_id)) {
        map.set(alert.asset_id, alert.alert_type as "CRASH" | "SPIKE")
      }
    }
  } catch (error) {
    logger.warn("PricesAPI", "Failed to load active alert overlay", {
      error: error instanceof Error ? error.message : String(error),
    })
  }
  return map
}

type PriceEntry = { status?: string; alert_type?: string }

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
    } catch (error: unknown) {
      logger.warn("PricesAPI", "Express cache unreachable or timed out", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      clearTimeout(timeoutId)
    }

    if (liveData) {
      const ageMs = Date.now() - liveData.timestamp
      if (ageMs < 60000) {
        const activeAlerts = await getActiveAlertMap()
        let finalPrices = liveData.prices
        if (requestedIds) {
          finalPrices = {}
          Array.from(requestedIds).forEach((id) => {
            if (liveData.prices[id]) {
              finalPrices[id] = liveData.prices[id]
            }
          })
        }
        // Overlay recent DB alert status onto the engine data so cards show
        // ALERT/CRITICAL for a short window after a real detected crash/spike.
        for (const [id, entry] of Object.entries(finalPrices as Record<string, PriceEntry>)) {
          const type = activeAlerts.get(id)
          if (type) {
            entry.status = "alert"
            entry.alert_type = type
          }
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
    const stalePrices: Record<string, {
      name: string
      usd: number
      usd_24h_change?: number
      image?: string
      status: string
      alert_type?: string
    }> = {}
    
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
          status: "stable", // fallback entries default to stable
          alert_type: alert.alert_type,
        }
      }
    })

    // These rows are the recent alerts themselves — surface them as ALERT.
    const activeAlerts = await getActiveAlertMap()
    for (const [id, entry] of Object.entries(stalePrices)) {
      const type = activeAlerts.get(id)
      if (type) {
        entry.status = "alert"
        entry.alert_type = type
      }
    }

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
