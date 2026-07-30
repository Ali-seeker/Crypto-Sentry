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
    <div className="min-h-screen p-6 md:p-10 bg-bg-dark text-white relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-binance-yellow/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-status-up/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2 text-binance-yellow">
              <Star size={28} fill="currentColor" />
              <span className="font-mono text-sm tracking-widest uppercase">Personal Feed</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Watchlist</h1>
          </div>
        </header>

        <main>
          {watchlist.length === 0 ? (
            <div className="text-center py-20 border border-white/10 rounded-xl bg-bg-card/40 backdrop-blur-md">
              <Star size={48} className="mx-auto text-white/20 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No assets starred yet</h2>
              <p className="text-white/60 mb-6">Build your custom surveillance feed by starring assets on the market page.</p>
              <Link href="/dashboard" className="px-6 py-3 bg-binance-yellow text-bg-dark font-bold rounded-lg hover:bg-binance-yellow-dark transition-colors">
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
