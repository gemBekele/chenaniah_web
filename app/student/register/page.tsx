"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, UserPlus, User, Lock, Phone, FileText, ArrowRight, Check, Sparkles, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { validateStudentToken, clearStudentAuth, getStudentToken } from "@/lib/auth"
import Link from 'next/link'
import { toast } from "sonner"

const API_BASE_URL = getApiBaseUrl()

export default function StudentRegisterPage() {
  const [step, setStep] = useState<'verify' | 'register'>('verify')
  const [phone, setPhone] = useState("")
  const [eligibility, setEligibility] = useState<{
    checked: boolean
    eligible: boolean
    message: string
    canLogin: boolean
    appointmentInfo?: any
  } | null>(null)
  const [checkingEligibility, setCheckingEligibility] = useState(false)
  
  const [formData, setFormData] = useState({
    fullNameAmharic: "",
    fullNameEnglish: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
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

  const handlePhoneCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setCheckingEligibility(true)

    if (!phone || phone.trim().length < 8) {
      setError("Please enter a valid phone number")
      setCheckingEligibility(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/student/check-eligibility`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()

      if (data.success) {
        setEligibility({
          checked: true,
          eligible: data.eligible,
          message: data.message,
          canLogin: data.canLogin || false,
          appointmentInfo: data.appointmentInfo,
        })

        if (data.eligible) {
          // User is eligible, proceed to registration
          setStep('register')
          toast.success('You are eligible to register!')
        } else if (data.canLogin) {
          // User already registered, suggest login
          toast.info('This phone number is already registered. Please login instead.')
        } else {
          // User not eligible
          toast.error(data.message)
        }
      } else {
        setError(data.error || "Failed to check eligibility")
        setEligibility({
          checked: true,
          eligible: false,
          message: data.error || "Failed to check eligibility",
          canLogin: false,
        })
      }
    } catch (err) {
      console.error("Eligibility check error:", err)
      setError("Failed to connect to server. Please try again.")
      setEligibility({
        checked: true,
        eligible: false,
        message: "Failed to connect to server. Please try again.",
        canLogin: false,
      })
    } finally {
      setCheckingEligibility(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/student/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullNameAmharic: formData.fullNameAmharic,
          fullNameEnglish: formData.fullNameEnglish,
          phone: phone,
          username: formData.username,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (data.success && data.token) {
        localStorage.setItem('student_token', data.token)
        localStorage.setItem('student_role', data.role)
        localStorage.setItem('student_user', JSON.stringify(data.user))
        toast.success('Registration successful!')
        router.push('/dashboard')
      } else {
        setError(data.error || "Registration failed. Please try again.")
        toast.error(data.error || "Registration failed")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("Failed to connect to server. Please try again.")
      toast.error("Failed to connect to server")
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

  // Phone Verification Step
  if (step === 'verify') {
    return (
      <div className="min-h-screen w-full flex bg-background">
        {/* Left Side - Hero/Brand */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#212E3E] items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#212E3E]/90 to-[#1a2433]/95"></div>
          
          <div className="relative z-10 max-w-lg px-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#E5C985]/10 mb-8 backdrop-blur-sm border border-[#E5C985]/20 shadow-2xl shadow-[#E5C985]/5">
              <Sparkles className="h-10 w-10 text-[#E5C985]" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">Student Portal</h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Register to access your student account and begin your journey in worship ministry.
            </p>
            
            <div className="mt-12 space-y-4 text-left bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-gray-200">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E5C985]/20 text-[#E5C985]">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-sm">Only accepted applicants can register</span>
              </div>
              <div className="flex items-center gap-3 text-gray-200">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E5C985]/20 text-[#E5C985]">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-sm">Complete your profile after registration</span>
              </div>
              <div className="flex items-center gap-3 text-gray-200">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E5C985]/20 text-[#E5C985]">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-sm">Access assignments and resources</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Phone Verification */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background overflow-y-auto">
          <div className="w-full max-w-[520px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 my-auto">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Verify Eligibility</h2>
              <p className="mt-2 text-muted-foreground">
                Enter your phone number to check if you're eligible to register
              </p>
            </div>

            <form onSubmit={handlePhoneCheck} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground/80">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      setEligibility(null)
                      setError("")
                    }}
                    placeholder="0912345678"
                    className="pl-10 h-11 bg-muted/30 border-border/60 focus:border-primary/50 focus:ring-primary/10 transition-all duration-200 rounded-xl"
                    required
                    disabled={checkingEligibility}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Use the phone number you provided during your interview application
                </p>
              </div>

              {error && (
                <div className="bg-destructive/5 border border-destructive/10 text-destructive p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {eligibility && !eligibility.eligible && (
                <div className={`p-4 rounded-xl text-sm ${
                  eligibility.canLogin 
                    ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200' 
                    : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {eligibility.canLogin ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-1">{eligibility.message}</p>
                      {eligibility.canLogin && (
                        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                          Go to Login →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {eligibility && eligibility.eligible && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-green-800 dark:text-green-200 mb-1">
                        {eligibility.message}
                      </p>
                      {eligibility.appointmentInfo && (
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Interview Date: {new Date(eligibility.appointmentInfo.scheduledDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-[#212E3E] hover:bg-[#212E3E]/90 text-white font-semibold rounded-xl shadow-lg shadow-[#212E3E]/10 transition-all duration-200 hover:shadow-xl hover:shadow-[#212E3E]/20"
                disabled={checkingEligibility || !phone}
              >
                {checkingEligibility ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Check Eligibility <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              {eligibility && eligibility.eligible && (
                <Button
                  type="button"
                  onClick={() => setStep('register')}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
                >
                  Continue to Registration <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/student/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Registration Form Step
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Side - Hero/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#212E3E] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#212E3E]/90 to-[#1a2433]/95"></div>
        
        <div className="relative z-10 max-w-lg px-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#E5C985]/10 mb-8 backdrop-blur-sm border border-[#E5C985]/20 shadow-2xl shadow-[#E5C985]/5">
            <Sparkles className="h-10 w-10 text-[#E5C985]" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">Complete Registration</h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            Fill in your details to complete your student account registration.
          </p>
          
          <div className="mt-12 space-y-4 text-left bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-gray-200">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E5C985]/20 text-[#E5C985]">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-sm">Access to exclusive worship resources</span>
            </div>
            <div className="flex items-center gap-3 text-gray-200">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E5C985]/20 text-[#E5C985]">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-sm">Submit assignments and get feedback</span>
            </div>
            <div className="flex items-center gap-3 text-gray-200">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E5C985]/20 text-[#E5C985]">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-sm">Connect with other students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background overflow-y-auto">
        <div className="w-full max-w-[520px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 my-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Create Account</h2>
              <p className="mt-2 text-muted-foreground">
                Phone: {phone}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('verify')}
              className="text-muted-foreground"
            >
              Change Phone
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Personal Information Group */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-xs">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullNameAmharic" className="text-sm font-medium text-foreground/80">
                      Full Name (Amharic) <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative group">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                      <Input
                        id="fullNameAmharic"
                        name="fullNameAmharic"
                        type="text"
                        value={formData.fullNameAmharic}
                        onChange={handleChange}
                        placeholder="የእርስዎ ሙሉ ስም"
                        className="pl-10 h-11 bg-muted/30 border-border/60 focus:border-primary/50 focus:ring-primary/10 transition-all duration-200 rounded-xl"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullNameEnglish" className="text-sm font-medium text-foreground/80">
                      Full Name (English) <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative group">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                      <Input
                        id="fullNameEnglish"
                        name="fullNameEnglish"
                        type="text"
                        value={formData.fullNameEnglish}
                        onChange={handleChange}
                        placeholder="Your Full Name"
                        className="pl-10 h-11 bg-muted/30 border-border/60 focus:border-primary/50 focus:ring-primary/10 transition-all duration-200 rounded-xl"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border/40 my-2"></div>

              {/* Account Information Group */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-xs">Account Security</h3>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-foreground/80">
                    Username <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a username"
                      className="pl-10 h-11 bg-muted/30 border-border/60 focus:border-primary/50 focus:ring-primary/10 transition-all duration-200 rounded-xl"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                      Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min 6 chars"
                        className="pl-10 h-11 bg-muted/30 border-border/60 focus:border-primary/50 focus:ring-primary/10 transition-all duration-200 rounded-xl"
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/80">
                      Confirm Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className="pl-10 h-11 bg-muted/30 border-border/60 focus:border-primary/50 focus:ring-primary/10 transition-all duration-200 rounded-xl"
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/5 border border-destructive/10 text-destructive p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="bg-muted/30 border border-border/40 p-4 rounded-xl">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground font-medium">Next Steps:</strong> After registration, you will need to complete your profile by uploading your ID document, church recommendation letter, and an essay.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#212E3E] hover:bg-[#212E3E]/90 text-white font-semibold rounded-xl shadow-lg shadow-[#212E3E]/10 transition-all duration-200 hover:shadow-xl hover:shadow-[#212E3E]/20 hover:-translate-y-0.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/student/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
