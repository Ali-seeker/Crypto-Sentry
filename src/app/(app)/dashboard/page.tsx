import prisma from "@/lib/prisma"
import LivePriceGrid from "@/components/LivePriceGrid"
import { ShieldAlert } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  // Simple server-side initial fetch to show some static context if desired
  const totalAlerts = await prisma.cryptoAlert.count()

  return (
    <div className="min-h-screen p-6 md:p-10 bg-bg-dark text-white relative">
      {/* Background decorations matching the Binance theme */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-binance-yellow/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-status-up/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2 text-binance-yellow">
              <ShieldAlert size={28} />
              <span className="font-mono text-sm tracking-widest uppercase">Surveillance Terminal</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <div id="dashboard-stats" className="text-sm font-medium text-white/50">
            Total lifetime alerts recorded: <span className="text-white">{totalAlerts}</span>
          </div>
        </header>

        <main>
          <LivePriceGrid />
        </main>
      </div>
    </div>
  )
}
