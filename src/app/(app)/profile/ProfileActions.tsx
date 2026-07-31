"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { LogOut, RotateCcw } from "lucide-react"

export default function ProfileActions() {
  const router = useRouter()
  const { update } = useSession()
  const [isRestarting, setIsRestarting] = useState(false)

  const handleRestartTour = async () => {
    setIsRestarting(true)
    try {
      await fetch("/api/user/guide-completed", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: false }),
      })
      await update({ guide_completed: false })
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to restart tour", error)
      setIsRestarting(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    window.location.href = "/login"
  }

  return (
    <div className="flex flex-col gap-4 mt-8">
      <button
        onClick={handleRestartTour}
        disabled={isRestarting}
        className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-lg bg-bg-light border border-white/10 hover:border-binance-yellow/50 text-white transition-all duration-200 group disabled:opacity-50"
      >
        <RotateCcw size={20} className="text-white/40 group-hover:text-binance-yellow transition-colors" />
        {isRestarting ? "Restarting..." : "Restart Onboarding Tour"}
      </button>

      <button
        onClick={handleSignOut}
        className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-lg bg-status-down/10 border border-status-down/20 text-status-down hover:bg-status-down/20 transition-all duration-200 group"
      >
        <LogOut size={20} />
        Sign Out
      </button>
    </div>
  )
}
