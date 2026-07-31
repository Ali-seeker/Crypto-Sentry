import prisma from "@/lib/prisma"
import AlertLog from "@/components/AlertLog"
import AlertFilters from "@/components/AlertFilters"
import { ShieldAlert } from "lucide-react"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: { assetId?: string; timeRange?: string; severity?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/login")
  }

  const watchlists = await prisma.watchlist.findMany({
    where: { user_id: session.user.id },
    select: { asset_id: true }
  })
  const assetIds = watchlists.map(w => w.asset_id)

  const whereClause: any = {
    asset_id: { in: assetIds }
  }

  if (searchParams.assetId) {
    whereClause.asset_id = searchParams.assetId
  }

  if (searchParams.timeRange) {
    const now = new Date()
    if (searchParams.timeRange === "24h") {
      whereClause.detected_at = { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
    } else if (searchParams.timeRange === "7d") {
      whereClause.detected_at = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    } else if (searchParams.timeRange === "30d") {
      whereClause.detected_at = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
    }
  }

  if (searchParams.severity) {
    if (searchParams.severity === "minor") {
      // Minor: absolute value between 2 and 3
      whereClause.AND = [
        { OR: [{ drop_percentage: { gte: 2, lt: 3 } }, { drop_percentage: { lte: -2, gt: -3 } }] }
      ]
    } else if (searchParams.severity === "major") {
      // Major: absolute value between 3 and 5
      whereClause.AND = [
        { OR: [{ drop_percentage: { gte: 3, lt: 5 } }, { drop_percentage: { lte: -3, gt: -5 } }] }
      ]
    } else if (searchParams.severity === "severe") {
      // Severe: absolute value >= 5
      whereClause.AND = [
        { OR: [{ drop_percentage: { gte: 5 } }, { drop_percentage: { lte: -5 } }] }
      ]
    }
  }

  const alerts = await prisma.cryptoAlert.findMany({
    where: whereClause,
    orderBy: { detected_at: "desc" },
    take: 50,
  })

  // Fetch live images from engine cache
  let pricesCache: any = {}
  try {
    const res = await fetch("http://localhost:4000/cache", { next: { revalidate: 60 } })
    if (res.ok) {
      const data = await res.json()
      if (data && data.prices) {
        pricesCache = data.prices
      }
    }
  } catch (e) {
    // Engine might be down, ignore
  }

  return (
    <div className="min-h-screen p-6 md:p-10 bg-bg-dark text-white relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-status-down/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2 text-status-down">
              <ShieldAlert size={28} />
              <span className="font-mono text-sm tracking-widest uppercase">Surveillance Log</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Alert History</h1>
          </div>
        </header>

        <main>
          {assetIds.length > 0 && <AlertFilters assets={assetIds} />}
          
          {assetIds.length === 0 ? (
            <div className="text-center py-20 border border-white/10 rounded-xl bg-bg-card/40 backdrop-blur-md">
              <ShieldAlert size={48} className="mx-auto text-white/20 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No assets in your Watchlist</h2>
              <p className="text-white/60">Star some assets on Dashboard or Market to see their alerts here.</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-20 border border-white/10 rounded-xl bg-bg-card/40 backdrop-blur-md">
              <ShieldAlert size={48} className="mx-auto text-white/20 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No flash crashes detected yet</h2>
              <p className="text-white/60">The system is watching. All clear.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <AlertLog
                  key={alert.id}
                  asset_id={alert.asset_id}
                  asset_name={alert.asset_name}
                  price_at_drop={alert.price_at_drop}
                  drop_percentage={alert.drop_percentage}
                  alert_type={alert.alert_type}
                  image={pricesCache[alert.asset_id]?.image}
                  detected_at={alert.detected_at}
                  index={index}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
