"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"

interface AnimatedNumberProps {
  value: string | number
  className?: string
}

export default function AnimatedNumber({ value, className = "" }: AnimatedNumberProps) {
  const shouldReduceMotion = useReducedMotion()
  const [pulseKey, setPulseKey] = useState(0)

  useEffect(() => {
    setPulseKey(prev => prev + 1)
  }, [value])

  if (shouldReduceMotion) {
    return <span className={className}>{value}</span>
  }

  return (
    <motion.span
      key={pulseKey}
      initial={{ scale: 1.05, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`inline-block ${className}`}
    >
      {value}
    </motion.span>
  )
}
