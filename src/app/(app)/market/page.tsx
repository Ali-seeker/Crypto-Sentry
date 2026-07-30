import MarketGrid from "@/components/MarketGrid"
import MarketOverview from "@/components/MarketOverview"
import LiveIndicator from "@/components/LiveIndicator"
import { Search } from "lucide-react"

export default function MarketPage() {
  return (
    <div className="min-h-screen p-6 md:p-10 bg-bg-dark text-white relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-binance-yellow/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2 text-binance-yellow">
              <Search size={28} />
              <span className="font-mono text-sm tracking-widest uppercase">Global Surveillance</span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold tracking-tight">Market Overview</h1>
              <LiveIndicator />
            </div>
          </div>
        </header>

        <main>
          <MarketOverview />
          <MarketGrid />
        </main>
      </div>
    </div>
  )
}
