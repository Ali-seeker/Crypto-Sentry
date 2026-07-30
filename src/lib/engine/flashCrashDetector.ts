export interface AlertRecord {
  asset_id: string
  asset_name: string
  price_at_drop: number
  drop_percentage: number
  alert_type: "CRASH" | "SPIKE"
}

const ASSET_NAMES: Record<string, string> = {
  bitcoin: "Bitcoin",
  ethereum: "Ethereum",
  tether: "Tether",
  binancecoin: "BNB",
  ripple: "XRP",
  "usd-coin": "USDC",
  solana: "Solana",
  tron: "TRON",
  cardano: "Cardano",
  polkadot: "Polkadot",
}

export class FlashCrashDetector {
  private baselines = new Map<string, number>()
  private lastAlertTime = new Map<string, number>()
  private readonly ALERT_COOLDOWN_MS = 60000 // 1 minute

  public getAssetName(asset_id: string): string {
    return ASSET_NAMES[asset_id] || asset_id
  }

  public checkForCrashes(currentPrices: Record<string, { usd: number }>): AlertRecord[] {
    const alerts: AlertRecord[] = []
    const now = Date.now()

    for (const [asset_id, data] of Object.entries(currentPrices)) {
      const currentPrice = data.usd
      const baselinePrice = this.baselines.get(asset_id)

      if (baselinePrice === undefined) {
        // First observation, set baseline and skip
        this.baselines.set(asset_id, currentPrice)
        continue
      }

      const dropPct = ((currentPrice - baselinePrice) / baselinePrice) * 100

      // Debug log (used to verify math and for the debug endpoint to trigger)
      console.log(`[FlashCrashDetector] ${this.getAssetName(asset_id)}: ${currentPrice} USD (Change: ${dropPct.toFixed(4)}%)`)

      const THRESHOLD = parseFloat(process.env.CRASH_THRESHOLD_PCT || "2.0")
      let alertType: "CRASH" | "SPIKE" | null = null
      if (dropPct <= -THRESHOLD) {
        alertType = "CRASH"
      } else if (dropPct >= THRESHOLD) {
        alertType = "SPIKE"
      }

      if (alertType) {
        const cooldownKey = `${asset_id}:${alertType}`
        const lastAlert = this.lastAlertTime.get(cooldownKey) || 0
        if (now - lastAlert > this.ALERT_COOLDOWN_MS) {
          alerts.push({
            asset_id,
            asset_name: this.getAssetName(asset_id),
            price_at_drop: currentPrice,
            drop_percentage: dropPct,
            alert_type: alertType,
          })
          this.lastAlertTime.set(cooldownKey, now)
        }
      }

      // Always update the rolling baseline
      this.baselines.set(asset_id, currentPrice)
    }

    return alerts
  }

  // Debug function to manually lower a baseline (making current price seem like a huge drop)
  // Or raise baseline so current price registers as a drop
  public simulateCrash(asset_id: string) {
    const currentBaseline = this.baselines.get(asset_id)
    if (currentBaseline) {
      // Artificially inflate the baseline by 5% so the next real reading looks like a 4.7%+ drop
      this.baselines.set(asset_id, currentBaseline * 1.05)
    } else {
      // If no baseline, fake a high one
      this.baselines.set(asset_id, 1000000)
    }
  }

  public simulateSpike(asset_id: string) {
    const currentBaseline = this.baselines.get(asset_id)
    if (currentBaseline) {
      // Artificially deflate the baseline by 5% so the next real reading looks like a spike
      this.baselines.set(asset_id, currentBaseline * 0.95)
    } else {
      // If no baseline, fake a low one
      this.baselines.set(asset_id, 0.0001)
    }
  }
}
