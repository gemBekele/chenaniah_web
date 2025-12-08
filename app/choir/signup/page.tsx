"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus, User, Lock, Phone, FileText, ArrowRight, Check, Sparkles, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { validateStudentToken, clearStudentAuth, getStudentToken } from "@/lib/auth"
import Link from 'next/link'
import { toast } from "sonner"
import Image from 'next/image'

const API_BASE_URL = getApiBaseUrl()

export default function StudentRegisterPage() {
  const [step, setStep] = useState<'verify' | 'personal' | 'register'>('verify')
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
    gender: "",
    localChurch: "",
    address: "",
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
          // User is eligible, proceed to personal details step
          setStep('personal')
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate all required fields
    if (!formData.fullNameAmharic || !formData.fullNameAmharic.trim()) {
      setError("Full name (Amharic) is required")
      toast.error("Please fill in all required fields")
      return
    }

    if (!formData.fullNameEnglish || !formData.fullNameEnglish.trim()) {
      setError("Full name (English) is required")
      toast.error("Please fill in all required fields")
      return
    }

    if (!formData.localChurch || !formData.localChurch.trim()) {
      setError("Local church is required")
      toast.error("Please fill in all required fields")
      return
    }

    if (!formData.address || !formData.address.trim()) {
      setError("Address is required")
      toast.error("Please fill in all required fields")
      return
    }

    if (!formData.username || !formData.username.trim()) {
      setError("Username is required")
      toast.error("Please fill in all required fields")
      return
    }

    if (!formData.password || !formData.password.trim()) {
      setError("Password is required")
      toast.error("Please fill in all required fields")
      return
    }

    if (!formData.confirmPassword || !formData.confirmPassword.trim()) {
      setError("Please confirm your password")
      toast.error("Please fill in all required fields")
      return
    }

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
          gender: formData.gender,
          localChurch: formData.localChurch,
          address: formData.address,
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

  // Registration Form Steps
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-2 w-2 rounded-full transition-all duration-300 ${
            s === (step === 'verify' ? 1 : step === 'personal' ? 2 : 3)
              ? "bg-primary w-8"
              : "bg-muted"
          }`}
        />
      ))}
    </div>
  )

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[520px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
            {step === 'verify' ? 'Phone Verification' : 
             step === 'personal' ? 'Personal Details' : 
             'Account Security'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {step === 'verify' ? 'Provide your phone number to continue' :
             step === 'personal' ? 'Tell us about yourself' :
             'Secure your account'}
          </p>
        </div>

        {renderStepIndicator()}

        {/* Step 1: Phone Verification */}
        {step === 'verify' && (
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
                  Continue <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            {eligibility && eligibility.eligible && (
              <Button
                type="button"
                onClick={() => setStep('personal')}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
              >
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </form>
        )}

        {/* Step 2: Personal Details */}
        {step === 'personal' && (
          <div className="space-y-6">
            <div className="space-y-4">
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
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium text-foreground/80">
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => {
                    setFormData({ ...formData, gender: value })
                    setError("")
                  }}
                  required
                >
                  <SelectTrigger className="h-11 bg-muted/30 border-border/60 focus:border-primary/50 focus:ring-primary/10 transition-all duration-200 rounded-xl">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="localChurch" className="text-sm font-medium text-foreground/80">
                  Local Church <span className="text-destructive">*</span>
                </Label>
                <div className="relative group">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                  <Input
                    id="localChurch"
                    name="localChurch"
                    type="text"
                    value={formData.localChurch}
                    onChange={handleChange}
                    placeholder="Name of your local church"
                    className="pl-10 h-11 bg-muted/30 border-border/60 focus:border-primary/50 focus:ring-primary/10 transition-all duration-200 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-foreground/80">
                  Address (in detail) <span className="text-destructive">*</span>
                </Label>
                <div className="relative group">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your full address with city, sub-city, woreda, kebele, etc."
                    className="pl-10 min-h-[100px] bg-muted/30 border-border/60 focus:border-primary/50 focus:ring-primary/10 transition-all duration-200 rounded-xl resize-y"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setStep('verify')}
                className="w-full h-12 rounded-xl"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  if (formData.fullNameAmharic && formData.fullNameEnglish && formData.localChurch && formData.address) {
                    setStep('register')
                  } else {
                    toast.error("Please fill in all required fields")
                  }
                }}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
              >
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Account Security */}
        {step === 'register' && (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-4">
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

            {error && (
              <div className="bg-destructive/5 border border-destructive/10 text-destructive p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('personal')}
                className="w-full h-12 rounded-xl"
                disabled={isLoading}
              >
                Back
              </Button>
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
            </div>
          </form>
        )}

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
