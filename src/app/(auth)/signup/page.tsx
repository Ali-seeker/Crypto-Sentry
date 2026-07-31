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
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setLoading(false)
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
          <div className="w-12 h-12 bg-bg-card rounded-lg border border-binance-yellow/50 shadow-[0_0_15px_rgba(252,213,53,0.15)] flex items-center justify-center mb-6">
            <ShieldAlert className="text-binance-yellow w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
            Join the Surveillance Network
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-status-down/10 border border-status-down/20 rounded-md text-status-down text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-500" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-card border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-binance-yellow focus:ring-1 focus:ring-binance-yellow transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-500" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-card border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-binance-yellow focus:ring-1 focus:ring-binance-yellow transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-binance-yellow text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:scale-[1.02] hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Creating Account..." : "Create Account"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-binance-yellow font-medium hover:underline transition-colors">
            Log in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
