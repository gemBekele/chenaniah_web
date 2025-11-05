"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  User,
  Loader2,
  Search,
  Check,
  X,
  LogOut,
  Shield,
} from "lucide-react"

import { getApiBaseUrl } from "@/lib/utils"
const API_BASE_URL = getApiBaseUrl()

interface InterviewAppointment {
  id: number
  applicant_name: string
  applicant_phone: string
  scheduled_date: string
  scheduled_time: string
  status: string
  coordinator_verified: boolean
  coordinator_approved: boolean
  coordinator_verified_at?: string
  coordinator_approved_at?: string
  selected_song?: string
  additional_song?: string
  additional_song_singer?: string
}

export default function CoordinatorAttendancePage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<InterviewAppointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<InterviewAppointment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)

  const getToken = () => {
    return localStorage.getItem("coordinator_token") || sessionStorage.getItem("coordinator_token")
  }

  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      // Coordinator can see all appointments to check attendance
      const response = await fetch(`${API_BASE_URL}/schedule/appointments`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      if (data.success) {
        setAppointments(data.appointments)
        setFilteredAppointments(data.appointments)
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      // If unauthorized, redirect to login
      if ((error as any).message?.includes('401') || (error as any).message?.includes('403')) {
        router.push('/coordinator')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/coordinator")
      return
    }
    fetchAppointments()
  }, [router])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAppointments(appointments)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredAppointments(
        appointments.filter(
          (apt) =>
            apt.applicant_name.toLowerCase().includes(query) ||
            apt.applicant_phone.includes(query)
        )
      )
    }
  }, [searchQuery, appointments])

  const handleAttendance = async (appointmentId: number, present: boolean) => {
    setUpdating(appointmentId)
    try {
      const response = await fetch(
        `${API_BASE_URL}/schedule/appointments/${appointmentId}/attendance`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ present }),
        }
      )
      const data = await response.json()
      if (data.success) {
        await fetchAppointments()
      } else {
        alert(`Failed to update attendance: ${data.error}`)
      }
    } catch (error) {
      console.error("Error updating attendance:", error)
      alert("Error updating attendance. Please try again.")
    } finally {
      setUpdating(null)
    }
  }

  const handleApproval = async (appointmentId: number, approved: boolean) => {
    setUpdating(appointmentId)
    try {
      const response = await fetch(
        `${API_BASE_URL}/schedule/appointments/${appointmentId}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ approved }),
        }
      )
      const data = await response.json()
      if (data.success) {
        await fetchAppointments()
      } else {
        alert(`Failed to update approval: ${data.error}`)
      }
    } catch (error) {
      console.error("Error updating approval:", error)
      alert("Error updating approval. Please try again.")
    } finally {
      setUpdating(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('coordinator_token')
    localStorage.removeItem('coordinator_role')
    sessionStorage.removeItem('coordinator_token')
    router.push('/coordinator')
  }

  const formatDateTime = (date: string) => {
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/40">
        <div className="container mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Attendance Management</h1>
            </div>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 py-8">
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        <div className="rounded-2xl bg-gradient-to-br from-background to-muted/20 border border-border/50 overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No appointments found matching your search" : "No appointments scheduled yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide">Applicant</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide">Phone</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide">Date & Time</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide">Attendance</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide">Approval</th>
                    <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredAppointments.map((appointment) => (
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
                            <span className="text-foreground">{formatDateTime(appointment.scheduled_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{appointment.scheduled_time}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {appointment.coordinator_verified ? (
                          <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Present
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">
                            Absent
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {appointment.coordinator_approved ? (
                          <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {appointment.coordinator_verified ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAttendance(appointment.id, false)}
                              disabled={updating === appointment.id}
                              className="border-rose-500 text-rose-600 hover:bg-rose-50"
                            >
                              {updating === appointment.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <X className="h-4 w-4 mr-1" />
                              )}
                              Mark Absent
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleAttendance(appointment.id, true)}
                              disabled={updating === appointment.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              {updating === appointment.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 mr-1" />
                              )}
                              Mark Present
                            </Button>
                          )}
                          {appointment.coordinator_verified && (
                            <>
                              {appointment.coordinator_approved ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproval(appointment.id, false)}
                                  disabled={updating === appointment.id}
                                  className="border-amber-500 text-amber-600 hover:bg-amber-50"
                                >
                                  Unapprove
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleApproval(appointment.id, true)}
                                  disabled={updating === appointment.id}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  Approve
                                </Button>
                              )}
                            </>
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
    </div>
  )
}

