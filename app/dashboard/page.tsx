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
  DollarSign,
  QrCode
} from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { clearStudentAuth } from "@/lib/auth"
import Link from 'next/link'
import Image from 'next/image'
import ProfileCompletionForm from '@/components/student-profile-completion'
import StudentAssignments from '@/components/student-assignments'
import StudentResources from '@/components/student-resources'
import StudentPayments from '@/components/student-payments'
import StudentIDCard from '@/components/student-id-card'
import StudentNoticeBoard from '@/components/student-notice-board'

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
  hasPortrait?: boolean
  photoPath?: string
}

export default function StudentDashboardPage() {
  const [user, setUser] = useState<StudentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null)
  const [qrCodeLoading, setQrCodeLoading] = useState(false)
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
        // Load QR code
        loadQRCode(token)
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

  const loadQRCode = async (token: string) => {
    setQrCodeLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/student/qrcode`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.qrCodeImage) {
          setQrCodeImage(data.qrCodeImage)
        }
      }
    } catch (err) {
      console.error("Error loading QR code:", err)
    } finally {
      setQrCodeLoading(false)
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
    user.hasEssay,
    !!user.photoPath
  ]
  const completedSteps = completionSteps.filter(Boolean).length
  const completionPercentage = Math.round((completedSteps / 4) * 100)

  const NavItem = ({ id, label }: { id: string, label: string }) => (
    <button
      onClick={() => {
        setActiveTab(id)
        setIsMobileMenuOpen(false)
      }}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        activeTab === id 
          ? "bg-[#1f2d3d] text-white shadow-md" 
          : "text-gray-500 hover:bg-gray-100 hover:text-[#1f2d3d]"
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <Image 
                src="/assets/logo/logo_full.png" 
                alt="Chenaniah.org Logo" 
                width={120} 
                height={40} 
                className="h-8 w-auto"
              />
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavItem id="overview" label="Overview" />
              <NavItem id="assignments" label="Assignments" />
              {/* <NavItem id="payments" label="Contributions" /> */}
              <NavItem id="resources" label="Resources" />
              <NavItem id="profile" label="My Profile" />
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right">
                <p className="text-sm font-semibold leading-none text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500 mt-0.5">Choir Member</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#1f2d3d] text-white flex items-center justify-center font-medium text-lg shadow-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-gray-600 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors hidden md:flex rounded-full"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 p-4 space-y-4 animate-in slide-in-from-top-2 shadow-xl z-50">
            <nav className="flex flex-col gap-2">
              <NavItem id="overview" label="Overview" />
              <NavItem id="assignments" label="Assignments" />
              {/* <NavItem id="payments" label="Contributions" /> */}
              <NavItem id="resources" label="Resources" />
              <NavItem id="profile" label="My Profile" />
            </nav>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1f2d3d] text-white flex items-center justify-center font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none text-[#1f2d3d]">{user.username}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Choir Member</p>
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
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-[#1f2d3d]">
                  Welcome back, {user.fullNameEnglish?.split(' ')[0] || user.username}
                </h1>
                <p className="text-gray-500 text-lg">Here's what's happening with your courses today.</p>
              </div>
              {!isProfileComplete && (
                <div className="bg-[#e8cb85]/10 text-[#1f2d3d] px-4 py-2 rounded-full text-sm font-medium border border-[#e8cb85]/20 flex items-center gap-2 shadow-sm">
                  <AlertCircle className="h-4 w-4 text-[#e8cb85]" />
                  Profile Incomplete ({completionPercentage}%)
                </div>
              )}
            </div>

            {/* Notice Board */}
            <StudentNoticeBoard />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-gray-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] bg-white hover:shadow-md transition-shadow duration-200 group">
                <CardHeader className="pb-2">
                  <CardDescription className="text-[#e8cb85] font-semibold uppercase tracking-wider text-xs group-hover:text-[#d4b770] transition-colors">Profile Status</CardDescription>
                  <CardTitle className="text-4xl font-bold text-[#1f2d3d]">{completionPercentage}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
                    <div 
                      className="h-full bg-[#e8cb85] transition-all duration-1000 ease-out rounded-full" 
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-gray-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] bg-white hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardDescription className="text-gray-500 font-semibold uppercase tracking-wider text-xs">Pending Assignments</CardDescription>
                  <CardTitle className="text-4xl font-bold text-[#1f2d3d]">0</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 mt-2">You're all caught up!</p>
                </CardContent>
              </Card>

              <Card className="border-gray-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] bg-white hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardDescription className="text-gray-500 font-semibold uppercase tracking-wider text-xs">New Resources</CardDescription>
                  <CardTitle className="text-4xl font-bold text-[#1f2d3d]">0</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 mt-2">Check back later for updates</p>
                </CardContent>
              </Card>
            </div>

            {/* Profile Completion Alert */}
            {!isProfileComplete && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]">
                <div className="w-14 h-14 rounded-full bg-[#e8cb85]/10 flex items-center justify-center shrink-0 text-[#e8cb85]">
                  <User className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-[#1f2d3d] mb-2">Complete Your Profile</h3>
                  <p className="text-gray-500 leading-relaxed">
                    You need to upload your ID document, recommendation letter, essay, and profile photo to access all features.
                  </p>
                </div>
                <Button 
                  onClick={() => setActiveTab("profile")}
                  className="bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white rounded-xl px-8 py-6 shadow-lg shadow-[#1f2d3d]/10 text-base font-medium transition-all hover:scale-105 active:scale-95 w-full md:w-auto"
                >
                  Complete Now
                </Button>
              </div>
            )}

            {/* Recent Activity / Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="h-full border-gray-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] bg-white hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-[#1f2d3d]">
                    <FileCheck className="h-5 w-5 text-[#e8cb85]" />
                    Recent Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-48 text-center p-6 border-2 border-dashed border-gray-50 rounded-xl bg-gray-50/50">
                    <p className="text-gray-500 text-sm mb-2">No recent assignments</p>
                    <Button variant="link" onClick={() => setActiveTab("assignments")} className="text-[#e8cb85] hover:text-[#d4b770] font-medium">
                      View all assignments
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* <Card className="h-full border-gray-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] bg-white hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-[#1f2d3d]">
                    <DollarSign className="h-5 w-5 text-[#e8cb85]" />
                    Monthly Contributions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-48 text-center p-6">
                    <p className="text-gray-500 text-sm mb-6">Submit your monthly contributions</p>
                    <Button 
                      onClick={() => setActiveTab("payments")} 
                      className="bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white w-full shadow-lg shadow-[#1f2d3d]/10 py-6 rounded-xl text-base"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Go to Contributions
                    </Button>
                  </div>
                </CardContent>
              </Card> */}

              <Card className="h-full border-gray-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] bg-white hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-[#1f2d3d]">
                    <BookOpen className="h-5 w-5 text-[#e8cb85]" />
                    Latest Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-48 text-center p-6 border-2 border-dashed border-gray-50 rounded-xl bg-gray-50/50">
                    <p className="text-gray-500 text-sm mb-2">No recent resources</p>
                    <Button variant="link" onClick={() => setActiveTab("resources")} className="text-[#e8cb85] hover:text-[#d4b770] font-medium">
                      Browse library
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900">My Profile</h1>
              <p className="text-gray-500 text-lg">Manage your personal information and documents.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - ID Card */}
              <div className="space-y-6">
                <Card className="border-gray-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                      <QrCode className="h-5 w-5" />
                      CHOIR ID Card
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Download your ID card with QR code
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {qrCodeLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-4" />
                        <p className="text-sm text-gray-500">Loading QR code...</p>
                      </div>
                    ) : qrCodeImage ? (
                      <StudentIDCard 
                        user={user} 
                        qrCodeImage={qrCodeImage}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center py-8">
                          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-sm font-medium text-gray-900 mb-2">QR code is loading</p>
                          <p className="text-xs text-gray-500 mb-4">
                            Please wait a moment or click retry to reload
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
                              if (token) {
                                loadQRCode(token)
                              }
                            }}
                            className="border-gray-200"
                          >
                            Retry Loading QR Code
                          </Button>
                        </div>
                        {/* Show ID card preview even without QR code */}
                        <div className="border-2 border-dashed border-gray-100 rounded-xl p-4 bg-gray-50/50"> 
                          <p className="text-xs text-gray-500 text-center mb-2">
                            ID Card Preview (QR code will appear when loaded)
                          </p>
                          <StudentIDCard 
                            user={user} 
                            qrCodeImage={null}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card> 
              </div>

              {/* Right Column - Profile Form */}
              <div className="lg:col-span-2">
                <ProfileCompletionForm 
                  user={user} 
                  onUpdate={loadUserData}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900">Assignments</h1>
              <p className="text-gray-500 text-lg">View and submit your course assignments.</p>
            </div>
            <StudentAssignments user={user} />
          </div>
        )}

        {/* {activeTab === "payments" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900">Monthly Contributions</h1>
              <p className="text-gray-500 text-lg">Submit your monthly contributions with deposit slip.</p>
            </div>
            <StudentPayments user={user} />
          </div>
        )} */}

        {activeTab === "resources" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900">Learning Resources</h1>
              <p className="text-gray-500 text-lg">Access study materials and downloads.</p>
            </div>
            <StudentResources user={user} />
          </div>
        )}
      </main>
    </div>
  )
}

