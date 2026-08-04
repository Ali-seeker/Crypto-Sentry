"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useMemo } from "react"

export default function AnimatedBackground() {
  const shouldReduceMotion = useReducedMotion()

  // Pseudo-random star/float field, stable across renders
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }).map((_, i) => ({
        id: i,
        left: (i * 137.5) % 100,
        top: (i * 79.3) % 100,
        size: 1 + ((i * 31) % 3),
        delay: (i * 0.7) % 6,
        duration: 3 + ((i * 13) % 5),
      })),
    []
  )

  // Matrix rain columns
  const columns = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => {
        const CHARS = "01アカサタナYSΩ<>";
        const char = (j: number) =>
          CHARS[((i * 31) + (j * 17)) % CHARS.length] ?? "0"
        return {
          id: i,
          left: (i / 24) * 100 + ((i % 3) * 2),
          chars: Array.from({ length: 6 }).map((_, j) => char(j)),
          delay: (i * 0.6) % 7,
          duration: 5 + ((i * 17) % 6),
        }
      }),
    []
  )

  if (shouldReduceMotion) {
    return (
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-[#05070d]" />
    )
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#04060b]">
      {/* Baseline vertical gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a1022_0%,#04060b_55%)]" />

      {/* Slow drifting aurora orbs */}
      <motion.div
        className="absolute -top-24 -left-24 w-[40vw] h-[40vw] rounded-full bg-neon-cyan/15 blur-[120px]"
        animate={{ x: ["0%", "30%", "0%"], y: ["0%", "20%", "0%"] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-24 w-[38vw] h-[38vw] rounded-full bg-neon-cyan/15 blur-[120px]"
        animate={{ x: ["0%", "-25%", "0%"], y: ["0%", "-20%", "0%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 left-1/3 w-[36vw] h-[36vw] rounded-full bg-neon-cyan/10 blur-[130px]"
        animate={{ x: ["0%", "20%", "0%"], y: ["0%", "-25%", "0%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Perspective cyber floor grid */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[55vh] opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(34,197,94,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,197,94,0.5) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "linear-gradient(to top, transparent 0%, rgba(0,0,0,0.9) 45%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, transparent 0%, rgba(0,0,0,0.9) 45%, transparent 100%)",
          transform: "perspective(600px) rotateX(62deg)",
          transformOrigin: "center bottom",
        }}
        animate={{ backgroundPosition: ["0px 0px", "0px 44px"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      {/* Starfield */}
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            opacity: 0.5,
          }}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Matrix rain (subtle) */}
      <div className="absolute inset-0 opacity-[0.12]">
        {columns.map((c) => (
          <motion.span
            key={c.id}
            className="absolute top-0 text-neon-cyan font-mono text-[10px]"
            style={{ left: `${c.left}%` }}
            animate={{ translateY: ["-100vh", "100vh"] }}
            transition={{
              duration: c.duration,
              delay: c.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {c.chars.join("")}
          </motion.span>
        ))}
      </div>

      {/* Fine static scanlines */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Top and bottom neon edge glows */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  )
}