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

export default function AdminAttendancePage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<"sessions" | "insights">("sessions")
  const [missedFilter, setMissedFilter] = useState<string>("all")
  const [rateFilter, setRateFilter] = useState<string>("all")
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
    loadData()
  }, [router, statusFilter])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      
      // Load sessions
      const sessionParams = new URLSearchParams()
      if (statusFilter !== "all") {
        sessionParams.append("status", statusFilter)
      }
      const sessionsRes = await fetch(`${API_BASE_URL}/attendance/sessions?${sessionParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      // Load active students
      const studentsRes = await fetch(`${API_BASE_URL}/admin/trainees?status=active&limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (sessionsRes.status === 401 || studentsRes.status === 401) {
        localStorage.removeItem("admin_token")
        router.push("/admin")
        return
      }

      const sessionsData = await sessionsRes.json()
      const studentsData = await studentsRes.json()

      if (sessionsData.success) {
        setSessions(sessionsData.sessions || [])
      }
      if (studentsData.success) {
        setStudents(studentsData.students || [])
      }
    } catch (error) {
      console.error("Error loading data:", error)
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
        await loadData()
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
        await loadData()
      } else {
        alert(`Failed to update session: ${data.error}`)
      }
    } catch (error) {
      console.error("Error updating session:", error)
      alert("Failed to update session")
    }
  }

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const calculateStudentStats = () => {
    const completedSessions = sessions.filter(s => s.status === 'completed')
    const totalCompleted = completedSessions.length

    return students.map(student => {
      const attendedCount = completedSessions.filter(session => 
        session.attendanceRecords?.some(record => record.studentId === student.id)
      ).length
      
      const missedCount = totalCompleted - attendedCount
      const attendanceRate = totalCompleted > 0 ? (attendedCount / totalCompleted) * 100 : 0

      return {
        ...student,
        attendedCount,
        missedCount,
        attendanceRate
      }
    })
  }

  const studentStats = calculateStudentStats()
  
  const filteredStudentStats = studentStats.filter(stat => {
    const matchesSearch = (stat.fullNameEnglish || stat.username).toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesMissed = true
    if (missedFilter === "high") matchesMissed = stat.missedCount >= 3
    else if (missedFilter === "medium") matchesMissed = stat.missedCount >= 1 && stat.missedCount < 3
    else if (missedFilter === "low") matchesMissed = stat.missedCount === 0
    else if (missedFilter !== "all") {
      // Dynamic numeric filter if the user enters a number
      const num = parseInt(missedFilter)
      if (!isNaN(num)) matchesMissed = stat.missedCount === num
    }

    let matchesRate = true
    if (rateFilter === "low") matchesRate = stat.attendanceRate < 50
    else if (rateFilter === "medium") matchesRate = stat.attendanceRate >= 50 && stat.attendanceRate < 80
    else if (rateFilter === "high") matchesRate = stat.attendanceRate >= 80

    return matchesSearch && matchesMissed && matchesRate
  })

  return (
    <AdminLayout>
      <div className="space-y-8 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1f2d3d]">Attendance Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage sessions and track student attendance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={activeTab === "sessions" ? "default" : "outline"}
              onClick={() => setActiveTab("sessions")}
              className={activeTab === "sessions" ? "bg-[#1f2d3d] text-white" : ""}
            >
              Sessions
            </Button>
            <Button 
              variant={activeTab === "insights" ? "default" : "outline"}
              onClick={() => setActiveTab("insights")}
              className={activeTab === "insights" ? "bg-[#1f2d3d] text-white" : ""}
            >
              Student Insights
            </Button>
          </div>

          {activeTab === "sessions" && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#e8cb85] text-[#1f2d3d] hover:bg-[#e8cb85]/90 shadow-sm font-semibold">
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
                  <Button onClick={createSession} disabled={isCreatingSession} className="bg-[#1f2d3d] text-white">
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
          )}
        </div>

        {activeTab === "sessions" ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Sessions</p>
                    <p className="text-2xl font-bold text-[#1f2d3d]">{sessions.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                    <p className="text-2xl font-bold text-[#1f2d3d]">
                      {sessions.filter((s) => s.status === "active").length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed Sessions</p>
                    <p className="text-2xl font-bold text-[#1f2d3d]">
                      {sessions.filter((s) => s.status === "completed").length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters & Content */}
            <Card className="border-none shadow-md bg-white overflow-hidden">
              <CardHeader className="border-b border-gray-50 bg-gray-50/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="text-xl text-[#1f2d3d]">Attendance Sessions</CardTitle>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search sessions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e8cb85]/20"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-[#e8cb85]" />
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No sessions found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4">Session Name</th>
                          <th className="px-6 py-4">Date & Time</th>
                          <th className="px-6 py-4">Location</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredSessions.map((session) => (
                          <tr key={session.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="font-bold text-[#1f2d3d] group-hover:text-[#e8cb85] transition-colors">
                                {session.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                {format(new Date(session.date), "MMM d, yyyy")}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                <Clock className="h-3 w-3" />
                                {format(new Date(session.date), "hh:mm a")}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {session.location ? (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                  {session.location}
                                </div>
                              ) : (
                                <span className="text-gray-300 italic">Not specified</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {session.status === "active" ? (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 shadow-none">
                                  Active
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100 shadow-none">
                                  Completed
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {session.status === "active" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateSessionStatus(session.id, "completed")}
                                    className="h-8 border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all text-xs font-semibold"
                                  >
                                    Complete
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/admin/attendance/${session.id}`)}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-[#1f2d3d] hover:bg-gray-100"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Student Insights Content */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-[#1f2d3d]">{students.length}</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-500 mb-1">Avg. Attendance</p>
                  <p className="text-3xl font-bold text-[#1f2d3d]">
                    {(studentStats.reduce((acc, s) => acc + s.attendanceRate, 0) / (students.length || 1)).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-500 mb-1">Perfect Attendance</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {studentStats.filter(s => s.attendanceRate === 100).length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-500 mb-1">Critical (Missed 3+)</p>
                  <p className="text-3xl font-bold text-rose-600">
                    {studentStats.filter(s => s.missedCount >= 3).length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-md bg-white overflow-hidden">
              <CardHeader className="border-b border-gray-50 bg-gray-50/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="text-xl text-[#1f2d3d]">Student Attendance Insights</CardTitle>
                  <div className="flex flex-wrap gap-4">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <select
                        value={missedFilter}
                        onChange={(e) => setMissedFilter(e.target.value)}
                        className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e8cb85]/20"
                      >
                        <option value="all">Missed Sessions</option>
                        <option value="low">None (0)</option>
                        <option value="medium">Some (1-2)</option>
                        <option value="high">Many (3+)</option>
                        {[1, 2, 3, 4, 5].map(n => (
                          <option key={n} value={n.toString()}>{n} Session{n > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <select
                      value={rateFilter}
                      onChange={(e) => setRateFilter(e.target.value)}
                      className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e8cb85]/20"
                    >
                      <option value="all">Attendance Rate</option>
                      <option value="high">High (&gt;80%)</option>
                      <option value="medium">Medium (50-80%)</option>
                      <option value="low">Low (&lt;50%)</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4 text-center">Attended</th>
                        <th className="px-6 py-4 text-center">Missed</th>
                        <th className="px-6 py-4">Attendance Rate</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredStudentStats.map((stat) => (
                        <tr key={stat.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-[#1f2d3d] text-white flex items-center justify-center font-bold text-xs">
                                {(stat.fullNameEnglish || stat.username).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-[#1f2d3d]">{stat.fullNameEnglish || stat.username}</div>
                                <div className="text-xs text-gray-400">{stat.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-emerald-600 bg-emerald-50/20">
                            {stat.attendedCount}
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-rose-600 bg-rose-50/20">
                            {stat.missedCount}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    stat.attendanceRate >= 80 ? 'bg-emerald-500' : 
                                    stat.attendanceRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${stat.attendanceRate}%` }}
                                />
                              </div>
                              <span className="font-bold text-[#1f2d3d] w-12 text-right">
                                {stat.attendanceRate.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/trainees/${stat.id}`)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-[#1f2d3d] hover:bg-gray-100"
                            >
                              <User className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
