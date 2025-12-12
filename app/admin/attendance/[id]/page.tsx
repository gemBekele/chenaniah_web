"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Loader2,
  CheckCircle,
  Search,
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

export default function SessionDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

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
    loadSessionData()
  }, [params.id])

  const loadSessionData = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      const [sessionRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/attendance/sessions/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/attendance/sessions/${params.id}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const sessionData = await sessionRes.json()
      const statsData = await statsRes.json()

      if (sessionData.success) {
        setSession(sessionData.session)
      }
      if (statsData.success) {
        setStats(statsData.stats)
      }
    } catch (error) {
      console.error("Error loading session data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSessionStatus = async (status: string) => {
    if (!session) return
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/sessions/${session.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()
      if (data.success) {
        loadSessionData()
      } else {
        alert(`Failed to update session: ${data.error}`)
      }
    } catch (error) {
      console.error("Error updating session:", error)
      alert("Failed to update session")
    }
  }

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

  if (!session) {
    return (
      <AdminLayout onLogout={handleLogout}>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4">
          <h2 className="text-xl font-semibold">Session not found</h2>
          <Button onClick={() => router.push("/admin/attendance")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Attendance
          </Button>
        </div>
      </AdminLayout>
    )
  }

  const filteredRecords = session?.attendanceRecords?.filter(record => {
    const searchLower = searchQuery.toLowerCase()
    return (
      record.student.fullNameEnglish?.toLowerCase().includes(searchLower) ||
      record.student.fullNameAmharic?.toLowerCase().includes(searchLower) ||
      record.student.username.toLowerCase().includes(searchLower)
    )
  }) || []

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="pl-0 hover:bg-transparent hover:text-primary mb-2"
              onClick={() => router.push("/admin/attendance")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sessions
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{session.name}</h1>
              <Badge
                variant="outline"
                className={
                  session.status === "active"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-2.5 py-0.5"
                    : session.status === "completed"
                    ? "bg-blue-500/10 text-blue-600 border-blue-500/20 px-2.5 py-0.5"
                    : "bg-gray-500/10 text-gray-600 border-gray-500/20 px-2.5 py-0.5"
                }
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                  session.status === "active" ? "bg-emerald-500" : 
                  session.status === "completed" ? "bg-blue-500" : "bg-gray-500"
                }`} />
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(session.date), "PPP")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(session.date), "p")}</span>
              </div>
              {session.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{session.location}</span>
                </div>
              )}
              {session.facilitatorId && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{session.facilitatorId}</span>
                </div>
              )}
            </div>
          </div>

          {session.status === "active" && (
            <Button
              onClick={() => updateSessionStatus("completed")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Completed
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Students</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{stats.totalStudents}</span>
                <span className="text-xs text-muted-foreground">enrolled</span>
              </div>
            </Card>
            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Present</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-emerald-600">{stats.attendanceCount}</span>
                <span className="text-xs text-emerald-600/80">students</span>
              </div>
            </Card>
            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Attendance Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600">{stats.attendanceRate.toFixed(1)}%</span>
                <span className="text-xs text-blue-600/80">participation</span>
              </div>
            </Card>
            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Offline Records</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-orange-600">{stats.offlineCount}</span>
                <span className="text-xs text-orange-600/80">synced later</span>
              </div>
            </Card>
          </div>
        )}

        {/* Attendance List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Attendance Records</h2>
            <Badge variant="secondary" className="font-normal bg-muted text-muted-foreground">
              {session.attendanceRecords?.length || 0} records
            </Badge>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-sm bg-background border-border/60 focus:border-primary/50"
            />
          </div>

          <Card className="border-border/40 shadow-sm overflow-hidden bg-card">
            {filteredRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border/40">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Username</th>
                      <th className="px-6 py-4">Scanned At</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold ring-2 ring-background">
                              {(record.student.fullNameEnglish || record.student.username).substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-foreground">
                              {record.student.fullNameEnglish || record.student.username}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{record.student.username}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {format(new Date(record.scannedAt), "hh:mm a")}
                        </td>
                        <td className="px-6 py-4">
                          {record.isOffline ? (
                            <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 bg-orange-50">Offline</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50">Synced</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="bg-muted/50 p-3 rounded-full mb-3">
                  <Users className="h-6 w-6 opacity-40" />
                </div>
                <p>{session.attendanceRecords && session.attendanceRecords.length > 0 ? "No matching students found" : "No attendance records yet"}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
