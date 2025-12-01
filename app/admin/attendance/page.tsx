"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Loader2,
  MapPin,
  User,
  Eye,
} from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { format } from "date-fns"

const API_BASE_URL = getApiBaseUrl()

interface Session {
  id: number
  name: string
  date: string
  location?: string
  facilitatorId?: string
  status: string
  createdAt: string
  updatedAt: string
  attendanceRecords?: AttendanceRecord[]
}

interface AttendanceRecord {
  id: number
  sessionId: number
  studentId: number
  scannedAt: string
  syncedAt?: string
  isOffline: boolean
  student: {
    id: number
    fullNameEnglish?: string
    fullNameAmharic?: string
    username: string
  }
}

interface SessionStats {
  sessionId: number
  sessionName: string
  totalStudents: number
  attendanceCount: number
  offlineCount: number
  attendanceRate: number
}

export default function AdminAttendancePage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [newSessionName, setNewSessionName] = useState("")
  const [newSessionDate, setNewSessionDate] = useState("")
  const [newSessionLocation, setNewSessionLocation] = useState("")

  const getToken = () => {
    let token = localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token")
    if (!token) {
      const compressedToken = localStorage.getItem("admin_token_compressed")
      const header = localStorage.getItem("admin_token_header")
      if (compressedToken && header) {
        token = `${header}.${compressedToken}`
      }
    }
    return token
  }

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/admin")
      return
    }
    loadSessions()
  }, [router, statusFilter])

  const loadSessions = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await fetch(`${API_BASE_URL}/attendance/sessions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })

      if (response.status === 401) {
        localStorage.removeItem("admin_token")
        router.push("/admin")
        return
      }

      const data = await response.json()
      if (data.success) {
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error("Error loading sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSessionDetails = async (sessionId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })

      const data = await response.json()
      if (data.success) {
        setSelectedSession(data.session)
        loadSessionStats(sessionId)
      }
    } catch (error) {
      console.error("Error loading session details:", error)
    }
  }

  const loadSessionStats = async (sessionId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/sessions/${sessionId}/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })

      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const createSession = async () => {
    if (!newSessionName || !newSessionDate) {
      alert("Please fill in session name and date")
      return
    }

    setIsCreatingSession(true)
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: newSessionName,
          date: new Date(newSessionDate).toISOString(),
          location: newSessionLocation || undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setShowCreateDialog(false)
        setNewSessionName("")
        setNewSessionDate("")
        setNewSessionLocation("")
        await loadSessions()
      } else {
        alert(`Failed to create session: ${data.error}`)
      }
    } catch (error) {
      console.error("Error creating session:", error)
      alert("Failed to create session")
    } finally {
      setIsCreatingSession(false)
    }
  }

  const updateSessionStatus = async (sessionId: number, status: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/sessions/${sessionId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()
      if (data.success) {
        await loadSessions()
        if (selectedSession?.id === sessionId) {
          await loadSessionDetails(sessionId)
        }
      } else {
        alert(`Failed to update session: ${data.error}`)
      }
    } catch (error) {
      console.error("Error updating session:", error)
      alert("Failed to update session")
    }
  }

  const handleViewSession = async (session: Session) => {
    await loadSessionDetails(session.id)
    setShowViewDialog(true)
  }

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.facilitatorId?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_token_compressed")
    localStorage.removeItem("admin_token_header")
    sessionStorage.removeItem("admin_token")
    router.push("/admin")
  }

  if (isLoading) {
    return (
      <AdminLayout onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Attendance</h1>
            <p className="text-muted-foreground">
              Manage sessions and track student attendance
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
                <DialogDescription>
                  Set up a new attendance session for students to check in.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="session-name">Session Name</Label>
                  <Input
                    id="session-name"
                    placeholder="e.g., Sunday Service, Bible Study"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="session-date">Date & Time</Label>
                  <Input
                    id="session-date"
                    type="datetime-local"
                    value={newSessionDate}
                    onChange={(e) => setNewSessionDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="session-location">Location (Optional)</Label>
                  <Input
                    id="session-location"
                    placeholder="e.g., Main Sanctuary"
                    value={newSessionLocation}
                    onChange={(e) => setNewSessionLocation(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={isCreatingSession}
                >
                  Cancel
                </Button>
                <Button onClick={createSession} disabled={isCreatingSession}>
                  {isCreatingSession ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Session"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground/50" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{sessions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {sessions.filter((s) => s.status === "active").length} active now
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Attendance</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground/50" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {sessions.reduce(
                  (sum, s) => sum + (s.attendanceRecords?.length || 0),
                  0
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Across all sessions</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {sessions.filter((s) => s.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Currently open</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <XCircle className="h-4 w-4 text-blue-500/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {sessions.filter((s) => s.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Past sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Content */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border border-border/50 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full sm:w-48"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <Card className="shadow-sm border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              {filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-muted/50 p-4 rounded-full mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No sessions found</h3>
                  <p className="text-muted-foreground max-w-sm mt-1">
                    We couldn't find any sessions matching your search. Try adjusting your filters or create a new session.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("")
                      setStatusFilter("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/30 text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 font-medium">Session Details</th>
                      <th className="px-6 py-4 font-medium">Location</th>
                      <th className="px-6 py-4 font-medium">Attendance</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{session.name}</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(session.date), "MMM dd, yyyy")}</span>
                              <Clock className="h-3 w-3 ml-1" />
                              <span>{format(new Date(session.date), "hh:mm a")}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {session.location ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{session.location}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50 italic">No location</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 text-primary p-1.5 rounded-full">
                              <Users className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium">{session.attendanceRecords?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              session.status === "active"
                                ? "default"
                                : session.status === "completed"
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              session.status === "active" 
                                ? "bg-emerald-500 hover:bg-emerald-600 border-transparent" 
                                : session.status === "completed"
                                ? "bg-blue-500 hover:bg-blue-600 text-white border-transparent"
                                : ""
                            }
                          >
                            {session.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewSession(session)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <span className="sr-only">View</span>
                            </Button>
                            {session.status === "active" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateSessionStatus(session.id, "completed")}
                                className="h-8 text-xs"
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>

        {/* View Session Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 gap-0">
            <DialogHeader className="p-6 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl">
                    {selectedSession?.name}
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    Attendance details and records
                  </DialogDescription>
                </div>
                {selectedSession && (
                  <Badge
                    variant={
                      selectedSession.status === "active"
                        ? "default"
                        : selectedSession.status === "completed"
                        ? "secondary"
                        : "outline"
                    }
                    className={
                      selectedSession.status === "active" 
                        ? "bg-emerald-500 hover:bg-emerald-600 border-transparent" 
                        : selectedSession.status === "completed"
                        ? "bg-blue-500 hover:bg-blue-600 text-white border-transparent"
                        : ""
                    }
                  >
                    {selectedSession.status}
                  </Badge>
                )}
              </div>
            </DialogHeader>
            
            {selectedSession && stats && (
              <div className="flex flex-col">
                {/* Session Info Bar */}
                <div className="bg-muted/30 px-6 py-4 border-y border-border/50 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-background p-2 rounded-md border border-border/50">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Date & Time</p>
                      <p className="text-sm font-medium">{format(new Date(selectedSession.date), "PP p")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-background p-2 rounded-md border border-border/50">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Location</p>
                      <p className="text-sm font-medium">{selectedSession.location || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-background p-2 rounded-md border border-border/50">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Facilitator</p>
                      <p className="text-sm font-medium">{selectedSession.facilitatorId || "Not assigned"}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card border border-border/50 rounded-lg p-4 shadow-sm">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Total Students</p>
                      <p className="text-2xl font-bold text-foreground">{stats.totalStudents}</p>
                    </div>
                    <div className="bg-card border border-border/50 rounded-lg p-4 shadow-sm">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Present</p>
                      <p className="text-2xl font-bold text-emerald-600">{stats.attendanceCount}</p>
                    </div>
                    <div className="bg-card border border-border/50 rounded-lg p-4 shadow-sm">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Attendance Rate</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.attendanceRate.toFixed(1)}%</p>
                    </div>
                    <div className="bg-card border border-border/50 rounded-lg p-4 shadow-sm">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Offline Records</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.offlineCount}</p>
                    </div>
                  </div>

                  {/* Attendance Records Table */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold">Attendance Records</h3>
                      <Badge variant="outline" className="font-normal">
                        {selectedSession.attendanceRecords?.length || 0} records
                      </Badge>
                    </div>
                    
                    <div className="border border-border/50 rounded-lg overflow-hidden">
                      {selectedSession.attendanceRecords && selectedSession.attendanceRecords.length > 0 ? (
                        <div className="max-h-[400px] overflow-y-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground sticky top-0 z-10">
                              <tr>
                                <th className="px-4 py-3 font-medium">Student</th>
                                <th className="px-4 py-3 font-medium">Username</th>
                                <th className="px-4 py-3 font-medium">Scanned At</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {selectedSession.attendanceRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-muted/20">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                        {(record.student.fullNameEnglish || record.student.username).substring(0, 2).toUpperCase()}
                                      </div>
                                      <span className="font-medium">
                                        {record.student.fullNameEnglish || record.student.username}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground">{record.student.username}</td>
                                  <td className="px-4 py-3 text-muted-foreground">
                                    {format(new Date(record.scannedAt), "hh:mm a")}
                                  </td>
                                  <td className="px-4 py-3">
                                    {record.isOffline ? (
                                      <Badge variant="outline" className="text-xs">Offline</Badge>
                                    ) : (
                                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-transparent text-xs">Synced</Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground bg-muted/10">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                          <p>No attendance records yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

