import express from "express"
import prisma from "./src/lib/prisma"
import { fetchMarketData } from "./src/lib/engine/coingecko"
import { FlashCrashDetector } from "./src/lib/engine/flashCrashDetector"
import { MemoryCache } from "./src/lib/engine/memoryCache"

const app = express()
const PORT = process.env.PORT || 4000

const cache = new MemoryCache()
const detector = new FlashCrashDetector()
let lastFetchSuccess = false
const serverStartTime = Date.now()

async function pollMarketData() {
  try {
    const rawData = await fetchMarketData()
    const alerts = detector.checkForCrashes(rawData)

    // Write alerts to DB
    for (const alert of alerts) {
      try {
        await prisma.cryptoAlert.create({
          data: {
            asset_id: alert.asset_id,
            asset_name: alert.asset_name,
            price_at_drop: alert.price_at_drop,
            drop_percentage: alert.drop_percentage,
          },
        })
      } catch (dbError) {
        console.error(`[DB Error] Failed to write alert for ${alert.asset_name}:`, dbError)
      }
    }

    // Update Cache
    const alertedIds = new Set(alerts.map((a) => a.asset_id))
    cache.update(rawData, alertedIds)
    lastFetchSuccess = true

    const timestamp = new Date().toISOString()
    const assetsCount = Object.keys(rawData).length
    console.log(`[${timestamp}] Polling Cycle OK: ${assetsCount} assets fetched, ${alerts.length} alerts triggered.`)
  } catch (error) {
    lastFetchSuccess = false
    console.error(`[Polling Error] Cycle failed:`, (error as Error).message)
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
  // Simulates a crash for Bitcoin
  detector.simulateCrash("bitcoin")
  res.json({ success: true, message: "Simulated 5% high baseline for Bitcoin. Next tick will trigger an alert." })
})

// Start server
app.listen(PORT, () => {
  console.log(`Surveillance engine running on port ${PORT}`)
  console.log(`Debug endpoint available at POST /debug/simulate-crash`)
  
  // Initial fetch immediately
  pollMarketData()
  
  // 30 seconds interval
  setInterval(pollMarketData, 30000)
})
