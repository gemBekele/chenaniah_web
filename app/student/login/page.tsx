"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LogIn, User, Lock, ArrowRight, Sparkles } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { validateStudentToken, clearStudentAuth, getStudentToken } from "@/lib/auth"
import Link from 'next/link'

const API_BASE_URL = getApiBaseUrl()

export default function StudentLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    // Check if already authenticated - validate token first
    const checkAuth = async () => {
      const token = getStudentToken()
      if (token) {
        const isValid = await validateStudentToken(token)
        if (isValid) {
          router.push('/dashboard')
        } else {
          // Token is invalid, clear it
          clearStudentAuth()
        }
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/student/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success && data.token) {
        localStorage.setItem('student_token', data.token)
        localStorage.setItem('student_role', data.role)
        localStorage.setItem('student_user', JSON.stringify(data.user))
        router.push('/dashboard')
      } else {
        setError(data.error || "Invalid credentials")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Failed to connect to server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Side - Hero/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#212E3E] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/worship-bg.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#212E3E]/90 to-[#1a2433]/95"></div>
        
        <div className="relative z-10 max-w-lg px-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#E5C985]/10 mb-8 backdrop-blur-sm border border-[#E5C985]/20 shadow-2xl shadow-[#E5C985]/5">
            <Sparkles className="h-10 w-10 text-[#E5C985]" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">Welcome to Chenaniah</h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            "Chenaniah, leader of the Levites in music, should direct the music, for he understood it." 
            <span className="block mt-2 text-[#E5C985] font-medium">- 1 Chronicles 15:22</span>
          </p>
          <div className="mt-12 flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#E5C985]"></div>
            <div className="w-2 h-2 rounded-full bg-white/20"></div>
            <div className="w-2 h-2 rounded-full bg-white/20"></div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#E5C985]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#E5C985]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Student Login</h2>
            <p className="mt-2 text-muted-foreground">
              Enter your credentials to access your portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-foreground/80">
                  Username
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="pl-10 h-12 bg-muted/30 border-border/60 focus:border-primary/50 focus:ring-primary/10 transition-all duration-200 rounded-xl"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                    Password
                  </Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 h-12 bg-muted/30 border-border/60 focus:border-primary/50 focus:ring-primary/10 transition-all duration-200 rounded-xl"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/5 border border-destructive/10 text-destructive p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-[#212E3E] hover:bg-[#212E3E]/90 text-white font-semibold rounded-xl shadow-lg shadow-[#212E3E]/10 transition-all duration-200 hover:shadow-xl hover:shadow-[#212E3E]/20 hover:-translate-y-0.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="bg-muted/30 border border-border/40 p-4 rounded-xl">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground font-medium">Note:</strong> Only applicants who have been accepted after the interview can register. If you haven't registered yet, please check your eligibility first.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                New to Chenaniah?
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/choir/signup" 
              className="inline-flex items-center justify-center w-full h-12 rounded-xl border border-border/60 bg-background hover:bg-muted/30 text-foreground font-medium transition-all duration-200 hover:border-primary/30"
            >
              Register as Student
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

