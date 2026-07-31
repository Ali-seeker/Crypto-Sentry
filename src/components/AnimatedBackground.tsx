"use client"

import { motion, useReducedMotion } from "framer-motion"

export default function AnimatedBackground() {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return (
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
    )
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      <motion.div 
        className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-binance-yellow/5 via-transparent to-transparent opacity-10"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      {/* Scanning radar line effect */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-binance-yellow/10 blur-xl opacity-20"
        animate={{
          y: ['-100%', '1000%'],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 2
        }}
      />
    </div>
  )
}
