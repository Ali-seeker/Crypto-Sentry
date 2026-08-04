import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Star } from "lucide-react"
import Link from "next/link"
import WatchlistGrid from "@/components/WatchlistGrid"

export const dynamic = "force-dynamic"

export default async function WatchlistPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/login")
  }

  const watchlist = await prisma.watchlist.findMany({
    where: { user_id: session.user.id },
    orderBy: { added_at: "desc" },
  })

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent text-white relative">
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neon-cyan/15 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2 text-neon-cyan">
              <Star size={28} fill="currentColor" className="drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <span className="cyber-label">Personal Feed</span>
            </div>
            <h1 className="glitch text-4xl font-bold tracking-tight" data-text="Watchlist">
              <span className="cyber-title">Watchlist</span>
            </h1>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <button
              disabled
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neon-cyan/15 bg-white/[0.03] text-white/35 text-sm font-bold cursor-not-allowed"
            >
              Full Analysis
              <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-neon-amber/15 text-neon-amber border border-neon-amber/30">
                Soon
              </span>
            </button>
            <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">
              Engine Pending Deploy
            </span>
          </div>
        </header>

        <main>
          {watchlist.length === 0 ? (
            <div className="text-center py-20 border border-neon-cyan/15 rounded-xl bg-bg-card/40 backdrop-blur-md cyber-corners">
              <div className="corner" />
              <Star size={48} className="mx-auto text-neon-cyan/40 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No assets starred yet</h2>
              <p className="text-white/60 mb-6">Build your custom surveillance feed by starring assets on the market page.</p>
              <Link href="/dashboard" className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-cyan text-black font-bold rounded-lg hover:shadow-[0_0_24px_rgba(34,197,94,0.4)] transition-all">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <WatchlistGrid initialWatchlist={watchlist} />
          )}
        </main>
      </div>
    </div>
  )
}
