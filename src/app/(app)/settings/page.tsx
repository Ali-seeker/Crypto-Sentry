import { Settings as SettingsIcon } from "lucide-react"
import SettingsContent from "@/components/SettingsContent"

export const dynamic = "force-dynamic"

export default function SettingsPage() {
  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent text-white relative">
      <div className="relative z-10 max-w-3xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neon-cyan/15 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2 text-neon-cyan">
              <SettingsIcon size={28} className="drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <span className="cyber-label">Operator Preferences</span>
            </div>
            <h1 className="glitch text-4xl font-bold tracking-tight" data-text="Settings">
              <span className="cyber-title">Settings</span>
            </h1>
          </div>
        </header>

        <main>
          <SettingsContent />
        </main>
      </div>
    </div>
  )
}