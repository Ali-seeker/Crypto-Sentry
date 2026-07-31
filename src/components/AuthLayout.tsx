"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-bg-dark text-text-primary">
      {/* Left Column - Form Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Right Column - Visual Panel (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 relative bg-[#06080A] border-l border-gray-800 overflow-hidden items-center justify-center">
        
        {/* Abstract Background Chart Pattern */}
        <motion.div className="absolute inset-0 opacity-20" 
          animate={{ backgroundPosition: ["0px 0px", "40px 40px"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Decorative Chart Line */}
        <svg className="absolute w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,80 L20,60 L40,70 L60,30 L80,50 L100,10" fill="none" stroke="var(--binance-yellow)" strokeWidth="0.5" strokeOpacity="0.5" />
          <path d="M0,90 L30,70 L50,85 L70,40 L90,60 L100,20" fill="none" stroke="var(--binance-yellow-dark)" strokeWidth="0.2" strokeOpacity="0.3" />
        </svg>

        {/* Floating Badges */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 px-4 py-2 rounded-full bg-status-up/10 text-status-up text-xs font-bold tracking-widest border border-status-up/20 backdrop-blur-sm rotate-[-5deg]"
        >
          BUY
        </motion.div>

        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 right-1/4 px-4 py-2 rounded-full bg-status-down/10 text-status-down text-xs font-bold tracking-widest border border-status-down/20 backdrop-blur-sm rotate-[10deg]"
        >
          SELL
        </motion.div>

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/3 left-1/3 px-4 py-2 rounded-full bg-status-up/10 text-status-up text-xs font-bold tracking-widest border border-status-up/20 backdrop-blur-sm rotate-[-2deg]"
        >
          HOLD
        </motion.div>

        {/* Bottom Left Overlay Card */}
        <div className="absolute bottom-8 left-8 right-8 lg:bottom-12 lg:left-12 max-w-sm bg-black/40 backdrop-blur-md border border-gray-800 p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <motion.span 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-status-up" 
            />
            <span className="text-[10px] text-status-up tracking-widest font-bold uppercase">System Active</span>
          </div>
          <h2 className="text-lg font-bold mb-2">REAL-TIME MARKET SURVEILLANCE //</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Monitoring global liquidity shifts and volatility patterns across thousands of assets in real time.
          </p>
        </div>

      </div>
    </div>
  )
}
