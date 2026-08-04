"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { LayoutDashboard, Star, Bell, Search, Settings, ShieldAlert, Menu, X, User } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import SidebarUserChip from "./SidebarUserChip"

const navLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Watchlist", href: "/watchlist", icon: Star },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Market", href: "/market", icon: Search },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session } = useSession()

  const closeMenu = () => setMobileMenuOpen(false)

  const NavContent = () => (
    <>
      <div className="flex-1 px-4 space-y-1 mt-8">
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.name}
              href={link.href}
              id={link.name === "Alerts" ? "nav-alerts" : undefined}
              onClick={closeMenu}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group overflow-hidden ${
                isActive
                  ? "text-neon-cyan font-medium"
                  : "text-white/55 hover:bg-white/5 hover:text-white"
              }`}
            >
              {/* Active neon underglow */}
              {isActive && (
                <div className="absolute inset-0 bg-neon-cyan/10 border border-neon-cyan/30 shadow-[0_0_18px_rgba(34,197,94,0.25)]" />
              )}
              <Icon
                size={20}
                className={`relative transition-all duration-200 ${isActive ? "text-neon-cyan drop-shadow-[0_0_6px_rgba(34,197,94,0.8)]" : "text-white/40 group-hover:text-white/80 group-hover:scale-110 group-hover:rotate-3"}`}
              />
              <span className="relative">{link.name}</span>
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute left-0 top-1 bottom-1 w-0.5 bg-neon-cyan rounded-r-md shadow-[0_0_8px_rgba(34,197,94,0.9)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        {session ? (
          <SidebarUserChip />
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-white/60 hover:bg-neon-cyan/10 hover:text-neon-cyan transition-all duration-200 group"
          >
            <User size={20} className="text-white/40 group-hover:text-neon-cyan transition-colors" />
            Sign In
          </Link>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Top Bar (below ticker) */}
      <div className="md:hidden flex items-center justify-between p-3 bg-bg-void/95 border-b border-white/10 z-50 fixed top-9 w-full backdrop-blur-md">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ShieldAlert className="text-neon-cyan" size={24} />
          <span className="font-bold tracking-widest uppercase text-sm cyber-title">Bitbash</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white/70">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-bg-void/98 pt-24 flex flex-col md:hidden border-b border-neon-cyan/10 shadow-2xl backdrop-blur-xl"
          >
            <NavContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside id="app-sidebar" className="hidden md:flex flex-col w-64 bg-[#05070c] border-r border-neon-cyan/10 h-[calc(100vh-36px)] sticky top-9">
        <div className="p-6 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-neon-cyan/10 blur-3xl" />
          <Link href="/dashboard" className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 flex items-center justify-center shadow-[0_0_16px_rgba(34,197,94,0.35)]">
              <ShieldAlert className="text-neon-cyan" size={20} />
            </div>
            <div>
<span className="font-bold tracking-widest uppercase text-sm block cyber-title">Bitbash</span>
          <span className="cyber-label">Sentry V4</span>
            </div>
          </Link>
        </div>
        <NavContent />
      </aside>
    </>
  )
}