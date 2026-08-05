"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"
import { ShieldAlert, Mail, Lock, ArrowRight } from "lucide-react"
import AuthLayout from "@/components/AuthLayout"

export default function SignupPage() {
  const router = useRouter()
  const { status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to sign up")
        setLoading(false)
        return
      }

      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (signInResult?.ok && !signInResult?.error) {
        router.push("/dashboard")
      } else {
        router.push("/login?registered=true")
      }
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <AuthLayout>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full"
      >
        <div className="mb-8">
          <div className="w-12 h-12 rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 shadow-[0_0_20px_rgba(34,197,94,0.35)] flex items-center justify-center mb-6">
            <ShieldAlert className="text-neon-cyan w-6 h-6" />
          </div>
          <h1 className="glitch text-3xl font-bold tracking-tight text-white mb-2" data-text="Create Account">
            <span className="cyber-title">Create Account</span>
          </h1>
          <p className="cyber-label">
            Join the Surveillance Network
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-neon-red/10 border border-neon-red/30 rounded-md text-neon-red text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="cyber-label block">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-neon-cyan/50" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-bg-card border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_18px_rgba(34,197,94,0.25)] transition-all duration-300"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="cyber-label block">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-neon-cyan/50" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-bg-card border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_18px_rgba(34,197,94,0.25)] transition-all duration-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button 
            type="submit" 
            disabled={loading}
            animate={isBlinking ? { scale: 0.95, filter: "brightness(1.5)" } : { scale: 1, filter: "brightness(1)" }}
            whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-full bg-gradient-to-r from-neon-cyan to-neon-cyan text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-[0_0_24px_rgba(34,197,94,0.4)] transition-all disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"} <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        <p className="mt-10 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/login" className="text-neon-cyan font-medium hover:underline hover:drop-shadow-[0_0_6px_rgba(34,197,94,0.8)] transition-colors">
            Log in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
