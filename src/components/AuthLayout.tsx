"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import AnimatedBackground from "./AnimatedBackground"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-bg-void text-text-primary relative">
      <AnimatedBackground />

      {/* Left Column - Form Panel */}
      <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="absolute top-6 left-6 flex items-center gap-2 md:hidden">
            <motion.span
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-neon-green"
            />
            <span className="cyber-label">SYSTEM ACTIVE</span>
          </div>
          {children}
        </div>
      </div>

      {/* Right Column - Visual Panel (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 relative bg-[#05070d]/60 border-l border-neon-cyan/10 overflow-hidden items-center justify-center backdrop-blur-sm">
        
        {/* Cyber grid backdrop */}
        <motion.div
          className="absolute inset-0 opacity-25"
          animate={{ backgroundPosition: ["0px 0px", "0px 44px"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(34,197,94,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,197,94,0.35) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "linear-gradient(to bottom, transparent, black 40%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 40%, transparent)",
          }}
        />

        {/* Neon chart pulse */}
        <svg className="absolute w-full h-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,80 L20,60 L40,70 L60,30 L80,50 L100,10" fill="none" stroke="var(--neon-cyan)" strokeWidth="0.5" style={{ filter: "drop-shadow(0 0 4px rgba(34,197,94,0.8))" }} />
          <path d="M0,90 L30,70 L50,85 L70,40 L90,60 L100,20" fill="none" stroke="var(--neon-cyan)" strokeWidth="0.2" style={{ filter: "drop-shadow(0 0 4px rgba(34,197,94,0.8))" }} />
        </svg>

        {/* Floating neon badges */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 px-4 py-2 rounded-full bg-neon-green/10 text-neon-green text-xs font-bold tracking-widest border border-neon-green/40 backdrop-blur-sm rotate-[-5deg] shadow-[0_0_16px_rgba(38,255,168,0.25)]"
        >
          BUY
        </motion.div>

        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 right-1/4 px-4 py-2 rounded-full bg-neon-red/10 text-neon-red text-xs font-bold tracking-widest border border-neon-red/40 backdrop-blur-sm rotate-[10deg] shadow-[0_0_16px_rgba(255,59,92,0.25)]"
        >
          SELL
        </motion.div>

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/3 left-1/3 px-4 py-2 rounded-full bg-neon-cyan/10 text-neon-cyan text-xs font-bold tracking-widest border border-neon-cyan/40 backdrop-blur-sm rotate-[-2deg] shadow-[0_0_16px_rgba(34,197,94,0.25)]"
        >
          HOLD
        </motion.div>

        {/* Bottom Left Overlay Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-8 left-8 right-8 lg:bottom-12 lg:left-12 max-w-sm bg-black/50 backdrop-blur-md border border-neon-cyan/20 p-6 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.1)]"
        >
          <div className="flex items-center gap-2 mb-3">
            <motion.span 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_rgba(38,255,168,0.9)]" 
            />
            <span className="cyber-label">System Active</span>
          </div>
          <h2 className="cyber-title text-lg font-bold mb-2">REAL-TIME MARKET SURVEILLANCE //</h2>
          <p className="text-sm text-white/50 leading-relaxed">
            Monitoring global liquidity shifts and volatility patterns across thousands of assets in real time.
          </p>
        </motion.div>

      </div>
    </div>
  )
}