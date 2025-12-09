"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Upload, FileText, CheckCircle2, Clock, Send, Calendar } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { toast } from "sonner"

const API_BASE_URL = getApiBaseUrl()

interface StudentUser {
  id: number
  profileComplete?: boolean
}

interface Assignment {
  id: number
  title: string
  description: string
  dueDate: string
  status: 'pending' | 'submitted' | 'graded'
  submittedAt?: string
  grade?: number
  feedback?: string
  session?: {
    id: number
    name: string
    date: string
  }
}

interface SessionOption {
  id: number
  name: string
  date: string
}

interface StudentAssignmentsProps {
  user: StudentUser
}

export default function StudentAssignments({ user }: StudentAssignmentsProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [submissions, setSubmissions] = useState<Record<number, { file: File | null; text: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState<Record<number, boolean>>({})
  const [sessions, setSessions] = useState<SessionOption[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [sessionSubmission, setSessionSubmission] = useState<{ sessionId: string; file: File | null; text: string }>({
    sessionId: '',
    file: null,
    text: '',
  })
  const [isSessionSubmitting, setIsSessionSubmitting] = useState(false)

  useEffect(() => {
    loadAssignments()
    loadSessions()
  }, [])

  const loadAssignments = async () => {
    const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/student/assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAssignments(data.assignments || [])
        }
      }
    } catch (err) {
      console.error('Error loading assignments:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSessions = async () => {
    const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/student/assignment-sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSessions(data.sessions || [])
        }
      }
    } catch (err) {
      console.error('Error loading assignment sessions:', err)
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const validateFileSize = (file: File | null) => {
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return false
    }
    return true
  }

  const handleFileChange = (assignmentId: number, file: File | null) => {
    if (!validateFileSize(file)) return
    setSubmissions(prev => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        file: file,
      }
    }))
  }

  const handleSessionFileChange = (file: File | null) => {
    if (!validateFileSize(file)) return
    setSessionSubmission(prev => ({ ...prev, file }))
  }

  const handleTextChange = (assignmentId: number, text: string) => {
    setSubmissions(prev => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        text: text,
      }
    }))
  }

  const handleSessionTextChange = (text: string) => {
    setSessionSubmission(prev => ({ ...prev, text }))
  }

  const handleSubmit = async (assignmentId: number) => {
    const submission = submissions[assignmentId]
    if (!submission || (!submission.file && (!submission.text || !submission.text.trim()))) {
      toast.error('Please provide a file or text submission')
      return
    }

    const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    if (!token) {
      toast.error('Please login again')
      return
    }

    setIsSubmitting(prev => ({ ...prev, [assignmentId]: true }))

    try {
      const formData = new FormData()
      if (submission.file) {
        formData.append('file', submission.file)
      }
      if (submission.text && submission.text.trim()) {
        formData.append('text', submission.text.trim())
      }
      formData.append('assignmentId', assignmentId.toString())

      const response = await fetch(`${API_BASE_URL}/student/submit-assignment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Assignment submitted successfully')
        setSubmissions(prev => {
          const newSubmissions = { ...prev }
          delete newSubmissions[assignmentId]
          return newSubmissions
        })
        loadAssignments()
      } else {
        toast.error(data.error || 'Submission failed')
      }
    } catch (err) {
      console.error('Submission error:', err)
      toast.error('Failed to submit assignment')
    } finally {
      setIsSubmitting(prev => ({ ...prev, [assignmentId]: false }))
    }
  }

  const handleSessionSubmit = async () => {
    if (!sessionSubmission.sessionId) {
      toast.error('Please select a session')
      return
    }

    if (!sessionSubmission.file && (!sessionSubmission.text || !sessionSubmission.text.trim())) {
      toast.error('Please provide a file or text submission')
      return
    }

    const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    if (!token) {
      toast.error('Please login again')
      return
    }

    setIsSessionSubmitting(true)

    try {
      const formData = new FormData()
      if (sessionSubmission.file) {
        formData.append('file', sessionSubmission.file)
      }
      if (sessionSubmission.text && sessionSubmission.text.trim()) {
        formData.append('text', sessionSubmission.text.trim())
      }
      formData.append('sessionId', sessionSubmission.sessionId)

      const response = await fetch(`${API_BASE_URL}/student/submit-assignment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Assignment submitted for the selected session')
        setSessionSubmission({ sessionId: '', file: null, text: '' })
        loadAssignments()
      } else {
        toast.error(data.error || 'Submission failed')
      }
    } catch (err) {
      console.error('Session submission error:', err)
      toast.error('Failed to submit assignment')
    } finally {
      setIsSessionSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#e8cb85]" />
      </div>
    )
  }

  return (
    <div key={user.id} className="space-y-6">
      <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-[#1f2d3d]">Upload Assignment by Session</CardTitle>
              <CardDescription className="text-gray-500">
                Submit your work even if an assignment was not posted by an admin. Choose a session and upload.
              </CardDescription>
            </div>
            <Upload className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Select Session
              </Label>
              <div className="relative">
                <select
                  value={sessionSubmission.sessionId}
                  onChange={(e) => setSessionSubmission(prev => ({ ...prev, sessionId: e.target.value }))}
                  disabled={isLoadingSessions}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-[#1f2d3d] focus:border-[#e8cb85] focus:ring-[#e8cb85]/20 h-11"
                >
                  <option value="">{isLoadingSessions ? 'Loading sessions...' : 'Choose a session'}</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name} — {new Date(session.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Upload File
              </Label>
              <div className="relative">
                <Input
                  type="file"
                  onChange={(e) => handleSessionFileChange(e.target.files?.[0] || null)}
                  disabled={isSessionSubmitting}
                  className="pl-10 h-11 bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20 rounded-xl file:text-[#1f2d3d] file:font-medium text-gray-600"
                />
                <Upload className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Or Type Response
            </Label>
            <Textarea
              value={sessionSubmission.text}
              onChange={(e) => handleSessionTextChange(e.target.value)}
              placeholder="Write your submission here..."
              className="min-h-[44px] h-11 py-2 bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20 rounded-xl resize-none focus:h-32 transition-all duration-200 text-[#1f2d3d] placeholder:text-gray-400"
              disabled={isSessionSubmitting}
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSessionSubmit}
              disabled={
                isSessionSubmitting ||
                !sessionSubmission.sessionId ||
                (!sessionSubmission.file && !sessionSubmission.text.trim())
              }
              className="bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white rounded-xl px-6 shadow-sm"
            >
              {isSessionSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Assignment
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {assignments.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#1f2d3d]">No Assignments Yet</h3>
            <p className="text-gray-500 max-w-sm mt-1">
              Check back later for new assignments from your instructors.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md bg-white">
              <div className="flex flex-col md:flex-row">
                {/* Status Strip */}
                <div className={`w-full md:w-1.5 h-1.5 md:h-auto ${
                  assignment.status === 'submitted' 
                    ? 'bg-emerald-500'
                    : assignment.status === 'graded'
                    ? 'bg-blue-500'
                    : 'bg-[#e8cb85]'
                }`} />
                
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${
                          assignment.status === 'submitted' 
                            ? 'bg-emerald-100 text-emerald-700'
                            : assignment.status === 'graded'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-[#e8cb85]/20 text-[#1f2d3d]'
                        }`}>
                          {assignment.status}
                        </span>
                        <div className="flex items-center text-xs text-gray-500 gap-3">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                          {assignment.session && (
                            <span className="text-gray-500">
                              Session: {assignment.session.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-[#1f2d3d]">{assignment.title}</h3>
                      <p className="text-gray-600 mt-1 text-sm leading-relaxed">
                        {assignment.description}
                      </p>
                    </div>
                    
                    {assignment.status === 'graded' && assignment.grade !== undefined && (
                      <div className="flex flex-col items-end">
                        <div className="text-3xl font-bold text-[#1f2d3d]">{assignment.grade}%</div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Grade</div>
                      </div>
                    )}
                  </div>

                  {assignment.status === 'graded' && assignment.feedback && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                      <p className="text-sm font-medium text-[#1f2d3d] mb-1">Instructor Feedback</p>
                      <p className="text-sm text-gray-600">{assignment.feedback}</p>
                    </div>
                  )}

                  {assignment.status === 'pending' && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`file-${assignment.id}`} className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Upload File
                            </Label>
                            <div className="relative">
                              <Input
                                id={`file-${assignment.id}`}
                                type="file"
                                onChange={(e) => handleFileChange(assignment.id, e.target.files?.[0] || null)}
                                disabled={isSubmitting[assignment.id]}
                                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20 rounded-xl file:text-[#1f2d3d] file:font-medium text-gray-600"
                              />
                              <Upload className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`text-${assignment.id}`} className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Or Type Response
                            </Label>
                            <Textarea
                              id={`text-${assignment.id}`}
                              value={submissions[assignment.id]?.text || ""}
                              onChange={(e) => handleTextChange(assignment.id, e.target.value)}
                              placeholder="Write your submission here..."
                              className="min-h-[44px] h-11 py-2 bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20 rounded-xl resize-none focus:h-32 transition-all duration-200 text-[#1f2d3d] placeholder:text-gray-400"
                              disabled={isSubmitting[assignment.id]}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleSubmit(assignment.id)}
                            disabled={isSubmitting[assignment.id] || (!submissions[assignment.id]?.file && !submissions[assignment.id]?.text?.trim())}
                            className="bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white rounded-xl px-6 shadow-sm"
                          >
                            {isSubmitting[assignment.id] ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Submit Assignment
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

