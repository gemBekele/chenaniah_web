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
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
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
      } else {
        alert(`Failed to update session: ${data.error}`)
      }
    } catch (error) {
      console.error("Error updating session:", error)
      alert("Failed to update session")
    }
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
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance</h1>
            <p className="text-muted-foreground mt-1">
              Manage sessions and track student attendance
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
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
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{sessions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-emerald-500 font-medium">{sessions.filter((s) => s.status === "active").length} active</span> now
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Attendance</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
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
          <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {sessions.filter((s) => s.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Currently open</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                <XCircle className="h-4 w-4 text-orange-500" />
              </div>
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
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border/60 focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border/60 rounded-md">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer text-foreground outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <Card className="shadow-sm border-border/40 overflow-hidden bg-card">
            <div className="overflow-x-auto">
              {filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-muted/30 p-4 rounded-full mb-4">
                    <Search className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No sessions found</h3>
                  <p className="text-muted-foreground max-w-sm mt-2">
                    We couldn't find any sessions matching your search. Try adjusting your filters or create a new session.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-6"
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
                  <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border/40">
                    <tr>
                      <th className="px-6 py-4">Session Details</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Attendance</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors">{session.name}</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(session.date), "MMM dd, yyyy")}</span>
                              <span className="text-border">|</span>
                              <Clock className="h-3 w-3" />
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
                            variant="outline"
                            className={
                              session.status === "active" 
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                                : session.status === "completed"
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                : "bg-gray-500/10 text-gray-600 border-gray-500/20"
                            }
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                              session.status === "active" ? "bg-emerald-500" : 
                              session.status === "completed" ? "bg-blue-500" : "bg-gray-500"
                            }`} />
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/attendance/${session.id}`)}
                              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            {session.status === "active" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateSessionStatus(session.id, "completed")}
                                className="h-8 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
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
      </div>
    </AdminLayout>
  )
}

