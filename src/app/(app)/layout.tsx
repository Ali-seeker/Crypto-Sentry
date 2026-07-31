import Sidebar from "@/components/Sidebar"
import UserGuide from "@/components/UserGuide"
import AlertNotifier from "@/components/AlertNotifier"
import AnimatedBackground from "@/components/AnimatedBackground"
import PageTransition from "@/components/PageTransition"
import { ReactNode } from "react"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg-dark text-white flex-col md:flex-row">
      <UserGuide />
      <AlertNotifier />
      <Sidebar />
      <AnimatedBackground />
      <div className="flex-1 overflow-x-hidden pt-16 md:pt-0 flex flex-col">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
    </div>
  )
}
