import MarketGrid from "@/components/MarketGrid"
import MarketOverview from "@/components/MarketOverview"
import LiveIndicator from "@/components/LiveIndicator"
import { Search } from "lucide-react"

export default function MarketPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent text-white relative">
      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neon-cyan/15 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2 text-neon-cyan">
              <Search size={28} className="drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <span className="cyber-label">Global Surveillance</span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="glitch text-4xl font-bold tracking-tight" data-text="Market Overview">
                <span className="cyber-title">Market Overview</span>
              </h1>
              <LiveIndicator />
            </div>
          </div>
        </header>

        <main>
          <MarketOverview />
          <MarketGrid initialQuery={searchParams.q ?? ""} />
        </main>
      </div>
    </div>
  )
}
