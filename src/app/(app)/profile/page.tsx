import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import ProfileActions from "./ProfileActions"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: { watchlists: true }
      }
    }
  })

  if (!user) {
    redirect("/login")
  }

  const initial = user.email.charAt(0).toUpperCase()
  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] w-full">
      <div className="w-full max-w-3xl mx-auto p-6 lg:p-12">
        <h1 className="text-3xl font-bold text-white mb-8">Account Profile</h1>
      
      <div className="bg-bg-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-binance-yellow text-bg-dark flex items-center justify-center text-4xl font-bold flex-shrink-0">
              {initial}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white break-all">{user.email}</h2>
              <p className="text-white/40 mt-1">Member since {joinDate}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 bg-white/[0.02] p-8">
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Statistics</h3>
              <Link 
                href="/watchlist"
                className="flex items-center justify-between p-4 rounded-xl bg-bg-light border border-white/5 hover:border-binance-yellow/30 transition-colors group h-16"
              >
                <span className="text-white/80">Watchlist Assets</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-semibold text-binance-yellow">{user._count.watchlists}</span>
                </div>
              </Link>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <Link 
                  href="/watchlist"
                  className="flex items-center justify-between p-3 rounded-lg bg-bg-light border border-white/5 hover:border-binance-yellow/30 transition-colors group"
                >
                  <span className="text-sm text-white/80">Manage Watchlist</span>
                  <span className="text-white/20 group-hover:text-binance-yellow/50 transition-colors">→</span>
                </Link>
                <Link 
                  href="/alerts"
                  className="flex items-center justify-between p-3 rounded-lg bg-bg-light border border-white/5 hover:border-binance-yellow/30 transition-colors group"
                >
                  <span className="text-sm text-white/80">Surveillance Log</span>
                  <span className="text-white/20 group-hover:text-binance-yellow/50 transition-colors">→</span>
                </Link>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-2">Account Actions</h3>
            <ProfileActions />
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
