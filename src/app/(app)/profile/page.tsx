import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import ProfileActions from "./ProfileActions"
import AvatarUpload from "@/components/AvatarUpload"
import ProfileSettings from "@/components/ProfileSettings"

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
        <h1 className="glitch text-3xl font-bold text-white mb-8" data-text="Account Profile">
          <span className="cyber-title">Account Profile</span>
        </h1>
      
      <div className="cyber-panel cyber-corners relative rounded-2xl overflow-hidden">
        <div className="corner" />
        <div className="p-8">
          <div className="flex items-center gap-6">
            <AvatarUpload initialImage={user.image} initialLetter={initial} />
            <div>
              <h2 className="text-2xl font-semibold text-white break-all">{user.email}</h2>
              <p className="text-white/40 mt-1">Member since {joinDate}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-neon-cyan/10 bg-white/[0.02] p-8">
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="cyber-label mb-4">Statistics</h3>
              <Link 
                href="/watchlist"
                className="flex items-center justify-between p-4 rounded-xl bg-bg-light border border-neon-cyan/15 hover:border-neon-cyan/50 hover:shadow-[0_0_18px_rgba(34,197,94,0.2)] transition-all group h-16"
              >
                <span className="text-white/80">Watchlist Assets</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-semibold neon-text group-hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">{user._count.watchlists}</span>
                </div>
              </Link>
            </div>
            <div>
              <h3 className="cyber-label mb-4">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <Link 
                  href="/watchlist"
                  className="flex items-center justify-between p-3 rounded-lg bg-bg-light border border-neon-cyan/15 hover:border-neon-cyan/50 transition-all group"
                >
                  <span className="text-sm text-white/80">Manage Watchlist</span>
                  <span className="text-white/20 group-hover:text-neon-cyan/70 transition-colors">→</span>
                </Link>
                <Link 
                  href="/alerts"
                  className="flex items-center justify-between p-3 rounded-lg bg-bg-light border border-neon-cyan/15 hover:border-neon-cyan/50 transition-all group"
                >
                  <span className="text-sm text-white/80">Surveillance Log</span>
                  <span className="text-white/20 group-hover:text-neon-cyan/70 transition-colors">→</span>
                </Link>
              </div>
            </div>
          </div>

          <div>
            <h3 className="cyber-label mb-2">Account Actions</h3>
            <ProfileActions />
          </div>

          <div className="mt-8">
            <ProfileSettings />
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
