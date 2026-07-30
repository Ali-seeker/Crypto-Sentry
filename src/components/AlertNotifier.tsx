"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, TrendingDown, TrendingUp, X } from "lucide-react"

interface AlertData {
  id: string
  asset_name: string
  alert_type: "CRASH" | "SPIKE"
  drop_percentage: number
}

export default function AlertNotifier() {
  const [toasts, setToasts] = useState<AlertData[]>([])
  const lastCheckedAt = useRef<string>(new Date().toISOString())

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`/api/alerts?since=${lastCheckedAt.current}`)
        if (res.ok) {
          const newAlerts: AlertData[] = await res.json()
          if (newAlerts.length > 0) {
            setToasts((prev) => [...prev, ...newAlerts])
          }
        }
        lastCheckedAt.current = new Date().toISOString()
      } catch (err) {
        // Ignore network errors silently for the polling
      }
    }

    const interval = setInterval(fetchAlerts, 10000)
    return () => clearInterval(interval)
  }, [])

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
            className={`pointer-events-auto relative p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 ${
              toast.alert_type === "SPIKE"
                ? "bg-status-up/10 border-status-up/30"
                : "bg-status-down/10 border-status-down/30"
            }`}
          >
            <button
              onClick={() => dismissToast(toast.id)}
              className="absolute top-2 right-2 text-white/40 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                toast.alert_type === "SPIKE" ? "bg-status-up/20" : "bg-status-down/20"
              }`}
            >
              {toast.alert_type === "SPIKE" ? (
                <TrendingUp size={18} className="text-status-up" />
              ) : (
                <TrendingDown size={18} className="text-status-down" />
              )}
            </div>
            <div className="flex-1 pr-4">
              <h4 className="font-bold text-white text-sm">
                {toast.alert_type === "SPIKE" ? "Flash Spike Detected" : "Flash Crash Detected"}
              </h4>
              <p
                className={`text-xs font-medium mt-1 ${
                  toast.alert_type === "SPIKE" ? "text-status-up" : "text-status-down"
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
