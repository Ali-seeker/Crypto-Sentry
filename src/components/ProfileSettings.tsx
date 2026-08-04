"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bell, Volume2, LayoutGrid, ShieldCheck, Lock, KeyRound, type LucideIcon } from "lucide-react"
import { useSettings } from "./SettingsProvider"

function Toggle({
  checked,
  onChange,
  label,
  icon: Icon,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  icon: LucideIcon
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-3 p-4 rounded-lg bg-bg-light/60 border border-neon-cyan/15 hover:border-neon-cyan/40 transition-all group"
    >
      <span className="flex items-center gap-3 text-sm text-white/85">
        <Icon size={16} className="text-neon-cyan group-hover:drop-shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
        {label}
      </span>
      <span
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
          checked ? "bg-neon-cyan neon-glow" : "bg-white/15"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  )
}

// Operator preferences — shares the same localStorage-backed settings store as
// the Settings page (single source of truth). Email Alerts gates the in-app
// alert toasts, Sound Notifications gates the alert beep, and Compact UI Mode
// is a shortcut to the same viewMode the Settings page controls.
export default function ProfileSettings() {
  const { settings, update } = useSettings()
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const set = (patch: Parameters<typeof update>[0]) => {
    update(patch)
    setSavedAt(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* System preferences */}
      <section className="cyber-panel cyber-corners relative rounded-xl p-5">
        <div className="corner" />
        <div className="flex items-center gap-2 mb-4">
          <LayoutGrid size={16} className="text-neon-cyan" />
          <h3 className="cyber-label">System Preferences</h3>
        </div>
        <div className="space-y-3">
          <Toggle
            checked={settings.emailAlerts}
            onChange={(v) => set({ emailAlerts: v })}
            label="Email Alerts"
            icon={Bell}
          />
          <Toggle
            checked={settings.soundAlerts}
            onChange={(v) => set({ soundAlerts: v })}
            label="Sound Notifications"
            icon={Volume2}
          />
          <Toggle
            checked={settings.viewMode === "compact"}
            onChange={(v) => set({ viewMode: v ? "compact" : "expanded" })}
            label="Compact UI Mode"
            icon={LayoutGrid}
          />
        </div>
        {savedAt && (
          <p className="text-[10px] text-neon-green font-mono uppercase tracking-wider mt-3">
            Saved {savedAt}
          </p>
        )}
        <p className="text-[10px] text-white/30 font-mono mt-2">
          WIRED: toggles drive real behavior (toasts, beep, layout density).
        </p>
      </section>

      {/* Security */}
      <section className="cyber-panel cyber-corners relative rounded-xl p-5">
        <div className="corner" />
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={16} className="text-neon-cyan" />
          <h3 className="cyber-label">Security</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-bg-light/40 border border-neon-cyan/15">
            <span className="flex items-center gap-2 text-sm text-white/85">
              <Lock size={14} className="text-neon-cyan" /> Two-Factor Auth
            </span>
            <span className="text-xs font-bold text-neon-amber border border-neon-amber/40 bg-neon-amber/10 px-2 py-0.5 rounded-full">
              Not Enabled
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-bg-light/40 border border-neon-cyan/15">
            <span className="flex items-center gap-2 text-sm text-white/85">
              <KeyRound size={14} className="text-neon-cyan" /> Last Login
            </span>
            <span className="text-xs text-white/50 font-mono">Current session</span>
          </div>
          <p className="text-[10px] text-white/30 font-mono leading-relaxed">
            SECURITY: 2FA enrollment endpoint not yet deployed — kept honest.
          </p>
        </div>
      </section>
    </div>
  )
}