"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingDown, TrendingUp, X, Bell } from "lucide-react"

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
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const lastCheckedAt = useRef<string>(new Date().toISOString())
  const dropdownRef = useRef<HTMLDivElement>(null)

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
              setAlerts((prev) => [...newAlerts, ...prev])
              if (!isOpen) {
                setUnreadCount((prev) => prev + newAlerts.length)
              }
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
  }, [settings.emailAlerts, settings.soundAlerts, isOpen])

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) {
          setIsOpen(false)
          setAlerts([]) // Clear on close per user requirements
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const toggleDropdown = () => {
    if (!isOpen) {
      setUnreadCount(0)
      setIsOpen(true)
    } else {
      setIsOpen(false)
      setAlerts([]) // Clear on close
    }
  }

  const dismissToast = (id: string) => {
    setAlerts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative p-2 rounded-lg bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/30 transition-colors flex items-center justify-center"
      >
        <Bell size={20} className="text-neon-cyan" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-neon-red text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-bg-void shadow-[0_0_10px_rgba(255,59,92,0.8)]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-3 z-50 flex flex-col gap-2 w-80 max-w-[90vw] max-h-[60vh] overflow-y-auto rounded-xl border border-white/10 bg-[#0d0f12] shadow-2xl p-2 hide-scrollbar cyber-corners"
          >
            <div className="corner" />
            
            <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-white/5 pb-2">
              <h3 className="text-sm font-semibold text-white/80 cyber-label">Notifications</h3>
              {alerts.length > 0 && (
                <button 
                  onClick={() => setAlerts([])}
                  className="text-[10px] uppercase text-white/40 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {alerts.length === 0 ? (
              <div className="py-8 text-center text-white/30 text-sm">
                No new notifications
              </div>
            ) : (
              alerts.map((toast) => (
                <motion.div
                  key={toast.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`relative p-3 rounded-lg border flex items-start gap-3 ${
                    toast.alert_type === "SPIKE"
                      ? "bg-neon-green/5 border-neon-green/20"
                      : "bg-neon-red/5 border-neon-red/20"
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissToast(toast.id)
                    }}
                    className="absolute top-2 right-2 text-white/20 hover:text-white transition-colors z-20"
                  >
                    <X size={12} />
                  </button>
                  <div className="relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 border ${
                        toast.alert_type === "SPIKE" ? "bg-neon-green/10 border-neon-green/30" : "bg-neon-red/10 border-neon-red/30"
                      }`}
                    >
                      {toast.alert_type === "SPIKE" ? (
                        <TrendingUp size={14} className="text-neon-green" />
                      ) : (
                        <TrendingDown size={14} className="text-neon-red" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-white text-xs">
                      {toast.alert_type === "SPIKE" ? "Flash Spike Detected" : "Flash Crash Detected"}
                    </h4>
                    <p
                      className={`text-[10px] font-medium mt-1 ${
                        toast.alert_type === "SPIKE" ? "text-neon-green" : "text-neon-red"
                      }`}
                    >
                      {toast.asset_name}: {Math.abs(toast.drop_percentage).toFixed(2)}%{" "}
                      {toast.alert_type === "SPIKE" ? "surge" : "drop"}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
