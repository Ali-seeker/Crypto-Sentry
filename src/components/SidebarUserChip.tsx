"use client"

import { useSession, signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

// Compact user identity chip for the sidebar.
// NOTE: profile photos are stored server-side but only exposed via the
// authenticated /api/user/image POST route (no GET), so we render the
// initial letter as a fallback here rather than adding a new endpoint.
export default function SidebarUserChip() {
  const { data: session } = useSession()

  if (!session?.user) return null

  const email = session.user.email || "Operator"
  const initial = email.charAt(0).toUpperCase()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    window.location.href = "/login"
  }

  return (
    <div className="mt-auto">
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-neon-cyan/15 bg-bg-card/40">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-cyan to-accent-teal text-black flex items-center justify-center text-sm font-bold">
            {initial}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-neon-green border-2 border-bg-void shadow-[0_0_6px_rgba(57,255,20,0.9)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{email}</p>
          <p className="cyber-label">Online</p>
        </div>
        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="p-2 rounded-lg text-white/50 hover:text-neon-red hover:bg-neon-red/10 transition-all duration-200"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  )
}