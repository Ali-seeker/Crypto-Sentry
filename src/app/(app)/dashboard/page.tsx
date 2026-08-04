import prisma from "@/lib/prisma"
import LivePriceGrid from "@/components/LivePriceGrid"
import LiveIndicator from "@/components/LiveIndicator"
import MarketOverview from "@/components/MarketOverview"
import AlertFeed from "@/components/AlertFeed"
import SentryAnalytics from "@/components/SentryAnalytics"
import { ShieldAlert, Activity } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  // Simple server-side initial fetch to show some static context if desired
  const totalAlerts = await prisma.cryptoAlert.count()

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent text-white relative">
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neon-cyan/15 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2 text-neon-cyan">
              <ShieldAlert size={28} className="drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <span className="cyber-label">Surveillance Terminal</span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="glitch text-4xl font-bold tracking-tight" data-text="Dashboard">
                <span className="cyber-title">Dashboard</span>
              </h1>
              <LiveIndicator />
            </div>
          </div>
          <div id="dashboard-stats" className="font-mono text-sm font-medium text-white/50">
            Total lifetime alerts recorded:{" "}
            <span className="neon-text font-bold">{totalAlerts}</span>
          </div>
        </header>

        <main className="space-y-6">
          {/* Market overview stat row — shared with the Market page */}
          <MarketOverview />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AlertFeed />
            </div>
            <SentryAnalytics />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Activity size={16} className="text-neon-cyan" />
            <h2 className="cyber-label">Monitored Assets</h2>
          </div>
          <LivePriceGrid />
        </main>
      </div>
    </div>
  )
}
