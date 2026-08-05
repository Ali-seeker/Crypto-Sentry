"use client"

import { useEffect, useState } from "react"
import { Check, Save } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSettings } from "./SettingsProvider"

export default function SettingsContent() {
  // Single source of truth — shared, localStorage-backed settings store
  // consumed by the live UI (poll interval, density, card sensitivity).
  const { settings, update } = useSettings()
  const [saved, setSaved] = useState(false)

  // Sync the Critical Sensitivity to the Express engine via the shared store
  // so it actually controls alert detection (not just the card badge). Debounced
  // to avoid spamming the endpoint while dragging the slider.
  useEffect(() => {
    const t = Math.abs(settings.criticalThreshold)
    const id = setTimeout(() => {
      fetch("/api/settings/threshold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold: t }),
      }).catch(() => {})
    }, 400)
    return () => clearTimeout(id)
  }, [settings.criticalThreshold])

  const save = () => {
    update({}) // persist whatever is already in the store
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Threshold Monitoring */}
      <section className="cyber-panel cyber-corners relative rounded-xl p-6">
        <div className="corner" />
        <h2 className="cyber-label mb-5">Threshold Monitoring</h2>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/80">Critical Sensitivity</span>
            <span className="font-mono font-bold text-neon-cyan">
              {settings.criticalThreshold.toFixed(2)}%
            </span>
          </div>
          <input
            type="range"
            min={-5}
            max={-0.05}
            step={0.05}
            value={settings.criticalThreshold}
            onChange={(e) => update({ criticalThreshold: parseFloat(e.target.value) })}
            className="w-full accent-neon-green"
          />
          <p className="text-xs text-white/40 mt-2 flex justify-between">
            <span>−5% (low sensitivity)</span>
            <span>−0.05% (high sensitivity)</span>
          </p>
          {/* WIRED: this value controls BOTH the price-card STABLE→ALERT logic
              (src/components/PriceCard.tsx) AND the Express engine's actual
              detection (via the shared /api/settings/threshold store that the
              engine reads on every 30s poll). Moving the slider here genuinely
              changes how sensitive alert generation is. */}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">Aggressive Polling</p>
            <p className="text-xs text-white/40">Poll surveillance feed every 10s</p>
          </div>
          <Toggle
            checked={settings.aggressivePolling}
            onChange={(v) => update({ aggressivePolling: v })}
          />
        </div>
        {/* WIRED: drives the client poll interval (30s default → 10s when ON) in
            TickerTape, LivePriceGrid, WatchlistGrid and MarketGrid. */}
      </section>

      {/* Interface Adaptation */}
      <section className="cyber-panel cyber-corners relative rounded-xl p-6">
        <div className="corner" />
        <h2 className="cyber-label mb-5">Interface Adaptation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ViewOption
            active={settings.viewMode === "compact"}
            title="Compact UI"
            desc="Tighter padding & smaller gaps"
            onClick={() => update({ viewMode: "compact" })}
          />
          <ViewOption
            active={settings.viewMode === "expanded"}
            title="Expanded View"
            desc="Roomier spacing & larger cards"
            onClick={() => update({ viewMode: "expanded" })}
          />
        </div>
        {/* WIRED: applies a data-density attribute that tightens page padding,
            grid gaps and card padding across Dashboard/Watchlist/Market. */}
      </section>

      <div className="flex items-center justify-end gap-4">
        <AnimatePresence>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-neon-green flex items-center gap-1"
            >
              <Check size={16} /> Saved
            </motion.span>
          )}
        </AnimatePresence>
        <motion.button
          onClick={save}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="bg-neon-cyan text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 neon-glow transition-all"
        >
          <Save size={18} />
          Commit Changes
        </motion.button>
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
        checked ? "bg-neon-cyan neon-glow" : "bg-white/15"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  )
}

function ViewOption({
  active,
  title,
  desc,
  onClick,
}: {
  active: boolean
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1 p-4 rounded-lg border text-left transition-all duration-200 ${
        active
          ? "border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan neon-glow"
          : "border-white/10 bg-bg-card/40 text-white/70 hover:border-white/25"
      }`}
    >
      <span className="font-bold text-sm uppercase tracking-wide">{title}</span>
      <span className="text-xs text-white/50">{desc}</span>
    </button>
  )
}
