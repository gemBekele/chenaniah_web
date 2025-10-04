"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Music,
  FileAudio,
} from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://15.204.227.47:5000/api"

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

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<string>("all")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [comments, setComments] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [playingAudio, setPlayingAudio] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const getToken = () => localStorage.getItem("admin_token")

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

  const fetchSubmissions = async (status?: string) => {
    setIsLoading(true)
    try {
      const url =
        status && status !== "all" ? `${API_BASE_URL}/submissions?status=${status}` : `${API_BASE_URL}/submissions`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setSubmissions(data.submissions)
      }
    } catch (error) {
      console.error("Error fetching submissions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchSubmissions()
  }, [])

  useEffect(() => {
    const statusFilter = selectedTab === "all" ? undefined : selectedTab
    fetchSubmissions(statusFilter)
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
        // Refresh data
        fetchStats()
        fetchSubmissions(selectedTab === "all" ? undefined : selectedTab)
        setSelectedSubmission(null)
        setComments("")
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const toggleAudio = async (submissionId: number, audioPath: string) => {
    console.log("toggleAudio called:", { submissionId, audioPath, API_BASE_URL })

    if (playingAudio === submissionId) {
      audioRef.current?.pause()
      setPlayingAudio(null)
    } else {
      if (audioRef.current) {
        try {
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

          audioRef.current
            .play()
            .then(() => {
              console.log("Audio playback started successfully")
              setPlayingAudio(submissionId)
            })
            .catch((error) => {
              console.error("Audio playback failed:", error)
              setPlayingAudio(null)
            })
        } catch (error) {
          console.error("Error fetching audio:", error)
          setPlayingAudio(null)
        }
      } else {
        console.error("Audio element not found")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      pending: { color: "bg-warning-light text-warning border-warning/20", icon: Clock },
      approved: { color: "bg-success-light text-success border-success/20", icon: CheckCircle },
      rejected: { color: "bg-error-light text-error border-error/20", icon: XCircle },
    }
    const variant = variants[status] || variants.pending
    const Icon = variant.icon
    return (
      <Badge className={`${variant.color} flex items-center gap-1.5 px-3 py-1 border font-medium`}>
        <Icon className="h-3.5 w-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredSubmissions = submissions.filter(
    (sub) =>
      sub.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.phone?.includes(searchQuery) ||
      sub.church?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-card border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Screening Dashboard</h1>
                <p className="text-sm text-muted-foreground">Chenaniah Worship Ministry</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline" size="sm" className="gap-2 hover:bg-muted bg-transparent">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Applications</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Pending Review</p>
                  <p className="text-3xl font-bold text-warning">{stats.pending}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-warning-light">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Approved</p>
                  <p className="text-3xl font-bold text-success">{stats.approved}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-success-light">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-error">{stats.rejected}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-error-light">
                  <XCircle className="h-6 w-6 text-error" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, phone, or church..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card border-border/50 shadow-sm focus:shadow-md transition-shadow"
            />
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6 bg-card border border-border/50 p-1 shadow-sm">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All Applications
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Approved
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Rejected
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading applications...</p>
                </div>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted">
                      <FileAudio className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium text-foreground">No applications found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-5">
                {filteredSubmissions.map((submission) => (
                  <Card
                    key={submission.id}
                    className="border-border/50 shadow-sm hover:shadow-lg transition-all duration-200"
                  >
                    <CardContent className="p-6 lg:p-8">
                      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        {/* Left: Applicant Info */}
                        <div className="flex-1 space-y-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-bold text-foreground mb-1">{submission.name}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                Applied {formatDate(submission.submitted_at)}
                              </p>
                            </div>
                            {getStatusBadge(submission.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 text-sm bg-muted/50 p-3 rounded-lg">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-card">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                                <p className="font-medium">{submission.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm bg-muted/50 p-3 rounded-lg">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-card">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Address</p>
                                <p className="font-medium">{submission.address}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm bg-muted/50 p-3 rounded-lg">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-card">
                                <Church className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Church</p>
                                <p className="font-medium">{submission.church}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm bg-muted/50 p-3 rounded-lg">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-card">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Telegram</p>
                                <p className="font-medium">@{submission.telegram_username || "N/A"}</p>
                              </div>
                            </div>
                          </div>

                          {submission.reviewer_comments && (
                            <div className="bg-muted/70 border border-border/50 p-4 rounded-xl">
                              <p className="text-sm font-semibold text-foreground mb-2">Review Comments</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {submission.reviewer_comments}
                              </p>
                              {submission.reviewed_by && (
                                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                                  Reviewed by {submission.reviewed_by} on{" "}
                                  {submission.reviewed_at && formatDate(submission.reviewed_at)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right: Audio Player & Actions */}
                        <div className="lg:w-80 space-y-4">
                          <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20 p-5 rounded-xl">
                            <div className="flex items-center gap-2 mb-4">
                              <Music className="h-4 w-4 text-primary" />
                              <p className="text-sm font-semibold text-foreground">Worship Sample</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <Button
                                onClick={() => toggleAudio(submission.id, submission.audio_file_path || "")}
                                size="lg"
                                className="flex-shrink-0 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
                                disabled={!submission.audio_file_path}
                              >
                                {playingAudio === submission.id ? (
                                  <Pause className="h-6 w-6" />
                                ) : (
                                  <Play className="h-6 w-6 ml-0.5" />
                                )}
                              </Button>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground mb-1">
                                  {playingAudio === submission.id ? "Now Playing" : "Ready to Play"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(submission.audio_file_size)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {submission.status === "pending" && (
                            <div className="space-y-3">
                              <Button
                                onClick={() => setSelectedSubmission(submission)}
                                className="w-full h-11 bg-success hover:bg-success/90 text-white font-semibold shadow-sm hover:shadow-md transition-all"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Application
                              </Button>
                              <Button
                                onClick={() => setSelectedSubmission(submission)}
                                className="w-full h-11 bg-error hover:bg-error/90 text-white font-semibold shadow-sm hover:shadow-md transition-all"
                                variant="destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Application
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg border-border/50 shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Review Application</CardTitle>
              <CardDescription className="text-base">
                {selectedSubmission.name} • {selectedSubmission.church}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="comments" className="text-sm font-medium mb-2 block">
                  Comments (optional)
                </Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any comments about this application..."
                  rows={4}
                  className="resize-none bg-input border-border/50"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleStatusUpdate(selectedSubmission.id, "approved")}
                  className="flex-1 h-11 bg-success hover:bg-success/90 text-white font-semibold"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleStatusUpdate(selectedSubmission.id, "rejected")}
                  className="flex-1 h-11 bg-error hover:bg-error/90 text-white font-semibold"
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
                className="w-full h-11"
                variant="outline"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingAudio(null)}
        onError={(e) => {
          console.error("Audio element error:", e)
          setPlayingAudio(null)
        }}
        onLoadStart={() => console.log("Audio loading started")}
        onCanPlay={() => console.log("Audio can play")}
        onLoadedData={() => console.log("Audio data loaded")}
      />
    </div>
  )
}
