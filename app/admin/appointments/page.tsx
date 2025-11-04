"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  User,
  Loader2,
} from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

interface InterviewAppointment {
  id: number
  applicant_name: string
  applicant_phone: string
  scheduled_date: string
  scheduled_time: string
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  created_at: string
  updated_at?: string
}

interface ScheduleStats {
  total_appointments: number
  scheduled: number
  completed: number
  cancelled: number
  no_show: number
}

export default function AdminAppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<InterviewAppointment[]>([])
  const [scheduleStats, setScheduleStats] = useState<ScheduleStats>({
    total_appointments: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

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

  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/schedule/appointments`, {
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any; bg: string }> = {
      scheduled: {
        color: "text-blue-600",
        icon: Clock,
        bg: "bg-blue-50 border-blue-200",
      },
      completed: {
        color: "text-emerald-600",
        icon: CheckCircle,
        bg: "bg-emerald-50 border-emerald-200",
      },
      cancelled: {
        color: "text-amber-600",
        icon: XCircle,
        bg: "bg-amber-50 border-amber-200",
      },
      no_show: {
        color: "text-rose-600",
        icon: XCircle,
        bg: "bg-rose-50 border-rose-200",
      },
    }
    const variant = variants[status] || variants.scheduled
    const Icon = variant.icon

    return (
      <Badge
        variant="outline"
        className={`${variant.color} ${variant.bg} border flex items-center gap-1.5 px-3 py-1.5 font-medium`}
      >
        <Icon className="h-3.5 w-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
      </Badge>
    )
  }

  const formatDateTime = (date: string) => {
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/admin")
      return
    }
    fetchScheduleStats()
    fetchAppointments()
  }, [router])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
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

      <div className="container mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6 mb-8">
          <div className="group relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br from-background to-muted/30 p-3 lg:p-6 border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-muted/20">
            <div className="absolute top-0 right-0 w-16 h-16 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1 lg:mb-2">
                Total
              </p>
              <p className="text-2xl lg:text-4xl font-bold text-foreground mb-2 lg:mb-3">
                {scheduleStats.total_appointments}
              </p>
              <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-muted/50 group-hover:bg-muted transition-colors">
                <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl lg:rounded-2xl bg-blue-50 p-3 lg:p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="absolute top-0 right-0 w-16 h-16 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1 lg:mb-2">
                Scheduled
              </p>
              <p className="text-2xl lg:text-4xl font-bold text-blue-600 dark:text-blue-500 mb-2 lg:mb-3">
                {scheduleStats.scheduled}
              </p>
              <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl lg:rounded-2xl bg-emerald-50 p-3 lg:p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
            <div className="absolute top-0 right-0 w-16 h-16 lg:w-32 lg:h-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1 lg:mb-2">
                Completed
              </p>
              <p className="text-2xl lg:text-4xl font-bold text-emerald-600 dark:text-emerald-500 mb-2 lg:mb-3">
                {scheduleStats.completed}
              </p>
              <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 dark:text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl lg:rounded-2xl bg-amber-50 p-3 lg:p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
            <div className="absolute top-0 right-0 w-16 h-16 lg:w-32 lg:h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1 lg:mb-2">
                Cancelled
              </p>
              <p className="text-2xl lg:text-4xl font-bold text-amber-600 dark:text-amber-500 mb-2 lg:mb-3">
                {scheduleStats.cancelled}
              </p>
              <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                <XCircle className="h-4 w-4 lg:h-5 lg:w-5 text-amber-600 dark:text-amber-500" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl lg:rounded-2xl bg-rose-50 p-3 lg:p-6 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/10">
            <div className="absolute top-0 right-0 w-16 h-16 lg:w-32 lg:h-32 bg-gradient-to-br from-rose-500/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1 lg:mb-2">
                No Show
              </p>
              <p className="text-2xl lg:text-4xl font-bold text-rose-600 dark:text-rose-500 mb-2 lg:mb-3">
                {scheduleStats.no_show}
              </p>
              <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
                <XCircle className="h-4 w-4 lg:h-5 lg:w-5 text-rose-600 dark:text-rose-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-background to-muted/20 border border-border/50 overflow-hidden">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No appointments scheduled yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide">Applicant</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide">Phone</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide">Date & Time</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide">Status</th>
                    <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{appointment.applicant_name}</p>
                            <p className="text-xs text-muted-foreground">ID: {appointment.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{appointment.applicant_phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">
                              {formatDateTime(appointment.scheduled_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{appointment.scheduled_time}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(appointment.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {appointment.status === "scheduled" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateAppointmentStatus(appointment.id, "no_show")}
                                className="border-rose-500 text-rose-600 hover:bg-rose-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {appointment.status === "completed" && (
                            <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">
                              Accepted
                            </Badge>
                          )}
                          {appointment.status === "no_show" && (
                            <Badge variant="outline" className="text-rose-600 bg-rose-50 border-rose-200">
                              Rejected
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
