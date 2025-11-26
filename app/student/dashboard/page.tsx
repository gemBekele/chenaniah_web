"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Upload, 
  LogOut, 
  User, 
  FileCheck, 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Settings, 
  Bell,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  DollarSign
} from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { clearStudentAuth } from "@/lib/auth"
import Link from 'next/link'
import ProfileCompletionForm from '@/components/student-profile-completion'
import StudentAssignments from '@/components/student-assignments'
import StudentResources from '@/components/student-resources'
import StudentPayments from '@/components/student-payments'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const API_BASE_URL = getApiBaseUrl()

interface StudentUser {
  id: number
  fullNameAmharic?: string
  fullNameEnglish?: string
  phone: string
  username: string
  profileComplete: boolean
  hasIdDocument?: boolean
  hasRecommendationLetter?: boolean
  hasEssay?: boolean
}

export default function StudentDashboardPage() {
  const [user, setUser] = useState<StudentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/student/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401) {
        clearStudentAuth()
        router.push('/login')
        return
      }

      const data = await response.json()
      if (data.success && data.user) {
        setUser(data.user)
        // Update localStorage
        localStorage.setItem('student_user', JSON.stringify(data.user))
      } else {
        // Invalid response, clear token and redirect
        clearStudentAuth()
        router.push('/login')
      }
    } catch (err) {
      console.error("Error loading user data:", err)
      // Clear invalid token and redirect
      clearStudentAuth()
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    clearStudentAuth()
    router.push('/student/login')
  }

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Unable to load profile</p>
          <p className="text-muted-foreground mb-4">Please try logging in again</p>
          <Button onClick={() => {
            localStorage.removeItem('student_token')
            localStorage.removeItem('student_role')
            localStorage.removeItem('student_user')
            router.push('/login')
          }}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  const isProfileComplete = user.profileComplete
  
  // Calculate completion percentage
  const completionSteps = [
    user.hasIdDocument,
    user.hasRecommendationLetter,
    user.hasEssay
  ]
  const completedSteps = completionSteps.filter(Boolean).length
  const completionPercentage = Math.round((completedSteps / 3) * 100)

  const NavItem = ({ id, label }: { id: string, label: string }) => (
    <button
      onClick={() => {
        setActiveTab(id)
        setIsMobileMenuOpen(false)
      }}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        activeTab === id 
          ? "bg-[#212E3E] text-white shadow-md shadow-[#212E3E]/10" 
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#E5C985]/20 flex items-center justify-center text-[#E5C985]">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">Chenaniah</span>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavItem id="overview" label="Overview" />
              <NavItem id="assignments" label="Assignments" />
              <NavItem id="payments" label="Payments" />
              <NavItem id="resources" label="Resources" />
              <NavItem id="profile" label="My Profile" />
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-border/40">
              <div className="text-right">
                <p className="text-sm font-medium leading-none">{user.username}</p>
                <p className="text-xs text-muted-foreground mt-1">Choir</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#212E3E] text-white flex items-center justify-center font-medium">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive transition-colors hidden md:flex"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background p-4 space-y-4 animate-in slide-in-from-top-2">
            <nav className="flex flex-col gap-2">
              <NavItem id="overview" label="Overview" />
              <NavItem id="assignments" label="Assignments" />
              <NavItem id="payments" label="Payments" />
              <NavItem id="resources" label="Resources" />
              <NavItem id="profile" label="My Profile" />
            </nav>
            <div className="pt-4 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#212E3E] text-white flex items-center justify-center font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">{user.username}</p>
                  <p className="text-xs text-muted-foreground mt-1">Student</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive">
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-[#212E3E]">
                  Welcome back, {user.fullNameEnglish?.split(' ')[0] || user.username}
                </h1>
                <p className="text-muted-foreground">Here's what's happening with your courses today.</p>
              </div>
              {!isProfileComplete && (
                <div className="bg-[#E5C985]/10 text-[#212E3E] px-4 py-2 rounded-full text-sm font-medium border border-[#E5C985]/20 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Profile Incomplete ({completionPercentage}%)
                </div>
              )}
            </div>

            {/* Coming Soon Banner */}
            <Alert className="border-[#E5C985]/30 bg-[#E5C985]/5">
              <Sparkles className="h-5 w-5 text-[#E5C985]" />
              <AlertTitle className="text-[#212E3E] font-semibold">Portal Under Development</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                The full student portal with assignments, payments, and resources is currently under development. 
                For now, please complete your profile to get started. More features coming soon!
              </AlertDescription>
            </Alert>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-lg shadow-black/5 bg-gradient-to-br from-white to-muted/20">
                <CardHeader className="pb-2">
                  <CardDescription className="text-[#E5C985] font-medium">Profile Status</CardDescription>
                  <CardTitle className="text-3xl text-[#212E3E]">{completionPercentage}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#E5C985] transition-all duration-1000 ease-out" 
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-lg shadow-black/5 bg-white">
                <CardHeader className="pb-2">
                  <CardDescription>Pending Assignments</CardDescription>
                  <CardTitle className="text-3xl text-[#212E3E]">0</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">You're all caught up!</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg shadow-black/5 bg-white">
                <CardHeader className="pb-2">
                  <CardDescription>New Resources</CardDescription>
                  <CardTitle className="text-3xl text-[#212E3E]">0</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Check back later for updates</p>
                </CardContent>
              </Card>
            </div>

            {/* Profile Completion Alert */}
            {!isProfileComplete && (
              <div className="bg-white border border-[#E5C985]/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-lg shadow-[#E5C985]/5">
                <div className="w-12 h-12 rounded-full bg-[#E5C985]/10 flex items-center justify-center shrink-0 text-[#E5C985]">
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-[#212E3E] mb-1">Complete Your Profile</h3>
                  <p className="text-muted-foreground text-sm">
                    You need to upload your ID document, recommendation letter, and essay to access all features.
                  </p>
                </div>
                <Button 
                  onClick={() => setActiveTab("profile")}
                  className="bg-[#212E3E] hover:bg-[#212E3E]/90 text-white rounded-xl px-6"
                >
                  Complete Now
                </Button>
              </div>
            )}

            {/* Recent Activity / Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="h-full border-none shadow-lg shadow-black/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileCheck className="h-5 w-5 text-[#E5C985]" />
                    Recent Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-40 text-center p-4 border-2 border-dashed border-muted rounded-xl bg-muted/10">
                    <p className="text-muted-foreground text-sm">No recent assignments</p>
                    <Button variant="link" onClick={() => setActiveTab("assignments")} className="text-[#E5C985]">
                      View all assignments
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full border-2 border-[#E5C985] shadow-lg shadow-[#E5C985]/10 bg-gradient-to-br from-white to-[#E5C985]/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-[#E5C985]" />
                    Monthly Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                    <p className="text-muted-foreground text-sm mb-4">Submit your monthly contributions</p>
                    <Button 
                      onClick={() => setActiveTab("payments")} 
                      className="bg-[#212E3E] hover:bg-[#212E3E]/90 text-white w-full"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Go to Payments
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full border-none shadow-lg shadow-black/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-[#E5C985]" />
                    Latest Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-40 text-center p-4 border-2 border-dashed border-muted rounded-xl bg-muted/10">
                    <p className="text-muted-foreground text-sm">No recent resources</p>
                    <Button variant="link" onClick={() => setActiveTab("resources")} className="text-[#E5C985]">
                      Browse library
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-2 text-[#212E3E]">My Profile</h1>
              <p className="text-muted-foreground">Manage your personal information and documents.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ProfileCompletionForm 
                  user={user} 
                  onUpdate={loadUserData}
                />
              </div>
              <div className="space-y-6">
                <Card className="border-none shadow-lg shadow-black/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Account Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Full Name</p>
                      <p className="font-medium">{user.fullNameEnglish || "Not set"}</p>
                      <p className="text-sm text-muted-foreground mt-1">{user.fullNameAmharic}</p>
                    </div>
                    <div className="h-px bg-border/50" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Contact</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                    <div className="h-px bg-border/50" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Username</p>
                      <p className="font-medium">{user.username}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-[#E5C985] shadow-lg shadow-[#E5C985]/10 bg-gradient-to-br from-white to-[#E5C985]/5">
                  <CardHeader className="bg-[#E5C985]/10">
                    <CardTitle className="text-lg flex items-center gap-2 text-[#212E3E]">
                      <DollarSign className="h-5 w-5 text-[#E5C985]" />
                      Monthly Payments
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Submit your monthly contributions with deposit slip
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Button
                      onClick={() => {
                        setActiveTab("payments")
                        // Scroll to top to ensure form is visible
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="w-full bg-[#212E3E] hover:bg-[#212E3E]/90 text-white h-12 text-base font-semibold shadow-md"
                    >
                      <DollarSign className="h-5 w-5 mr-2" />
                      Go to Payments
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Click to submit your monthly payment
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-2 text-[#212E3E]">Assignments</h1>
              <p className="text-muted-foreground">View and submit your course assignments.</p>
            </div>
            <StudentAssignments user={user} />
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-2 text-[#212E3E]">Monthly Payments</h1>
              <p className="text-muted-foreground">Submit your monthly contributions with deposit slip.</p>
            </div>
            <StudentPayments user={user} />
          </div>
        )}

        {activeTab === "resources" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-2 text-[#212E3E]">Learning Resources</h1>
              <p className="text-muted-foreground">Access study materials and downloads.</p>
            </div>
            <StudentResources user={user} />
          </div>
        )}
      </main>
    </div>
  )
}

