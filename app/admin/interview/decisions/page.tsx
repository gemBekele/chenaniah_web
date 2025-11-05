"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  Clock,
  Phone,
  User,
  Loader2,
  CheckCircle,
  XCircle,
  Search,
  Star,
  TrendingUp,
} from "lucide-react"

import { getApiBaseUrl } from "@/lib/utils"
const API_BASE_URL = getApiBaseUrl()

interface InterviewAppointment {
  id: number
  applicant_name: string
  applicant_phone: string
  scheduled_date: string
  scheduled_time: string
  selected_song?: string
  additional_song?: string
  additional_song_singer?: string
  final_decision?: string | null
  decision_made_at?: string
}

interface Evaluation {
  appointment_id: number
  judge_name: string
  criteria_name: string
  rating: number
  comments: string
}

interface EvaluationAverages {
  [criteria: string]: number
}

export default function FinalDecisionsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<InterviewAppointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<InterviewAppointment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState<InterviewAppointment | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [averages, setAverages] = useState<EvaluationAverages>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<number | null>(null)

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

  const fetchVerifiedAppointments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/schedule/appointments/verified`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      if (data.success) {
        setAppointments(data.appointments)
        setFilteredAppointments(data.appointments)
      }
    } catch (error) {
      console.error("Error fetching verified appointments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEvaluations = async (appointmentId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/schedule/appointments/${appointmentId}/evaluations`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      )
      const data = await response.json()
      if (data.success) {
        setEvaluations(data.evaluations)
        setAverages(data.averages || {})
      }
    } catch (error) {
      console.error("Error fetching evaluations:", error)
    }
  }

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/admin")
      return
    }
    fetchVerifiedAppointments()
  }, [router])

  useEffect(() => {
    if (selectedAppointment) {
      fetchEvaluations(selectedAppointment.id)
    }
  }, [selectedAppointment])

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

  const handleDecision = async (appointmentId: number, decision: string) => {
    setIsSaving(appointmentId)
    try {
      const response = await fetch(
        `${API_BASE_URL}/schedule/appointments/${appointmentId}/decision`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ decision }),
        }
      )
      const data = await response.json()
      if (data.success) {
        await fetchVerifiedAppointments()
        if (selectedAppointment?.id === appointmentId) {
          setSelectedAppointment({ ...selectedAppointment, final_decision: decision })
        }
      } else {
        alert(`Failed to update decision: ${data.error}`)
      }
    } catch (error) {
      console.error("Error updating decision:", error)
      alert("Error updating decision. Please try again.")
    } finally {
      setIsSaving(null)
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

  const calculateOverallAverage = () => {
    const values = Object.values(averages)
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  const getDecisionStats = () => {
    const accepted = appointments.filter((apt) => apt.final_decision === "accepted").length
    const rejected = appointments.filter((apt) => apt.final_decision === "rejected").length
    const pending = appointments.filter((apt) => !apt.final_decision).length
    return { accepted, rejected, pending }
  }

  const stats = getDecisionStats()

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Final Decisions</h1>
          <p className="text-muted-foreground">
            Review evaluations and make final acceptance/rejection decisions for applicants.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-emerald-50 border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Accepted</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.accepted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </Card>
          <Card className="p-4 bg-rose-50 border-rose-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rejected</p>
                <p className="text-2xl font-bold text-rose-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-rose-600" />
            </div>
          </Card>
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Applicant List */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="mb-4">
                <Input
                  placeholder="Search applicants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
              </div>
              <h2 className="text-xl font-semibold mb-4">Applicants</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No applicants found</p>
                ) : (
                  filteredAppointments.map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => setSelectedAppointment(apt)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedAppointment?.id === apt.id
                          ? "bg-primary/10 border-primary"
                          : "bg-background border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{apt.applicant_name}</span>
                        </div>
                        {apt.final_decision && (
                          <Badge
                            variant="outline"
                            className={
                              apt.final_decision === "accepted"
                                ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                                : "text-rose-600 bg-rose-50 border-rose-200"
                            }
                          >
                            {apt.final_decision === "accepted" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {apt.final_decision}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(apt.scheduled_date)} at {apt.scheduled_time}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Main Content - Evaluation Details */}
          <div className="lg:col-span-2">
            {selectedAppointment ? (
              <Card className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold">{selectedAppointment.applicant_name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(selectedAppointment.scheduled_date)} at{" "}
                        {selectedAppointment.scheduled_time}
                      </p>
                    </div>
                    {selectedAppointment.final_decision && (
                      <Badge
                        variant="outline"
                        className={
                          selectedAppointment.final_decision === "accepted"
                            ? "text-emerald-600 bg-emerald-50 border-emerald-200 text-base px-4 py-2"
                            : "text-rose-600 bg-rose-50 border-rose-200 text-base px-4 py-2"
                        }
                      >
                        {selectedAppointment.final_decision === "accepted" ? (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        {selectedAppointment.final_decision.toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  {/* Overall Average */}
                  {Object.keys(averages).length > 0 && (
                    <div className="bg-primary/10 rounded-lg p-4 mb-4 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <span className="font-semibold">Overall Average</span>
                        </div>
                        <Badge variant="outline" className="text-lg font-bold px-4 py-2">
                          {calculateOverallAverage().toFixed(1)} / 5.0
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Criteria Averages */}
                  {Object.keys(averages).length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        Criteria Averages
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(averages).map(([criteria, avg]) => (
                          <div
                            key={criteria}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                          >
                            <span className="text-sm">{criteria}</span>
                            <Badge variant="outline" className="font-semibold">
                              {avg.toFixed(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Individual Judge Evaluations */}
                  {evaluations.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Individual Judge Ratings</h3>
                      <div className="space-y-4">
                        {Array.from(new Set(evaluations.map((e) => e.judge_name))).map((judge) => {
                          const judgeEvaluations = evaluations.filter((e) => e.judge_name === judge)
                          return (
                            <div key={judge} className="border rounded-lg p-4">
                              <h4 className="font-medium mb-2">{judge}</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {judgeEvaluations.map((eval) => (
                                  <div key={eval.criteria_name} className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                      {eval.criteria_name}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {eval.rating}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Decision Actions */}
                  <div className="flex gap-4 pt-4 border-t">
                    <Button
                      onClick={() => handleDecision(selectedAppointment.id, "accepted")}
                      disabled={isSaving === selectedAppointment.id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isSaving === selectedAppointment.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Applicant
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleDecision(selectedAppointment.id, "rejected")}
                      disabled={isSaving === selectedAppointment.id}
                      variant="outline"
                      className="flex-1 border-rose-500 text-rose-600 hover:bg-rose-50"
                    >
                      {isSaving === selectedAppointment.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Applicant
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12">
                <div className="text-center">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select an applicant to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}


