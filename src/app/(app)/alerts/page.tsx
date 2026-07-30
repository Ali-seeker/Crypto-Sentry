import prisma from "@/lib/prisma"
import AlertLog from "@/components/AlertLog"
import { ShieldAlert } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AlertsPage() {
  const alerts = await prisma.cryptoAlert.findMany({
    orderBy: { detected_at: "desc" },
    take: 50,
  })

  return (
    <div className="min-h-screen p-6 md:p-10 bg-bg-dark text-white relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-status-down/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2 text-status-down">
              <ShieldAlert size={28} />
              <span className="font-mono text-sm tracking-widest uppercase">Protocol Violations</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Alert History</h1>
          </div>
        </header>

        <main>
          {alerts.length === 0 ? (
            <div className="text-center py-20 border border-white/10 rounded-xl bg-bg-card/40 backdrop-blur-md">
              <ShieldAlert size={48} className="mx-auto text-white/20 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No flash crashes detected yet</h2>
              <p className="text-white/60">The system is watching. All clear.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertLog
                  key={alert.id}
                  asset_id={alert.asset_id}
                  asset_name={alert.asset_name}
                  price_at_drop={alert.price_at_drop}
                  drop_percentage={alert.drop_percentage}
                  detected_at={alert.detected_at}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
