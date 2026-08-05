import express from "express"
import prisma from "./src/lib/prisma"
import { fetchMarketData } from "./src/lib/engine/coingecko"
import { FlashCrashDetector } from "./src/lib/engine/flashCrashDetector"
import { MemoryCache } from "./src/lib/engine/memoryCache"
import { readSensitivity, describeSensitivity } from "./src/lib/sensitivityFile"
import { logger } from "./src/lib/logger"

const app = express()
const PORT = process.env.PORT || 4000

const cache = new MemoryCache()
const detector = new FlashCrashDetector()
let lastFetchSuccess = false
const serverStartTime = Date.now()

async function executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 2, delayMs = 500): Promise<T> {
  let retryCount = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      retryCount++;
      if (retryCount >= maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

async function pollMarketData() {
  try {
    const monitored = await prisma.monitoredAsset.findMany({
      select: { asset_id: true },
    })
    const allIds = monitored.map((a) => a.asset_id)
    
    if (allIds.length === 0) {
      logger.info("SurveillanceEngine", "No monitored assets found in DB")
      return
    }

    const rawData = await fetchMarketData(allIds)

    // Read the live Critical Sensitivity from the shared store (set via the
    // Settings page → /api/settings/threshold). Falls back to the default 2.0%.
    const thresholdPct = await readSensitivity()
    const allAlerts = detector.checkForCrashes(rawData, thresholdPct)

    // Fetch all watchlist items to filter alerts
    const watchlistItems = await prisma.watchlist.findMany({
      select: { asset_id: true }
    })
    const watchlistSet = new Set(watchlistItems.map(item => item.asset_id))

    // Only keep alerts for coins that are in someone's watchlist
    const alerts = allAlerts.filter(alert => watchlistSet.has(alert.asset_id))

    // Write alerts to DB
    for (const alert of alerts) {
      try {
        await executeWithRetry(async () => {
          await prisma.cryptoAlert.create({
            data: {
              asset_id: alert.asset_id,
              asset_name: alert.asset_name,
              price_at_drop: alert.price_at_drop,
              drop_percentage: alert.drop_percentage,
              alert_type: alert.alert_type,
            },
          })
        })
      } catch (dbError: unknown) {
        logger.error("SurveillanceEngine", "Failed to write alert", { 
          asset_id: alert.asset_id, 
          error: dbError instanceof Error ? dbError.message : String(dbError) 
        })
      }
    }

    // Update Cache
    const alertMap = new Map<string, "CRASH" | "SPIKE">()
    alerts.forEach((a) => alertMap.set(a.asset_id, a.alert_type))
    cache.update(rawData, alertMap)
    lastFetchSuccess = true

    const assetsCount = Object.keys(rawData).length
    logger.info("SurveillanceEngine", "Polling cycle completed", {
      assets_fetched: assetsCount,
      alerts_triggered: alerts.length,
      threshold_pct: describeSensitivity(thresholdPct),
    })
  } catch (error) {
    lastFetchSuccess = false
    logger.error("SurveillanceEngine", "Polling cycle failed", { error: (error as Error).message })
  }
}

// Routes
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: Math.floor((Date.now() - serverStartTime) / 1000),
    cache_age_ms: cache.getCacheAgeMs(),
    last_fetch_success: lastFetchSuccess,
    is_stale: cache.isStale(),
    memory_rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
  })
})

app.get("/cache", (req, res) => {
  const data = cache.getCache()
  if (!data) {
    return res.status(503).json({ error: "Cache not initialized yet" })
  }
  res.json(data)
})

app.post("/debug/simulate-crash", (req, res) => {
  const asset_id = req.query.asset_id as string || "bitcoin"
  detector.simulateCrash(asset_id)
  res.json({ success: true, message: `Simulated high baseline for ${asset_id}. Next tick will trigger a CRASH alert.` })
})

app.post("/debug/simulate-spike", (req, res) => {
  const asset_id = req.query.asset_id as string || "bitcoin"
  detector.simulateSpike(asset_id)
  res.json({ success: true, message: `Simulated low baseline for ${asset_id}. Next tick will trigger a SPIKE alert.` })
})

// Start server
app.listen(PORT, () => {
  logger.info("SurveillanceEngine", `Surveillance engine running on port ${PORT}`)
  logger.info("SurveillanceEngine", `Debug endpoint available at POST /debug/simulate-crash`)
  
  // Initial fetch immediately
  pollMarketData()
  
  // 30 seconds interval
  setInterval(pollMarketData, 30000)
})
