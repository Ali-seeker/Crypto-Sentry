"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

const TOUR_STEPS = [
  {
    targetId: "dashboard-stats",
    content: "This shows overall system activity.",
    route: "/dashboard",
  },
  {
    targetId: "nav-alerts",
    content: "This is where flash-crash history lives.",
    route: "/dashboard", // although visible everywhere, we highlight it while on dashboard
  },
  {
    targetId: "watchlist-star",
    content: "Starring adds assets to your personal watchlist.",
    route: "/dashboard",
  },
  {
    targetId: "market-search",
    content: "Filter assets in real-time by name or symbol.",
    route: "/market",
  },
  {
    targetId: "app-sidebar",
    content: "Use the sidebar to move between Dashboard, Watchlist, Alerts, and Market.",
    route: "/market",
    placement: "right"
  },
]

export default function UserGuide() {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status, update } = useSession()

  // Initialize guide on first visit (only when authenticated)
  useEffect(() => {
    if (status === "authenticated") {
      const isCompleted = session?.user?.guide_completed
      if (!isCompleted && !isActive) {
        // Small delay to ensure initial layout is painted
        const timer = setTimeout(() => {
          setCurrentStep(0)
          setIsActive(true)
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [status, session?.user?.guide_completed, isActive])

  const dismissGuide = useCallback(async () => {
    try {
      const res = await fetch('/api/user/guide-completed', { method: 'PATCH' })
      if (!res.ok) {
        console.error("Failed API call", await res.text())
      }
      await update({ guide_completed: true })
    } catch (error) {
      console.error("Failed to mark guide as completed", error)
    } finally {
      setIsActive(false)
    }
  }, [update])

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismissGuide()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isActive, dismissGuide])

  // Element measurement and routing sync
  useEffect(() => {
    if (!isActive) return

    const step = TOUR_STEPS[currentStep]
    
    // Check if we need to change routes
    if (pathname !== step.route) {
      setTargetRect(null)
      router.push(step.route)
      // wait for navigation before trying to find the element
      return
    }

    // Function to find and measure element
    const findAndMeasure = () => {
      const element = document.getElementById(step.targetId)
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(prev => {
          if (!prev) return rect
          if (
            Math.abs(prev.left - rect.left) < 1 &&
            Math.abs(prev.top - rect.top) < 1 &&
            Math.abs(prev.width - rect.width) < 1 &&
            Math.abs(prev.height - rect.height) < 1
          ) {
            return prev
          }
          return rect
        })
      } else {
        // Element not found (maybe still rendering, or skeleton active)
        // We can just skip this step gracefully if it never appears, but a small polling helps
        setTargetRect(null)
      }
    }

    findAndMeasure()
    
    // Listen for resize to re-measure
    window.addEventListener("resize", findAndMeasure)
    
    // Setup MutationObserver in case the element renders asynchronously (e.g. data load)
    const observer = new MutationObserver(findAndMeasure)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener("resize", findAndMeasure)
      observer.disconnect()
    }
  }, [isActive, currentStep, pathname, router])

  if (!isActive) return null

  const step = TOUR_STEPS[currentStep]
  const isLastStep = currentStep === TOUR_STEPS.length - 1

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none"
      >
        {/* The semi-transparent overlay with a cutout using mask-image */}
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-all duration-500"
          style={{
            clipPath: targetRect 
              ? `polygon(
                  0% 0%, 0% 100%, 
                  ${targetRect.left - 10}px 100%, 
                  ${targetRect.left - 10}px ${targetRect.top - 10}px, 
                  ${targetRect.right + 10}px ${targetRect.top - 10}px, 
                  ${targetRect.right + 10}px ${targetRect.bottom + 10}px, 
                  ${targetRect.left - 10}px ${targetRect.bottom + 10}px, 
                  ${targetRect.left - 10}px 100%, 
                  100% 100%, 100% 0%
                )`
              : "none"
          }}
        />

        {/* The glowing border accent around the cutout */}
        {targetRect && (
          <motion.div
            layout
            initial={false}
            animate={{
              x: targetRect.left - 12,
              y: targetRect.top - 12,
              width: targetRect.width + 24,
              height: targetRect.height + 24,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute rounded-lg border-2 border-binance-yellow shadow-[0_0_20px_rgba(252,213,53,0.5)] pointer-events-none"
          />
        )}

        {/* Tooltip Card */}
        {targetRect && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: step.placement === "right" 
                ? targetRect.right + 20 
                : Math.min(
                    Math.max(20, targetRect.left + (targetRect.width / 2) - 150),
                    typeof window !== 'undefined' ? window.innerWidth - 320 : 0
                  ),
              y: step.placement === "right"
                ? Math.max(20, targetRect.top + (targetRect.height / 2) - 100)
                : Math.max(20, targetRect.bottom + 30 > (typeof window !== 'undefined' ? window.innerHeight : 0) - 200
                  ? targetRect.top - 180
                  : targetRect.bottom + 20)
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute w-[300px] bg-[#1E2329] border border-white/10 rounded-xl p-5 shadow-2xl pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-binance-yellow uppercase tracking-widest">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
              <button 
                onClick={dismissGuide}
                className="text-white/40 hover:text-white transition-colors text-sm"
              >
                Skip Tour
              </button>
            </div>
            
            <p className="text-white/90 mb-5 leading-relaxed">
              {step.content}
            </p>
            
            <div className="flex justify-between items-center gap-3">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              
              <button
                autoFocus
                onClick={() => {
                  if (isLastStep) dismissGuide()
                  else setCurrentStep(prev => prev + 1)
                }}
                className="px-4 py-2 text-sm font-bold bg-binance-yellow text-bg-dark rounded-lg hover:bg-binance-yellow/90 transition-colors"
              >
                {isLastStep ? "Finish" : "Next"}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
