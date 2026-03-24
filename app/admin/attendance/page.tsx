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
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  PieChart,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  X,
  SlidersHorizontal,
} from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { format } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from "recharts"

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
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [chartView, setChartView] = useState<"bar" | "pie" | "line">("bar")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [attendanceRateRange, setAttendanceRateRange] = useState<[number, number]>([0, 100])
  const [missedSessionsRange, setMissedSessionsRange] = useState<[number, number]>([0, 10])

  const getToken = () => {
    let token = localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token")
    if (!token) {
      token = localStorage.getItem("student_token") || sessionStorage.getItem("student_token")
    }
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
        localStorage.removeItem('student_token')
        sessionStorage.removeItem("admin_token")
        sessionStorage.removeItem('student_token')
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
  
  const toggleRowExpansion = (studentId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId)
    } else {
      newExpanded.add(studentId)
    }
    setExpandedRows(newExpanded)
  }

  const getChartData = () => {
    const attendanceRanges = [
      { name: '0-25%', count: 0, color: '#ef4444' },
      { name: '26-50%', count: 0, color: '#f97316' },
      { name: '51-75%', count: 0, color: '#eab308' },
      { name: '76-90%', count: 0, color: '#22c55e' },
      { name: '91-100%', count: 0, color: '#16a34a' },
    ]

    studentStats.forEach(stat => {
      if (stat.attendanceRate <= 25) attendanceRanges[0].count++
      else if (stat.attendanceRate <= 50) attendanceRanges[1].count++
      else if (stat.attendanceRate <= 75) attendanceRanges[2].count++
      else if (stat.attendanceRate <= 90) attendanceRanges[3].count++
      else attendanceRanges[4].count++
    })

    return attendanceRanges
  }

  const getAttendanceTrendData = () => {
    const completedSessions = sessions.filter(s => s.status === 'completed').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    return completedSessions.map(session => {
      const attendanceCount = session.attendanceRecords?.length || 0
      const totalStudents = students.length
      const rate = totalStudents > 0 ? (attendanceCount / totalStudents) * 100 : 0
      
      return {
        session: session.name.length > 15 ? session.name.substring(0, 15) + '...' : session.name,
        attendance: rate,
        date: format(new Date(session.date), 'MMM dd')
      }
    })
  }

  const updateActiveFilters = () => {
    const filters: string[] = []
    if (searchQuery) filters.push(`Search: "${searchQuery}"`)
    if (missedFilter !== "all") {
      const labels: { [key: string]: string } = {
        low: "None (0)",
        medium: "Some (1-2)",
        high: "Many (3+)",
      }
      filters.push(`Missed: ${labels[missedFilter] || `${missedFilter} session${parseInt(missedFilter) > 1 ? 's' : ''}`}`)
    }
    if (rateFilter !== "all") {
      const labels: { [key: string]: string } = {
        high: "High (>80%)",
        medium: "Medium (50-80%)",
        low: "Low (<50%)",
      }
      filters.push(`Rate: ${labels[rateFilter]}`)
    }
    if (attendanceRateRange[0] > 0 || attendanceRateRange[1] < 100) {
      filters.push(`Rate Range: ${attendanceRateRange[0]}%-${attendanceRateRange[1]}%`)
    }
    if (missedSessionsRange[0] > 0 || missedSessionsRange[1] < 10) {
      filters.push(`Missed Range: ${missedSessionsRange[0]}-${missedSessionsRange[1]}`)
    }
    setActiveFilters(filters)
  }

  const clearFilter = (filterToRemove: string) => {
    if (filterToRemove.startsWith('Search:')) {
      setSearchQuery("")
    } else if (filterToRemove.startsWith('Missed:')) {
      setMissedFilter("all")
    } else if (filterToRemove.startsWith('Rate:')) {
      setRateFilter("all")
    } else if (filterToRemove.startsWith('Rate Range:')) {
      setAttendanceRateRange([0, 100])
    } else if (filterToRemove.startsWith('Missed Range:')) {
      setMissedSessionsRange([0, 10])
    }
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setMissedFilter("all")
    setRateFilter("all")
    setAttendanceRateRange([0, 100])
    setMissedSessionsRange([0, 10])
  }

  // Update active filters when filter values change
  useEffect(() => {
    updateActiveFilters()
  }, [searchQuery, missedFilter, rateFilter, attendanceRateRange, missedSessionsRange])

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
    if (rateFilter === "low") {
      matchesRate = stat.attendanceRate < 50
    } else if (rateFilter === "medium") {
      matchesRate = stat.attendanceRate >= 50 && stat.attendanceRate < 80
    } else if (rateFilter === "high") {
      matchesRate = stat.attendanceRate >= 80
    }

    // Additional range filters
    const matchesRateRange = stat.attendanceRate >= attendanceRateRange[0] && stat.attendanceRate <= attendanceRateRange[1]
    const matchesMissedRange = stat.missedCount >= missedSessionsRange[0] && stat.missedCount <= missedSessionsRange[1]

    return matchesSearch && matchesMissed && matchesRate && matchesRateRange && matchesMissedRange
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
            {/* Enhanced Student Insights */}
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-md bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Students</p>
                        <p className="text-3xl font-bold text-[#1f2d3d]">{students.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-[#1f2d3d]/60" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Avg. Attendance</p>
                        <p className="text-3xl font-bold text-[#1f2d3d]">
                          {(studentStats.reduce((acc, s) => acc + s.attendanceRate, 0) / (students.length || 1)).toFixed(1)}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-emerald-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Perfect Attendance</p>
                        <p className="text-3xl font-bold text-emerald-600">
                          {studentStats.filter(s => s.attendanceRate === 100).length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-emerald-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Critical (Missed 3+)</p>
                        <p className="text-3xl font-bold text-rose-600">
                          {studentStats.filter(s => s.missedCount >= 3).length}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-rose-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Distribution Chart */}
                <Card className="border-none shadow-md bg-white">
                  <CardHeader className="border-b border-gray-50 bg-gray-50/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-[#1f2d3d]">Attendance Distribution</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={chartView === "bar" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setChartView("bar")}
                          className={chartView === "bar" ? "bg-[#1f2d3d] text-white" : ""}
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={chartView === "pie" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setChartView("pie")}
                          className={chartView === "pie" ? "bg-[#1f2d3d] text-white" : ""}
                        >
                          <PieChart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-64">
                      {chartView === "bar" ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getChartData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#1f2d3d" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={getChartData()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {getChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Attendance Trend Chart */}
                <Card className="border-none shadow-md bg-white">
                  <CardHeader className="border-b border-gray-50 bg-gray-50/30">
                    <CardTitle className="text-lg text-[#1f2d3d]">Attendance Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getAttendanceTrendData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip labelFormatter={(label) => `Date: ${label}`} />
                          <Line 
                            type="monotone" 
                            dataKey="attendance" 
                            stroke="#1f2d3d" 
                            strokeWidth={2}
                            dot={{ fill: '#1f2d3d', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Student Details Table */}
              <Card className="border-none shadow-md bg-white overflow-hidden">
                <CardHeader className="border-b border-gray-50 bg-gray-50/30">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <CardTitle className="text-xl text-[#1f2d3d]">Student Attendance Details</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                          className="h-9"
                        >
                          <SlidersHorizontal className="h-4 w-4 mr-2" />
                          Advanced Filters
                          {showAdvancedFilters ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
                        </Button>
                        {activeFilters.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllFilters}
                            className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear All ({activeFilters.length})
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Active Filter Chips */}
                    {activeFilters.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {activeFilters.map((filter, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 bg-[#1f2d3d]/10 text-[#1f2d3d] hover:bg-[#1f2d3d]/20 cursor-pointer"
                            onClick={() => clearFilter(filter)}
                          >
                            {filter}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Basic Filters */}
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

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50/50 rounded-lg border">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Attendance Rate Range (%)</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={attendanceRateRange[0]}
                              onChange={(e) => setAttendanceRateRange([parseInt(e.target.value) || 0, attendanceRateRange[1]])}
                              className="w-20 h-8 text-sm"
                              placeholder="Min"
                            />
                            <span className="text-gray-400">-</span>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={attendanceRateRange[1]}
                              onChange={(e) => setAttendanceRateRange([attendanceRateRange[0], parseInt(e.target.value) || 100])}
                              className="w-20 h-8 text-sm"
                              placeholder="Max"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Missed Sessions Range</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              value={missedSessionsRange[0]}
                              onChange={(e) => setMissedSessionsRange([parseInt(e.target.value) || 0, missedSessionsRange[1]])}
                              className="w-20 h-8 text-sm"
                              placeholder="Min"
                            />
                            <span className="text-gray-400">-</span>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              value={missedSessionsRange[1]}
                              onChange={(e) => setMissedSessionsRange([missedSessionsRange[0], parseInt(e.target.value) || 20])}
                              className="w-20 h-8 text-sm"
                              placeholder="Max"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 w-8"></th>
                          <th className="px-6 py-4">Student</th>
                          <th className="px-6 py-4 text-center">Attended</th>
                          <th className="px-6 py-4 text-center">Missed</th>
                          <th className="px-6 py-4">Attendance Rate</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredStudentStats.map((stat) => (
                          <>
                            <tr key={stat.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleRowExpansion(stat.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  {expandedRows.has(stat.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </td>
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
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push(`/admin/trainees/${stat.id}`)}
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-[#1f2d3d] hover:bg-gray-100"
                                    title="View Student Profile"
                                  >
                                    <User className="h-4 w-4" />
                                  </Button>
                                  {stat.phone && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(`tel:${stat.phone}`)}
                                      className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                      title="Call Student"
                                    >
                                      <Phone className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {expandedRows.has(stat.id) && (
                              <tr className="bg-gray-50/30">
                                <td colSpan={6} className="px-6 py-4">
                                  <div className="space-y-3">
                                    <div className="text-sm font-medium text-gray-700">Recent Session Attendance:</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {sessions
                                        .filter(s => s.status === 'completed')
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .slice(0, 6)
                                        .map(session => {
                                          const attended = session.attendanceRecords?.some(record => record.studentId === stat.id)
                                          return (
                                            <div key={session.id} className="flex items-center gap-2 text-xs">
                                              <div className={`w-2 h-2 rounded-full ${attended ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                              <span className="truncate">{session.name}</span>
                                              <span className="text-gray-400">({format(new Date(session.date), 'MMM dd')})</span>
                                            </div>
                                          )
                                        })}
                                    </div>
                                    {stat.missedCount >= 3 && (
                                      <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span>This student has missed {stat.missedCount} sessions. Consider reaching out for support.</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
