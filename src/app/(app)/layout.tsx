import Sidebar from "@/components/Sidebar"
import UserGuide from "@/components/UserGuide"
import AlertNotifier from "@/components/AlertNotifier"
import AnimatedBackground from "@/components/AnimatedBackground"
import PageTransition from "@/components/PageTransition"
import BootScreen from "@/components/BootScreen"
import TickerTape from "@/components/TickerTape"
import { SettingsProvider } from "@/components/SettingsProvider"
import { ReactNode } from "react"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <div className="flex min-h-screen bg-bg-void text-white flex-col md:flex-row">
        <BootScreen />
        <UserGuide />
        <AlertNotifier />
        <Sidebar />
        <AnimatedBackground />
        <TickerTape />
        <div className="flex-1 overflow-x-hidden pt-[84px] md:pt-9 md:ml-0 flex flex-col">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </div>
    </SettingsProvider>
  )
}
