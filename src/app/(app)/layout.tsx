import Sidebar from "@/components/Sidebar"
import UserGuide from "@/components/UserGuide"
import { ReactNode } from "react"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg-dark text-white flex-col md:flex-row">
      <UserGuide />
      <Sidebar />
      <div className="flex-1 overflow-x-hidden pt-16 md:pt-0">
        {children}
      </div>
    </div>
  )
}
