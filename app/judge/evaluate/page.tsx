"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  Phone,
  User,
  Loader2,
  Save,
  Music,
  CheckCircle,
  Star,
  LogOut,
  ClipboardList,
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

// Define evaluation criteria
const EVALUATION_CRITERIA = [
  "Vocal Quality",
  "Pitch Accuracy",
  "Rhythm & Timing",
  "Expression & Emotion",
  "Stage Presence",
  "Song Selection",
]

const JUDGES = ["Judge 1", "Judge 2", "Judge 3"]

export default function JudgeEvaluationPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<InterviewAppointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<InterviewAppointment | null>(null)
  const [selectedJudge, setSelectedJudge] = useState<string>("")
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [averages, setAverages] = useState<EvaluationAverages>({})
  const [ratings, setRatings] = useState<{ [key: string]: number }>({})
  const [comments, setComments] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const getToken = () => {
    return localStorage.getItem("judge_token") || sessionStorage.getItem("judge_token")
  }

  const fetchVerifiedAppointments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/schedule/appointments/evaluation`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      if (data.success) {
        setAppointments(data.appointments)
        if (data.appointments.length > 0 && !selectedAppointment) {
          setSelectedAppointment(data.appointments[0])
        }
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
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
        
        // Load ratings and comments for selected judge
        if (selectedJudge) {
          const judgeEvaluations = data.evaluations.filter(
            (e: Evaluation) => e.judge_name === selectedJudge
          )
          const ratingsMap: { [key: string]: number } = {}
          const commentsMap: { [key: string]: string } = {}
          judgeEvaluations.forEach((e: Evaluation) => {
            ratingsMap[e.criteria_name] = e.rating
            commentsMap[e.criteria_name] = e.comments || ""
          })
          setRatings(ratingsMap)
          setComments(commentsMap)
        }
      }
    } catch (error) {
      console.error("Error fetching evaluations:", error)
    }
  }

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/judge")
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
    if (selectedAppointment && selectedJudge) {
      fetchEvaluations(selectedAppointment.id)
    }
  }, [selectedJudge])

  const handleRatingChange = (criteria: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [criteria]: rating }))
  }

  const handleCommentChange = (criteria: string, comment: string) => {
    setComments((prev) => ({ ...prev, [criteria]: comment }))
  }

  const handleSaveEvaluation = async () => {
    if (!selectedAppointment || !selectedJudge) {
      alert("Please select an applicant and judge")
      return
    }

    setIsSaving(true)
    try {
      const promises = EVALUATION_CRITERIA.map((criteria) => {
        const rating = ratings[criteria] ?? 0
        const comment = comments[criteria] || ""
        return fetch(
          `${API_BASE_URL}/schedule/appointments/${selectedAppointment.id}/evaluation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({
              judge_name: selectedJudge,
              criteria_name: criteria,
              rating,
              comments: comment,
            }),
          }
        )
      })

      await Promise.all(promises)
      await fetchEvaluations(selectedAppointment.id)
      alert("Evaluation saved successfully!")
    } catch (error) {
      console.error("Error saving evaluation:", error)
      alert("Error saving evaluation. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('judge_token')
    localStorage.removeItem('judge_role')
    sessionStorage.removeItem('judge_token')
    router.push('/judge')
  }

  const formatDateTime = (date: string) => {
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "bg-emerald-500 hover:bg-emerald-600"
    if (rating >= 3) return "bg-blue-500 hover:bg-blue-600"
    if (rating >= 2) return "bg-amber-500 hover:bg-amber-600"
    if (rating >= 1) return "bg-orange-500 hover:bg-orange-600"
    return "bg-gray-400 hover:bg-gray-500"
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
              <ClipboardList className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Interview Evaluation</h1>
            </div>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-muted-foreground">
            Evaluate applicants who are present and approved. Ratings are on a scale of 0-5.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Applicant List */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Applicants</h2>
              <div className="space-y-2">
                {appointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No approved applicants available for evaluation</p>
                ) : (
                  appointments.map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => {
                        setSelectedAppointment(apt)
                        setRatings({})
                        setComments({})
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedAppointment?.id === apt.id
                          ? "bg-primary/10 border-primary"
                          : "bg-background border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{apt.applicant_name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(apt.scheduled_date)} at {apt.scheduled_time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {apt.applicant_phone}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Main Content - Evaluation Form */}
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
                    <div className="text-right">
                      <Label className="text-sm mb-2 block">Judge</Label>
                      <Select value={selectedJudge} onValueChange={setSelectedJudge}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select judge" />
                        </SelectTrigger>
                        <SelectContent>
                          {JUDGES.map((judge) => (
                            <SelectItem key={judge} value={judge}>
                              {judge}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedAppointment.selected_song && (
                    <div className="bg-muted/30 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <Music className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Selected Song</p>
                          <p className="text-sm text-foreground">{selectedAppointment.selected_song}</p>
                        </div>
                      </div>
                      {selectedAppointment.additional_song && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-sm font-medium mb-1">Additional Song</p>
                          <p className="text-sm text-foreground">{selectedAppointment.additional_song}</p>
                          {selectedAppointment.additional_song_singer && (
                            <p className="text-xs text-muted-foreground">
                              by {selectedAppointment.additional_song_singer}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selectedJudge ? (
                  <div className="space-y-6">
                    {EVALUATION_CRITERIA.map((criteria) => {
                      const currentRating = ratings[criteria] ?? 0
                      const average = averages[criteria]
                      return (
                        <div key={criteria} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-base font-semibold">{criteria}</Label>
                            {average !== undefined && (
                              <Badge variant="outline" className="text-primary">
                                Avg: {average.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            {[0, 1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => handleRatingChange(criteria, rating)}
                                className={`w-12 h-12 rounded-lg text-white font-semibold transition-colors ${
                                  currentRating === rating
                                    ? getRatingColor(rating) + " ring-2 ring-offset-2 ring-primary"
                                    : getRatingColor(rating) + " opacity-50 hover:opacity-75"
                                }`}
                              >
                                {rating}
                              </button>
                            ))}
                          </div>
                          <Input
                            placeholder="Comments (optional)"
                            value={comments[criteria] || ""}
                            onChange={(e) => handleCommentChange(criteria, e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      )
                    })}

                    <div className="flex justify-end gap-4 pt-4 border-t">
                      <Button
                        onClick={handleSaveEvaluation}
                        disabled={isSaving}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Evaluation
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Display Averages Summary */}
                    {Object.keys(averages).length > 0 && (
                      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Star className="h-4 w-4 text-primary" />
                          Overall Averages (All Judges)
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(averages).map(([criteria, avg]) => (
                            <div key={criteria} className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{criteria}</span>
                              <Badge variant="outline" className="font-semibold">
                                {avg.toFixed(1)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Please select a judge to start evaluation</p>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-12">
                <div className="text-center">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No applicant selected</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


