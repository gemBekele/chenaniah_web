"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, User, Phone, Lock, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import Link from 'next/link'
import Image from 'next/image'

const API_BASE_URL = getApiBaseUrl()

type Step = 'verify' | 'reset'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('verify')
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/student/forgot-password/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, phone }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message || "Verification successful!")
        setTimeout(() => {
          setStep('reset')
          setSuccess("")
        }, 1500)
      } else {
        setError(data.error || "Verification failed")
      }
    } catch (err) {
      console.error("Verification error:", err)
      setError("Failed to connect to server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password strength
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (newPassword.length > 128) {
      setError("Password must be less than 128 characters")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/student/forgot-password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, phone, newPassword }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message || "Password reset successfully!")
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(data.error || "Failed to reset password")
      }
    } catch (err) {
      console.error("Reset password error:", err)
      setError("Failed to connect to server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <Image 
              src="/assets/logo/logo_full.png" 
              alt="Chenaniah.org Logo" 
              width={120} 
              height={40} 
              className="h-auto w-auto"
            />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {step === 'verify' ? 'Reset Password' : 'Set New Password'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {step === 'verify' 
              ? 'Enter your username and phone number to verify your identity'
              : 'Enter your new password below'
            }
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${step === 'verify' ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`w-2 h-2 rounded-full ${step === 'reset' ? 'bg-primary' : 'bg-muted'}`}></div>
          </div>
        </div>

          {step === 'verify' ? (
            <form onSubmit={handleVerify} className="space-y-6">
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
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground/80">
                    Phone Number
                  </Label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="pl-10 h-12 bg-muted/30 border-border/60 focus:border-primary/50 focus:ring-primary/10 transition-all duration-200 rounded-xl"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We'll verify the last 8 digits of your phone number
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/5 border border-destructive/10 text-destructive p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/5 border border-green-500/10 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {success}
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
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Verify <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-foreground/80">
                    New Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      className="pl-10 h-12 bg-muted/30 border-border/60 focus:border-primary/50 focus:ring-primary/10 transition-all duration-200 rounded-xl"
                      required
                      disabled={isLoading}
                      minLength={6}
                      maxLength={128}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/80">
                    Confirm New Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className="pl-10 h-12 bg-muted/30 border-border/60 focus:border-primary/50 focus:ring-primary/10 transition-all duration-200 rounded-xl"
                      required
                      disabled={isLoading}
                      minLength={6}
                      maxLength={128}
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

              {success && (
                <div className="bg-green-500/5 border border-green-500/10 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {success}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep('verify')
                    setError("")
                    setSuccess("")
                    setNewPassword("")
                    setConfirmPassword("")
                  }}
                  className="flex-1 h-12 rounded-xl"
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-[#212E3E] hover:bg-[#212E3E]/90 text-white font-semibold rounded-xl shadow-lg shadow-[#212E3E]/10 transition-all duration-200 hover:shadow-xl hover:shadow-[#212E3E]/20 hover:-translate-y-0.5"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Resetting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Reset Password <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}

        <div className="text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

