"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, Star, Bell, Search, LogOut, ShieldAlert, Menu, X, User } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const navLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Watchlist", href: "/watchlist", icon: Star },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Market", href: "/market", icon: Search },
  { name: "Profile", href: "/profile", icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    window.location.href = "/login"
  }

  const closeMenu = () => setMobileMenuOpen(false)

  const NavContent = () => (
    <>
      <div className="flex-1 px-4 space-y-2 mt-8">
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.name}
              href={link.href}
              id={link.name === "Alerts" ? "nav-alerts" : undefined}
              onClick={closeMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-binance-yellow/10 text-binance-yellow font-medium"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon 
                size={20} 
                className={isActive ? "text-binance-yellow" : "text-white/40 group-hover:text-white/80 transition-colors"} 
              />
              {link.name}
              {isActive && (
                <motion.div 
                  layoutId="active-nav-indicator"
                  className="absolute left-0 w-1 h-8 bg-binance-yellow rounded-r-md"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-white/60 hover:bg-status-down/10 hover:text-status-down transition-all duration-200 group"
        >
          <LogOut size={20} className="text-white/40 group-hover:text-status-down transition-colors" />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-bg-dark border-b border-white/10 z-50 fixed top-0 w-full">
        <Link href="/dashboard" className="flex items-center gap-2 text-binance-yellow">
          <ShieldAlert size={24} />
          <span className="font-bold tracking-widest uppercase text-sm text-white">Crypto Sentry</span>
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
            className="fixed inset-0 z-40 bg-bg-dark pt-20 flex flex-col md:hidden border-b border-white/10 shadow-2xl"
          >
            <NavContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside id="app-sidebar" className="hidden md:flex flex-col w-64 bg-[#06080A] border-r border-white/5 h-screen sticky top-0">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-3 text-binance-yellow">
            <div className="w-10 h-10 bg-bg-card rounded-lg border border-binance-yellow/30 flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div>
              <span className="font-bold tracking-widest uppercase text-sm block text-white">Crypto Sentry</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Terminal v1.0</span>
            </div>
          </Link>
        </div>
        <NavContent />
      </aside>
    </>
  )
}
