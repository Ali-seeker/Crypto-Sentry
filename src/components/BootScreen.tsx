"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ShieldAlert } from "lucide-react"

const BOOT_LINES = [
  "> INITIALIZING BITBASH SENTRY V4 ...",
  "> ESTABLISHING SECURE CHANNEL ............ OK",
  "> LINKING SURVEILLANCE ENGINE ............ OK",
  "> SYNCING COINGECKO FEED ................. OK",
  "> CALIBRATING CRASH DETECTOR ............. OK",
  "> SENSOR GRID ONLINE. WELCOME, OPERATOR.",
]

export default function BootScreen() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (visibleLines >= BOOT_LINES.length) {
      const t = setTimeout(() => setDone(true), 700)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setVisibleLines((v) => v + 1), 320)
    return () => clearTimeout(t)
  }, [visibleLines])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="boot"
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-[#04060b] flex items-center justify-center p-6"
        >
          <div className="w-full max-w-xl">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-12 h-12 rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 flex items-center justify-center"
              >
                <ShieldAlert className="text-neon-cyan" size={26} />
              </motion.div>
              <div>
                <h1 className="cyber-title font-bold text-2xl tracking-tight">
                  Bitbash
                </h1>
                <p className="cyber-label">Surveillance Terminal V4</p>
              </div>
            </div>

            <div className="font-mono text-sm leading-7 text-neon-cyan/90">
              {BOOT_LINES.slice(0, visibleLines).map((line) => (
                <p key={line} className="truncate">
                  {line}
                </p>
              ))}
              <p className="cursor-blink" />
            </div>

            <div className="mt-8 h-px bg-gradient-to-r from-neon-cyan via-neon-cyan to-neon-cyan" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}