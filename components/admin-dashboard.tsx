"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  MapPin,
  Church,
  LogOut,
  Search,
  FileAudio,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import Image from "next/image"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://www.chenaniah.org/api"

interface Submission {
  id: number
  user_id: number
  name: string
  address: string
  phone: string
  church: string
  telegram_username: string
  audio_file_path: string
  audio_file_size: number
  audio_duration: number
  submitted_at: string
  status: "pending" | "approved" | "rejected"
  reviewer_comments: string | null
  reviewed_at: string | null
  reviewed_by: string | null
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
}

interface PaginationInfo {
  current_page: number
  total_pages: number
  total_count: number
  limit: number
  offset: number
  has_next: boolean
  has_prev: boolean
}

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    limit: 100,
    offset: 0,
    has_next: false,
    has_prev: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<string>("all")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [comments, setComments] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [playingAudio, setPlayingAudio] = useState<number | null>(null)
  const [loadingAudio, setLoadingAudio] = useState<number | null>(null)
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0)
  const [audioProgress, setAudioProgress] = useState<number>(0)
  const [registrationOpen, setRegistrationOpen] = useState<boolean>(true)
  const [isTogglingRegistration, setIsTogglingRegistration] = useState<boolean>(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const getToken = () => {
    let token = localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token")

    // If no full token, try to reconstruct from compressed storage
    if (!token) {
      const compressedToken = localStorage.getItem("admin_token_compressed")
      const header = localStorage.getItem("admin_token_header")
      if (compressedToken && header) {
        token = `${header}.${compressedToken}`
      }
    }

    return token
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchRegistrationStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/registration/status`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setRegistrationOpen(data.registration_open)
      }
    } catch (error) {
      console.error("Error fetching registration status:", error)
    }
  }

  const toggleRegistrationStatus = async () => {
    setIsTogglingRegistration(true)
    try {
      const response = await fetch(`${API_BASE_URL}/registration/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          registration_open: !registrationOpen,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setRegistrationOpen(data.registration_open)
      }
    } catch (error) {
      console.error("Error toggling registration status:", error)
    } finally {
      setIsTogglingRegistration(false)
    }
  }

  const fetchSubmissions = async (status?: string, page: number = 1, searchQuery?: string, limit?: number) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: (limit || pagination.limit).toString()
      })
      
      if (status && status !== "all") {
        params.append('status', status)
      }
      
      if (searchQuery && searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }

      const url = `${API_BASE_URL}/submissions?${params.toString()}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setSubmissions(data.submissions)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching submissions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchRegistrationStatus()
    fetchSubmissions()
  }, [])

  useEffect(() => {
    const statusFilter = selectedTab === "all" ? undefined : selectedTab
    fetchSubmissions(statusFilter, 1, searchQuery) // Reset to page 1 when changing tabs
  }, [selectedTab])

  const handleStatusUpdate = async (submissionId: number, newStatus: "approved" | "rejected") => {
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          status: newStatus,
          comments: comments,
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Update only the specific submission in state
        setSubmissions(prevSubmissions => 
          prevSubmissions.map(submission => 
            submission.id === submissionId 
              ? { 
                  ...submission, 
                  status: newStatus,
                  reviewer_comments: comments,
                  reviewed_at: new Date().toISOString(),
                  reviewed_by: "Admin"
                }
              : submission
          )
        )
        
        // Update stats without refetching all submissions
        setStats(prevStats => {
          // Find the current submission to determine what status it was before
          const currentSubmission = submissions.find(s => s.id === submissionId)
          if (!currentSubmission) return prevStats
          
          const wasPending = currentSubmission.status === "pending"
          const isApproved = newStatus === "approved"
          
          return {
            ...prevStats,
            pending: wasPending ? prevStats.pending - 1 : prevStats.pending,
            approved: isApproved ? prevStats.approved + 1 : prevStats.approved,
            rejected: !isApproved ? prevStats.rejected + 1 : prevStats.rejected
          }
        })
        
        setSelectedSubmission(null)
        setComments("")
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const handleStatusToggle = async (submissionId: number, currentStatus: string) => {
    const newStatus = currentStatus === "approved" ? "rejected" : "approved"
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          status: newStatus,
          comments: `Status changed from ${currentStatus} to ${newStatus}`,
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Update only the specific submission in state
        setSubmissions(prevSubmissions => 
          prevSubmissions.map(submission => 
            submission.id === submissionId 
              ? { 
                  ...submission, 
                  status: newStatus as "approved" | "rejected",
                  reviewer_comments: `Status changed from ${currentStatus} to ${newStatus}`,
                  reviewed_at: new Date().toISOString(),
                  reviewed_by: "Admin"
                }
              : submission
          )
        )
        
        // Update stats without refetching all submissions
        setStats(prevStats => {
          const delta = newStatus === "approved" ? 1 : -1
          const oldDelta = currentStatus === "approved" ? -1 : 1
          return {
            ...prevStats,
            approved: prevStats.approved + delta,
            rejected: prevStats.rejected + oldDelta
          }
        })
      }
    } catch (error) {
      console.error("Error toggling status:", error)
    }
  }

  const toggleAudio = async (submissionId: number, audioPath: string) => {
    console.log("toggleAudio called:", { submissionId, audioPath, API_BASE_URL })

    if (playingAudio === submissionId) {
      audioRef.current?.pause()
      setPlayingAudio(null)
      setAudioCurrentTime(0)
      setAudioProgress(0)
    } else {
      if (audioRef.current) {
        try {
          setLoadingAudio(submissionId)
          const audioUrl = `${API_BASE_URL}/audio/${audioPath}`
          console.log("Fetching audio from:", audioUrl)

          // Fetch audio with authentication
          const response = await fetch(audioUrl, {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          // Create blob URL for the audio
          const audioBlob = await response.blob()
          const blobUrl = URL.createObjectURL(audioBlob)

          console.log("Setting audio src to blob URL:", blobUrl)
          audioRef.current.src = blobUrl
          audioRef.current.load()

          // Set up event listeners for progress tracking
          audioRef.current.addEventListener('loadedmetadata', () => {
            if (audioRef.current) {
              setAudioDuration(audioRef.current.duration)
            }
          })

          audioRef.current.addEventListener('timeupdate', () => {
            if (audioRef.current) {
              const currentTime = audioRef.current.currentTime
              const duration = audioRef.current.duration
              setAudioCurrentTime(currentTime)
              setAudioProgress((currentTime / duration) * 100)
            }
          })

          audioRef.current.addEventListener('ended', () => {
            setPlayingAudio(null)
            setAudioCurrentTime(0)
            setAudioProgress(0)
          })

          audioRef.current
            .play()
            .then(() => {
              console.log("Audio playback started successfully")
              setPlayingAudio(submissionId)
              setLoadingAudio(null)
            })
            .catch((error) => {
              console.error("Audio playback failed:", error)
              setPlayingAudio(null)
              setLoadingAudio(null)
            })
        } catch (error) {
          console.error("Error fetching audio:", error)
          setPlayingAudio(null)
          setLoadingAudio(null)
        }
      } else {
        console.error("Audio element not found")
        setLoadingAudio(null)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      pending: {
        color: "text-amber-600 dark:text-amber-400",
        icon: Clock,
      },
      approved: {
        color: "text-emerald-600 dark:text-emerald-400",
        icon: CheckCircle,
      },
      rejected: {
        color: "text-rose-600 dark:text-rose-400",
        icon: XCircle,
      },
    }
    const variant = variants[status] || variants.pending
    const Icon = variant.icon
    return (
      <Badge variant="outline" className={`${variant.color} bg-transparent border-transparent flex items-center gap-1.5 px-3 py-1.5 font-medium`}>
        <Icon className="h-3.5 w-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredSubmissions = submissions

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePageChange = (newPage: number) => {
    const statusFilter = selectedTab === "all" ? undefined : selectedTab
    fetchSubmissions(statusFilter, newPage, searchQuery)
  }

  const handlePageSizeChange = (newLimit: number) => {
    const statusFilter = selectedTab === "all" ? undefined : selectedTab
    // Update pagination state and fetch with new limit
    setPagination(prev => ({ ...prev, limit: newLimit, current_page: 1 }))
    // Call fetchSubmissions with explicit parameters
    fetchSubmissions(statusFilter, 1, searchQuery, newLimit)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const statusFilter = selectedTab === "all" ? undefined : selectedTab
      fetchSubmissions(statusFilter, 1, searchQuery) // Reset to page 1 when searching
    }, 500) // 500ms delay

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/40">
        <div className="container mx-auto px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {/* <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl blur-lg opacity-40"></div> */}
                <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl ">
                  <Image 
                    src="/assets/logo/logo_icon.png" 
                    alt="Chenaniah Logo" 
                    width={35} 
                    height={35}
                    className="object-contain"
                  />
                </div>
              </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Screening Dashboard
              </h1>
              <p className="text-sm text-muted-foreground font-medium text-primary">Chenaniah Music Ministry</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Registration Control */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Registration:</span>
              <Button
                onClick={toggleRegistrationStatus}
                disabled={isTogglingRegistration}
                variant="ghost"
                size="sm"
                className={`gap-2 transition-all ${
                  registrationOpen 
                    ? "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" 
                    : "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                }`}
              >
                {isTogglingRegistration ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : registrationOpen ? (
                  <ToggleRight className="h-4 w-4" />
                ) : (
                  <ToggleLeft className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {registrationOpen ? "Open" : "Closed"}
                </span>
              </Button>
            </div>
            <Button onClick={onLogout} variant="ghost" size="sm" className="gap-2 hover:bg-muted/50 transition-all">
              <LogOut className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8 lg:mb-10">
          <div className="group relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br from-background to-muted/30 p-3 lg:p-6 border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-muted/20">
            <div className="absolute top-0 right-0 w-16 h-16 lg:w-32 lg:h-32 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1 lg:mb-2">Total Applications</p>
              <p className="text-2xl lg:text-4xl font-bold text-foreground mb-2 lg:mb-3">{stats.total}</p>
              <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-muted/50 group-hover:bg-muted transition-colors">
                <User className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl lg:rounded-2xl bg-amber-50 p-3 lg:p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
            <div className="absolute top-0 right-0 w-16 h-16 lg:w-32 lg:h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1 lg:mb-2">Pending Review</p>
              <p className="text-2xl lg:text-4xl font-bold text-amber-600 dark:text-amber-500 mb-2 lg:mb-3">{stats.pending}</p>
              <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-amber-600 dark:text-amber-500" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl lg:rounded-2xl bg-emerald-50 p-3 lg:p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
            <div className="absolute top-0 right-0 w-16 h-16 lg:w-32 lg:h-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1 lg:mb-2">Approved</p>
              <p className="text-2xl lg:text-4xl font-bold text-emerald-600 dark:text-emerald-500 mb-2 lg:mb-3">{stats.approved}</p>
              <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 dark:text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl lg:rounded-2xl bg-rose-50 p-3 lg:p-6 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/10">
            <div className="absolute top-0 right-0 w-16 h-16 lg:w-32 lg:h-32 bg-gradient-to-br from-rose-500/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1 lg:mb-2">Rejected</p>
              <p className="text-2xl lg:text-4xl font-bold text-rose-600 dark:text-rose-500 mb-2 lg:mb-3">{stats.rejected}</p>
              <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
                <XCircle className="h-4 w-4 lg:h-5 lg:w-5 text-rose-600 dark:text-rose-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative group">
            {/* <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div> */}
          <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5  text-amber-500 " />
            <Input
              type="text"
              placeholder="Search by name, phone, or church..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-14 h-14 bg-background/50 backdrop-blur-sm border-border/50 rounded-2xl text-base focus:border-amber-500/50 focus:ring-amber-500/20 transition-all"
            />
            </div>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="mb-6 lg:mb-8 overflow-x-auto">
            <TabsList className="bg-muted/50 backdrop-blur-sm p-1 rounded-xl border border-border/50 inline-flex min-w-max">
              <TabsTrigger
                value="all"
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:shadow-md data-[state=active]:shadow-muted/20 px-3 lg:px-6 py-2 lg:py-2.5 font-medium transition-all text-sm lg:text-base whitespace-nowrap"
              >
                <span className="hidden sm:inline">All Applications</span>
                <span className="sm:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:shadow-md data-[state=active]:shadow-muted/20 px-3 lg:px-6 py-2 lg:py-2.5 font-medium transition-all text-sm lg:text-base whitespace-nowrap"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:shadow-md data-[state=active]:shadow-muted/20 px-3 lg:px-6 py-2 lg:py-2.5 font-medium transition-all text-sm lg:text-base whitespace-nowrap"
              >
                Approved
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:shadow-md data-[state=active]:shadow-muted/20 px-3 lg:px-6 py-2 lg:py-2.5 font-medium transition-all text-sm lg:text-base whitespace-nowrap"
              >
                Rejected
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={selectedTab}>
            {isLoading ? (
              <div className="flex justify-center py-24">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {/* <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-xl opacity-40"></div> */}
                    <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-muted border-t-amber-500"></div>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Loading applications...</p>
                </div>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="rounded-3xl bg-gradient-to-br from-background to-muted/30 border border-border/50 p-20 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-muted/50">
                    <FileAudio className="h-10 w-10 text-muted-foreground" />
                    </div>
                  <div>
                    <p className="text-xl font-semibold text-foreground mb-2">No applications found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-gradient-to-br from-background to-muted/20 border border-border/50 overflow-hidden">
                {/* Desktop Table (lg and up) */}
                <div className="hidden lg:block">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-muted/30 border-b border-border/50">
                    <div className="col-span-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Applicant</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Contact</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Church</p>
                    </div>
                    <div className="col-span-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Submitted</p>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Audio Sample</p>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Status</p>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Actions</p>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-border/30">
                    {filteredSubmissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="group grid grid-cols-12 gap-4 px-6 py-5 hover:bg-muted/20 transition-colors"
                      >
                        {/* Applicant Info */}
                        <div className="col-span-2 flex flex-col justify-center">
                          <p className="text-base font-semibold text-foreground mb-1 text-balance">{submission.name}</p>
                          <p className="text-sm text-muted-foreground">@{submission.telegram_username || "N/A"}</p>
                        </div>

                        {/* Contact */}
                        <div className="col-span-2 flex flex-col justify-center">
                          <p className="text-base font-semibold text-foreground mb-1 flex items-center gap-1.5">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            {submission.phone}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-muted-foreground" />
                            <span className="line-clamp-2">{submission.address}</span>
                          </p>
                        </div>

                        {/* Church */}
                        <div className="col-span-2 flex items-center">
                          <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                            <Church className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <span className="line-clamp-2">{submission.church}</span>
                          </p>
                        </div>

                        {/* Submitted Date */}
                        <div className="col-span-1 flex items-center">
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="text-md font-medium">{formatDate(submission.submitted_at)}</span>
                          </p>
                        </div>

                        {/* Audio Sample */}
                        <div className="col-span-2 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <Button
                              onClick={() => toggleAudio(submission.id, submission.audio_file_path || "")}
                              size="icon"
                              className="w-10 h-10 rounded-xl bg-primary-foreground shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                              disabled={!submission.audio_file_path || loadingAudio === submission.id}
                            >
                              {loadingAudio === submission.id ? (
                                <Loader2 className="h-4 w-4 text-primary animate-spin hover:text-black" />
                              ) : playingAudio === submission.id ? (
                                <Pause className="h-4 w-4 text-primary hover:text-black" />
                              ) : (
                                <Play className="h-4 w-4 ml-0.5 text-primary hover:text-black" />
                              )}
                            </Button>
                            
                            {/* Audio Duration Display */}
                            {submission.audio_duration && (
                              <div className="text-xs text-muted-foreground">
                                <span>{formatTime(submission.audio_duration)}</span>
                              </div>
                            )}
                            
                              {/* Progress Bar - Only show when playing */}
                              {playingAudio === submission.id && audioDuration > 0 && (
                                <div className="w-full max-w-96">
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div 
                                      className="bg-primary h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${audioProgress}%` }}
                                    />
                                  </div>
                                  
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="col-span-2 flex items-center justify-center">
                          {getStatusBadge(submission.status)}
                          {submission.reviewer_comments && (
                            <div className="ml-2 group/tooltip relative">
                              <div className="w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center text-xs text-muted-foreground cursor-help">
                                i
                              </div>
                              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-popover border border-border rounded-xl shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10">
                                <p className="text-xs text-popover-foreground">{submission.reviewer_comments}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex items-center justify-center">
                          {submission.status === "pending" && (
                            <Button
                              onClick={() => setSelectedSubmission(submission)}
                              size="sm"
                              variant="ghost"
                              className="h-9 px-3 hover:bg-muted/50 rounded-lg"
                            >
                              Review
                            </Button>
                          )}
                          {(submission.status === "approved" || submission.status === "rejected") && (
                            <Button
                              onClick={() => handleStatusToggle(submission.id, submission.status)}
                              size="sm"
                              variant="outline"
                              className={`h-9 px-3 rounded-lg transition-all ${
                                submission.status === "approved" 
                                  ? "border-rose-500/50 text-rose-600 hover:bg-rose-50 hover:border-rose-500" 
                                  : "border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500"
                              }`}
                            >
                              {submission.status === "approved" ? "Reject" : "Approve"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Cards (below lg) */}
                <div className="lg:hidden divide-y divide-border/30">
                  {filteredSubmissions.map((submission) => (
                    <div key={submission.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-foreground truncate">{submission.name}</p>
                          <p className="text-xs text-muted-foreground truncate">@{submission.telegram_username || "N/A"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(submission.status)}
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2">
                        <p className="text-sm text-foreground flex items-center gap-1.5">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {submission.phone}
                        </p>
                        <p className="text-sm text-foreground flex items-center gap-1.5">
                          <Church className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{submission.church}</span>
                        </p>
                        {submission.address && (
                          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                            <span className="line-clamp-2">{submission.address}</span>
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">{formatDate(submission.submitted_at)}</p>
                      </div>

                      {submission.reviewer_comments && (
                        <div className="mt-2 rounded-lg bg-muted/40 border border-border/60 p-2">
                          <p className="text-xs text-muted-foreground">{submission.reviewer_comments}</p>
                        </div>
                      )}

                      <div className="mt-4 space-y-3">
                        {/* Audio Controls */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => toggleAudio(submission.id, submission.audio_file_path || "")}
                              size="sm"
                              className="h-9 px-3 rounded-lg bg-primary-foreground"
                              disabled={!submission.audio_file_path || loadingAudio === submission.id}
                            >
                              {loadingAudio === submission.id ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                  <span className="text-sm text-primary">Loading...</span>
                                </div>
                              ) : playingAudio === submission.id ? (
                                <div className="flex items-center gap-2">
                                  <Pause className="h-4 w-4 text-primary" />
                                  <span className="text-sm text-primary">Pause</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Play className="h-4 w-4 ml-0.5 text-primary" />
                                  <span className="text-sm text-primary">Play</span>
                                </div>
                              )}
                            </Button>
                            
                            {/* Audio Duration Display */}
                            {submission.audio_duration && (
                              <div className="text-xs text-muted-foreground">
                                <span>{formatTime(submission.audio_duration)}</span>
                              </div>
                            )}
                          </div>

                          {submission.status === "pending" && (
                            <Button
                              onClick={() => setSelectedSubmission(submission)}
                              size="sm"
                              variant="outline"
                              className="h-9 px-3 rounded-lg"
                            >
                              Review
                            </Button>
                          )}
                          {(submission.status === "approved" || submission.status === "rejected") && (
                            <Button
                              onClick={() => handleStatusToggle(submission.id, submission.status)}
                              size="sm"
                              variant="outline"
                              className={`h-9 px-3 rounded-lg transition-all ${
                                submission.status === "approved" 
                                  ? "border-rose-500/50 text-rose-600 hover:bg-rose-50 hover:border-rose-500" 
                                  : "border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500"
                              }`}
                            >
                              {submission.status === "approved" ? "Reject" : "Approve"}
                            </Button>
                          )}
                        </div>
                        
                        {/* Progress Bar - Only show when playing */}
                        {playingAudio === submission.id && audioDuration > 0 && (
                          <div className="w-full">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${audioProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Pagination Controls */}
        {!isLoading && filteredSubmissions.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-br from-background to-muted/20 border border-border/50 rounded-2xl">
            {/* Page Size Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Show:</span>
              <select
                value={pagination.limit}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-2 bg-background border border-border/50 rounded-lg text-sm focus:border-amber-500/50 focus:ring-amber-500/20 transition-all"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            {/* Pagination Info */}
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.current_page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.current_page * pagination.limit, pagination.total_count)} of{' '}
              {pagination.total_count} submissions
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(1)}
                disabled={!pagination.has_prev}
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0 rounded-xl border-border/50 hover:bg-primary/10 hover:border-primary/50 transition-all"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={!pagination.has_prev}
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0 rounded-xl border-border/50 hover:bg-primary/10 hover:border-primary/50 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.total_pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.current_page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.current_page >= pagination.total_pages - 2) {
                    pageNum = pagination.total_pages - 4 + i;
                  } else {
                    pageNum = pagination.current_page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      size="sm"
                      variant={pageNum === pagination.current_page ? "default" : "outline"}
                      className={`h-9 w-9 p-0 rounded-xl transition-all ${
                        pageNum === pagination.current_page 
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20" 
                          : "border-border/50 hover:bg-primary/10 hover:border-primary/50"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={!pagination.has_next}
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0 rounded-xl border-border/50 hover:bg-primary/10 hover:border-primary/50 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handlePageChange(pagination.total_pages)}
                disabled={!pagination.has_next}
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0 rounded-xl border-border/50 hover:bg-primary/10 hover:border-primary/50 transition-all"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="w-full max-w-lg rounded-3xl bg-gradient-to-br from-background to-muted/30 border border-border/50 shadow-2xl shadow-black/20 animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-6 border-b border-border/50">
              {/* <h2 className="text-2xl font-bold text-foreground mb-2">Review Application</h2> */}
              <p className="text-xl text-muted-foreground font-light">
                {selectedSubmission.name} • {selectedSubmission.church}
              </p>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <Label htmlFor="comments" className="text-sm font-semibold mb-3 block uppercase tracking-wide">
                  Comments (optional)
                </Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any comments about this application..."
                  rows={4}
                  className="resize-none rounded-xl bg-muted/30 border-border/50 focus:border-violet-500/50 focus:ring-violet-500/20"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleStatusUpdate(selectedSubmission.id, "approved")}
                  className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 transition-all"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleStatusUpdate(selectedSubmission.id, "rejected")}
                  className="flex-1 h-12 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/40 transition-all"
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
              <Button
                onClick={() => {
                  setSelectedSubmission(null)
                  setComments("")
                }}
                className="w-full h-12 rounded-xl font-semibold hover:bg-muted/50"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => {
          setPlayingAudio(null)
          setAudioCurrentTime(0)
          setAudioProgress(0)
        }}
        onError={(e) => {
          console.error("Audio element error:", e)
          setPlayingAudio(null)
          setLoadingAudio(null)
          setAudioCurrentTime(0)
          setAudioProgress(0)
        }}
        onLoadStart={() => console.log("Audio loading started")}
        onCanPlay={() => console.log("Audio can play")}
        onLoadedData={() => console.log("Audio data loaded")}
      />
    </div>
  )
}
