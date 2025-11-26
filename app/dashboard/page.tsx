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
import Image from 'next/image'
import ProfileCompletionForm from '@/components/student-profile-completion'
import StudentAssignments from '@/components/student-assignments'
import StudentResources from '@/components/student-resources'
import StudentPayments from '@/components/student-payments'

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
        router.push('/login')
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
          ? "bg-[#1f2d3d] text-white shadow-sm" 
          : "text-gray-600 hover:bg-gray-100 hover:text-[#1f2d3d]"
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Image 
                src="/assets/logo/logo_full.png" 
                alt="Chenaniah.org Logo" 
                width={120} 
                height={40} 
                className="h-8 sm:h-10 w-auto"
              />
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavItem id="overview" label="Overview" />
              <NavItem id="assignments" label="Assignments" />
              <NavItem id="payments" label="Contributions" />
              <NavItem id="resources" label="Resources" />
              <NavItem id="profile" label="My Profile" />
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium leading-none text-[#1f2d3d]">{user.username}</p>
                <p className="text-xs text-gray-500 mt-1">Student</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#1f2d3d] text-white flex items-center justify-center font-medium">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors hidden md:flex"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white p-4 space-y-4 animate-in slide-in-from-top-2 shadow-lg">
            <nav className="flex flex-col gap-2">
              <NavItem id="overview" label="Overview" />
              <NavItem id="assignments" label="Assignments" />
              <NavItem id="payments" label="Contributions" />
              <NavItem id="resources" label="Resources" />
              <NavItem id="profile" label="My Profile" />
            </nav>
            <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1f2d3d] text-white flex items-center justify-center font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium leading-none text-[#1f2d3d]">{user.username}</p>
                  <p className="text-xs text-gray-500 mt-1">Student</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">
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
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-[#1f2d3d]">
                  Welcome back, {user.fullNameEnglish?.split(' ')[0] || user.username}
                </h1>
                <p className="text-gray-500">Here's what's happening with your courses today.</p>
              </div>
              {!isProfileComplete && (
                <div className="bg-[#e8cb85]/10 text-[#1f2d3d] px-4 py-2 rounded-full text-sm font-medium border border-[#e8cb85]/20 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-[#e8cb85]" />
                  Profile Incomplete ({completionPercentage}%)
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-gray-200 shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardDescription className="text-[#e8cb85] font-medium">Profile Status</CardDescription>
                  <CardTitle className="text-3xl text-[#1f2d3d]">{completionPercentage}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#e8cb85] transition-all duration-1000 ease-out" 
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-gray-200 shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardDescription className="text-gray-500">Pending Assignments</CardDescription>
                  <CardTitle className="text-3xl text-[#1f2d3d]">0</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-400">You're all caught up!</p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardDescription className="text-gray-500">New Resources</CardDescription>
                  <CardTitle className="text-3xl text-[#1f2d3d]">0</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-400">Check back later for updates</p>
                </CardContent>
              </Card>
            </div>

            {/* Profile Completion Alert */}
            {!isProfileComplete && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#e8cb85]/10 flex items-center justify-center shrink-0 text-[#e8cb85]">
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-[#1f2d3d] mb-1">Complete Your Profile</h3>
                  <p className="text-gray-500 text-sm">
                    You need to upload your ID document, recommendation letter, and essay to access all features.
                  </p>
                </div>
                <Button 
                  onClick={() => setActiveTab("profile")}
                  className="bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white rounded-xl px-6 shadow-sm"
                >
                  Complete Now
                </Button>
              </div>
            )}

            {/* Recent Activity / Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="h-full border-gray-200 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-[#1f2d3d]">
                    <FileCheck className="h-5 w-5 text-[#e8cb85]" />
                    Recent Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-40 text-center p-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
                    <p className="text-gray-500 text-sm">No recent assignments</p>
                    <Button variant="link" onClick={() => setActiveTab("assignments")} className="text-[#e8cb85] hover:text-[#dcb55d]">
                      View all assignments
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full border-gray-200 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-[#1f2d3d]">
                    <DollarSign className="h-5 w-5 text-[#e8cb85]" />
                    Monthly Contributions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                    <p className="text-gray-500 text-sm mb-4">Submit your monthly contributions</p>
                    <Button 
                      onClick={() => setActiveTab("payments")} 
                      className="bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white w-full shadow-sm"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Go to Contributions
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full border-gray-200 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-[#1f2d3d]">
                    <BookOpen className="h-5 w-5 text-[#e8cb85]" />
                    Latest Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-40 text-center p-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
                    <p className="text-gray-500 text-sm">No recent resources</p>
                    <Button variant="link" onClick={() => setActiveTab("resources")} className="text-[#e8cb85] hover:text-[#dcb55d]">
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
              <h1 className="text-2xl font-bold tracking-tight mb-2 text-[#1f2d3d]">My Profile</h1>
              <p className="text-gray-500">Manage your personal information and documents.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ProfileCompletionForm 
                  user={user} 
                  onUpdate={loadUserData}
                />
              </div>
              <div className="space-y-6">
                <Card className="border-gray-200 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#1f2d3d]">Account Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Full Name</p>
                      <p className="font-medium text-[#1f2d3d]">{user.fullNameEnglish || "Not set"}</p>
                      <p className="text-sm text-gray-500 mt-1">{user.fullNameAmharic}</p>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Contact</p>
                      <p className="font-medium text-[#1f2d3d]">{user.phone}</p>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Username</p>
                      <p className="font-medium text-[#1f2d3d]">{user.username}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm bg-white">
                  <CardHeader className="bg-gray-50 border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center gap-2 text-[#1f2d3d]">
                      <DollarSign className="h-5 w-5 text-[#e8cb85]" />
                      Monthly Contributions
                    </CardTitle>
                    <CardDescription className="mt-1 text-gray-500">
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
                      className="w-full bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white h-12 text-base font-semibold shadow-sm"
                    >
                      <DollarSign className="h-5 w-5 mr-2" />
                      Go to Contributions
                    </Button>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Click to submit your monthly contribution
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
              <h1 className="text-2xl font-bold tracking-tight mb-2 text-[#1f2d3d]">Assignments</h1>
              <p className="text-gray-500">View and submit your course assignments.</p>
            </div>
            <StudentAssignments user={user} />
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-2 text-[#1f2d3d]">Monthly Contributions</h1>
              <p className="text-gray-500">Submit your monthly contributions with deposit slip.</p>
            </div>
            <StudentPayments user={user} />
          </div>
        )}

        {activeTab === "resources" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-2 text-[#1f2d3d]">Learning Resources</h1>
              <p className="text-gray-500">Access study materials and downloads.</p>
            </div>
            <StudentResources user={user} />
          </div>
        )}
      </main>
    </div>
  )
}

