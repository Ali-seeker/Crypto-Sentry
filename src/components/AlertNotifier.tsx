"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingDown, TrendingUp, X } from "lucide-react"

interface AlertData {
  id: string
  asset_name: string
  alert_type: "CRASH" | "SPIKE"
  drop_percentage: number
}

import { useRouter } from "next/navigation"
import { useSettings } from "./SettingsProvider"
import { playAlertSound } from "@/lib/sound"

export default function AlertNotifier() {
  const router = useRouter()
  const { settings } = useSettings()
  const [toasts, setToasts] = useState<AlertData[]>([])
  const lastCheckedAt = useRef<string>(new Date().toISOString())

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`/api/alerts?since=${lastCheckedAt.current}`)
        if (res.ok) {
          const newAlerts: AlertData[] = await res.json()
          if (newAlerts.length > 0) {
            // Gate notification channels behind the shared settings flags.
            if (settings.soundAlerts) {
              playAlertSound()
            }
            if (settings.emailAlerts) {
              setToasts((prev) => [...prev, ...newAlerts])
              router.refresh()
            }
          }
        }
        lastCheckedAt.current = new Date().toISOString()
      } catch {
        // Ignore network errors silently for the polling
      }
    }

    const interval = setInterval(fetchAlerts, 10000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.emailAlerts, settings.soundAlerts])

  useEffect(() => {
    if (toasts.length > 0) {
      // Auto-dismiss the oldest toast after 6 seconds
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1))
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [toasts])

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none w-80 max-w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`pointer-events-auto relative p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 cyber-corners ${
              toast.alert_type === "SPIKE"
                ? "bg-neon-green/10 border-neon-green/40 shadow-[0_0_24px_rgba(38,255,168,0.2)]"
                : "bg-neon-red/10 border-neon-red/40 shadow-[0_0_24px_rgba(255,59,92,0.25)]"
            }`}
          >
            <div className="corner" />
            <button
              onClick={() => dismissToast(toast.id)}
              className="absolute top-2 right-2 text-white/40 hover:text-white transition-colors z-20"
            >
              <X size={14} />
            </button>
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 border ${
                  toast.alert_type === "SPIKE" ? "bg-neon-green/20 border-neon-green/40" : "bg-neon-red/20 border-neon-red/40"
                }`}
              >
                {toast.alert_type === "SPIKE" ? (
                  <TrendingUp size={18} className="text-neon-green" />
                ) : (
                  <TrendingDown size={18} className="text-neon-red" />
                )}
              </div>
              <motion.div
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`absolute inset-0 rounded-full ${toast.alert_type === "SPIKE" ? "bg-neon-green" : "bg-neon-red"}`}
              />
            </div>
            <div className="flex-1 pr-4">
              <h4 className="font-bold text-white text-sm">
                {toast.alert_type === "SPIKE" ? "Flash Spike Detected" : "Flash Crash Detected"}
              </h4>
              <p
                className={`text-xs font-medium mt-1 ${
                  toast.alert_type === "SPIKE" ? "text-neon-green" : "text-neon-red"
                }`}
              >
                {toast.asset_name}: {Math.abs(toast.drop_percentage).toFixed(2)}%{" "}
                {toast.alert_type === "SPIKE" ? "surge" : "drop"}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
