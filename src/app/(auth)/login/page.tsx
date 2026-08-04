"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"
import { ShieldAlert, Mail, Lock, ArrowRight } from "lucide-react"
import AuthLayout from "@/components/AuthLayout"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState(
    searchParams.get("registered") ? "Account created successfully! Please log in." : ""
  )

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")
    
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError("Invalid email or password")
    } else {
      router.push("/dashboard")
    }
  }

  return (
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
          <h1 className="glitch text-3xl font-bold tracking-tight text-white mb-2" data-text="Welcome Back">
            <span className="cyber-title">Welcome Back</span>
          </h1>
          <p className="cyber-label">
            Secure Access · Bitbash Sentry
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {successMsg && (
            <div className="p-3 bg-neon-green/10 border border-neon-green/30 rounded-md text-neon-green text-sm">
              {successMsg}
            </div>
          )}
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
                className="w-full bg-bg-card border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_18px_rgba(34,197,94,0.25)] transition-all duration-300"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="cyber-label !block">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-neon-cyan/50" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-card border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_18px_rgba(34,197,94,0.25)] transition-all duration-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button 
            type="submit" 
            whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-full bg-gradient-to-r from-neon-cyan to-neon-cyan text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-[0_0_24px_rgba(34,197,94,0.4)] transition-all"
          >
            Log In <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        <div className="my-8 flex items-center justify-center">
          <div className="border-t border-white/10 flex-grow" />
          <span className="px-3 text-xs text-white/40 font-semibold uppercase tracking-widest">Or</span>
          <div className="border-t border-white/10 flex-grow" />
        </div>

        <button 
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full bg-bg-card border border-white/10 hover:bg-bg-panel hover:border-neon-cyan/40 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        <p className="mt-10 text-center text-sm text-white/50">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-neon-cyan font-medium hover:underline hover:drop-shadow-[0_0_6px_rgba(34,197,94,0.8)] transition-colors">
            Register now
          </Link>
        </p>
      </motion.div>
  )
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}
