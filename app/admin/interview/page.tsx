"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  User,
  Loader2,
  Music,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getApiBaseUrl } from "@/lib/utils"


const API_BASE_URL = getApiBaseUrl()

interface InterviewAppointment {
  id: number
  applicant_name: string
  applicant_phone: string
  scheduled_date: string
  scheduled_time: string
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  created_at: string
  updated_at?: string
  selected_song?: string
  additional_song?: string
  additional_song_singer?: string
  coordinator_verified?: boolean
  final_decision?: string | null
}

interface ScheduleStats {
  total_appointments: number
  scheduled: number
  accepted: number
  rejected: number
  cancelled: number
}

export default function AdminAppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<InterviewAppointment[]>([])
  const [scheduleStats, setScheduleStats] = useState<ScheduleStats>({
    total_appointments: 0,
    scheduled: 0,
    accepted: 0,
    rejected: 0,
    cancelled: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

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

  const fetchScheduleStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      if (data.success) {
        setScheduleStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching schedule stats:", error)
    }
  }

  const fetchAppointments = async (search = "") => {
    setIsLoading(true)
    try {
      const url = new URL(`${API_BASE_URL}/schedule/appointments`)
      if (search) {
        url.searchParams.append("search", search)
      }
      
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: number, status: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      })
      const data = await response.json()
      if (data.success) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId ? { ...apt, status: status as any } : apt
          )
        )
        fetchScheduleStats()
      }
    } catch (error) {
      console.error("Error updating appointment status:", error)
    }
  }

  const formatDateTime = (date: string) => {
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Filter appointments
  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = 
      app.applicant_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      app.applicant_phone.includes(debouncedSearch)
    
    if (!matchesSearch) return false

    if (statusFilter === "all") return true
    if (statusFilter === "scheduled") return app.status === "scheduled"
    if (statusFilter === "accepted") return app.final_decision === "accepted"
    if (statusFilter === "rejected") return app.final_decision === "rejected"
    
    return true
  })

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/admin")
      return
    }
    fetchScheduleStats()
    fetchAppointments(debouncedSearch)
  }, [router, debouncedSearch])

  if (isLoading && !appointments.length) {
    return (
      <AdminLayout>
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-6 lg:px-12 py-10 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Interview Management
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage interview appointments and track results.
            </p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight text-gray-900">{scheduleStats.total_appointments}</p>
          </div>

          <div className="bg-blue-50/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-blue-100/50">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-blue-600">Scheduled</p>
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-700">{scheduleStats.scheduled}</p>
          </div>

          <div className="bg-emerald-50/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-emerald-100/50">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-emerald-600">Accepted</p>
              <div className="p-2 bg-emerald-100 rounded-full">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-700">{scheduleStats.accepted}</p>
          </div>

          <div className="bg-rose-50/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-rose-100/50">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-rose-600">Rejected</p>
              <div className="p-2 bg-rose-100 rounded-full">
                <XCircle className="h-4 w-4 text-rose-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-rose-700">{scheduleStats.rejected}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:ring-gray-300 transition-all duration-200"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-white border-gray-200 text-gray-900">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          {appointments.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-6">
                <Search className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No appointments found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {searchQuery ? "We couldn't find any appointments matching your search." : "There are no appointments scheduled at the moment."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-8 py-6 text-xs font-medium uppercase tracking-wider text-gray-500">Applicant</th>
                    <th className="text-left px-8 py-6 text-xs font-medium uppercase tracking-wider text-gray-500">Contact</th>
                    <th className="text-left px-8 py-6 text-xs font-medium uppercase tracking-wider text-gray-500">Schedule</th>
                    <th className="text-left px-8 py-6 text-xs font-medium uppercase tracking-wider text-gray-500">Songs</th>
                    <th className="text-right px-8 py-6 text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                            {appointment.applicant_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-base">{appointment.applicant_name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">ID: #{appointment.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 rounded-lg bg-muted/30">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-foreground font-medium">{appointment.applicant_phone}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground font-medium">
                              {formatDateTime(appointment.scheduled_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{appointment.scheduled_time}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="max-w-xs space-y-2">
                          {appointment.selected_song && (
                            <div className="flex items-start gap-2 text-sm group/song">
                              <Music className="h-4 w-4 text-primary/70 mt-0.5 flex-shrink-0 group-hover/song:text-primary transition-colors" />
                              <span className="text-sm font-medium">{appointment.selected_song}</span>
                            </div>
                          )}
                          {appointment.additional_song && (
                            <div className="flex items-start gap-2 text-sm group/song">
                              <Music className="h-4 w-4 text-muted-foreground/70 mt-0.5 flex-shrink-0 group-hover/song:text-muted-foreground transition-colors" />
                              <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">{appointment.additional_song}</span>
                                {appointment.additional_song_singer && (
                                  <span className="text-xs text-muted-foreground/60">by {appointment.additional_song_singer}</span>
                                )}
                              </div>
                            </div>
                          )}
                          {!appointment.selected_song && !appointment.additional_song && (
                            <span className="text-sm text-muted-foreground/50 italic">No songs selected</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                          {appointment.status === "scheduled" ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                                className="bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-sm hover:shadow-emerald-500/20 h-9 px-4 rounded-lg transition-all"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateAppointmentStatus(appointment.id, "no_show")}
                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-9 px-4 rounded-lg"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Badge 
                              variant="secondary" 
                              className={
                                appointment.status === "completed" 
                                  ? "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-1.5 rounded-lg font-medium" 
                                  : "bg-rose-100/50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 px-4 py-1.5 rounded-lg font-medium"
                              }
                            >
                              {appointment.status === "completed" ? (
                                <span className="flex items-center gap-1.5">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Accepted
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <XCircle className="h-3.5 w-3.5" />
                                  Rejected
                                </span>
                              )}
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
