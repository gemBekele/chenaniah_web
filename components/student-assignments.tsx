"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Upload, FileText, CheckCircle2, Clock, Send, Calendar, AlertCircle, X, Paperclip } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

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
  const [submissions, setSubmissions] = useState<Record<number, { files: File[]; text: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState<Record<number, boolean>>({})
  const [sessions, setSessions] = useState<SessionOption[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [sessionSubmission, setSessionSubmission] = useState<{ sessionId: string; files: File[]; text: string }>({
    sessionId: '',
    files: [],
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

  const validateFiles = (files: File[]) => {
    if (files.length > 3) {
      toast.error('You can only upload up to 3 files')
      return false
    }
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 10MB)`)
        return false
      }
    }
    return true
  }

  const handleFileChange = (assignmentId: number, fileList: FileList | null) => {
    const files = Array.from(fileList || [])
    if (!validateFiles(files)) return
    
    setSubmissions(prev => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        files: files,
      }
    }))
  }

  const handleSessionFileChange = (fileList: FileList | null) => {
    const files = Array.from(fileList || [])
    if (!validateFiles(files)) return
    setSessionSubmission(prev => ({ ...prev, files }))
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
    if (!submission || (submission.files.length === 0 && (!submission.text || !submission.text.trim()))) {
      toast.error('Please provide files or text submission')
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
      submission.files.forEach(file => {
        formData.append('files', file)
      })
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

    if (sessionSubmission.files.length === 0 && (!sessionSubmission.text || !sessionSubmission.text.trim())) {
      toast.error('Please provide files or text submission')
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
      sessionSubmission.files.forEach(file => {
        formData.append('files', file)
      })
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
        setSessionSubmission({ sessionId: '', files: [], text: '' })
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
        <Loader2 className="h-8 w-8 animate-spin text-[#1f2d3d]" />
      </div>
    )
  }

  return (
    <div key={user.id} className="space-y-8">
      {/* Session Upload Card */}
      <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg text-[#1f2d3d] flex items-center gap-2">
                <Upload className="h-5 w-5 text-[#e8cb85]" />
                Direct Submission
              </CardTitle>
              <CardDescription className="text-gray-500">
                Submit work for a specific session without an assignment post
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Select Session
              </Label>
              <div className="relative">
                <select
                  value={sessionSubmission.sessionId}
                  onChange={(e) => setSessionSubmission(prev => ({ ...prev, sessionId: e.target.value }))}
                  disabled={isLoadingSessions}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-[#1f2d3d] focus:border-[#1f2d3d] focus:ring-1 focus:ring-[#1f2d3d] h-11 transition-all"
                >
                  <option value="">{isLoadingSessions ? 'Loading sessions...' : 'Choose a session...'}</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name} — {new Date(session.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                <Calendar className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Upload Files
              </Label>
              <div className="relative group">
                <Input
                  type="file"
                  multiple
                  onChange={(e) => handleSessionFileChange(e.target.files)}
                  disabled={isSessionSubmitting}
                  className="pl-10 h-11 bg-gray-50 border-gray-200 focus:border-[#1f2d3d] focus:ring-1 focus:ring-[#1f2d3d] rounded-xl file:text-[#1f2d3d] file:font-medium text-gray-600 file:bg-gray-200 file:border-0 file:rounded-lg file:px-2 file:py-1 file:mr-3 file:text-xs hover:bg-gray-100 transition-colors"
                />
                <Paperclip className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none group-hover:text-[#1f2d3d] transition-colors" />
              </div>
              <p className="text-[10px] text-gray-400 text-right">Max 3 files, 10MB each</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Additional Notes
            </Label>
            <Textarea
              value={sessionSubmission.text}
              onChange={(e) => handleSessionTextChange(e.target.value)}
              placeholder="Add any comments or text submission here..."
              className="min-h-[80px] bg-gray-50 border-gray-200 focus:border-[#1f2d3d] focus:ring-1 focus:ring-[#1f2d3d] rounded-xl resize-none text-[#1f2d3d] placeholder:text-gray-400"
              disabled={isSessionSubmitting}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSessionSubmit}
              disabled={
                isSessionSubmitting ||
                !sessionSubmission.sessionId ||
                (sessionSubmission.files.length === 0 && !sessionSubmission.text.trim())
              }
              className="bg-[#1f2d3d] hover:bg-[#2a3f54] text-white rounded-xl px-6 shadow-lg shadow-[#1f2d3d]/10 transition-all"
            >
              {isSessionSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Work
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#1f2d3d] flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#e8cb85]" />
          Your Assignments
        </h3>

        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center mb-4 shadow-sm">
              <FileText className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-[#1f2d3d]">All Caught Up!</h3>
            <p className="text-gray-500 max-w-sm mt-1 text-sm">
              There are no pending assignments for you at the moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {assignments.map((assignment) => {
              const isSubmitted = assignment.status === 'submitted' || assignment.status === 'graded'
              const isGraded = assignment.status === 'graded'
              const isOverdue = new Date(assignment.dueDate) < new Date() && !isSubmitted

              return (
                <Card key={assignment.id} className={`border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md bg-white group ${isGraded ? 'border-l-4 border-l-blue-500' : isSubmitted ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-[#e8cb85]'}`}>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge 
                            variant="secondary" 
                            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border ${
                              isGraded 
                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                : isSubmitted
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}
                          >
                            {assignment.status}
                          </Badge>
                          
                          <div className="flex items-center text-xs text-gray-500 gap-3">
                            <span className={`flex items-center ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                              <Clock className="h-3.5 w-3.5 mr-1.5" />
                              Due {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                            {assignment.session && (
                              <span className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                {assignment.session.name}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold text-[#1f2d3d] group-hover:text-[#e8cb85] transition-colors">
                            {assignment.title}
                          </h3>
                          <p className="text-gray-600 mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                            {assignment.description}
                          </p>
                        </div>
                      </div>
                      
                      {isGraded && assignment.grade !== undefined && (
                        <div className="flex flex-col items-center justify-center bg-blue-50 rounded-2xl p-4 min-w-[100px] border border-blue-100">
                          <span className="text-3xl font-bold text-blue-700">{assignment.grade}%</span>
                          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-1">Grade</span>
                        </div>
                      )}
                    </div>

                    {isGraded && assignment.feedback && (
                      <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100 relative">
                        <div className="absolute top-5 left-0 w-1 h-8 bg-blue-500 rounded-r-full" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-2">Instructor Feedback</p>
                        <p className="text-sm text-[#1f2d3d] whitespace-pre-wrap pl-2 leading-relaxed">{assignment.feedback}</p>
                      </div>
                    )}

                    <Separator className="my-6" />

                    <div className="space-y-5">
                      {isSubmitted && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-medium">Submitted on {new Date(assignment.submittedAt!).toLocaleDateString()}</span>
                          <span className="text-emerald-400 mx-2">|</span>
                          <span className="text-emerald-700 text-xs">You can update your submission below</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Upload Files
                          </Label>
                          <div className="relative group">
                            <Input
                              type="file"
                              multiple
                              onChange={(e) => handleFileChange(assignment.id, e.target.files)}
                              disabled={isSubmitting[assignment.id]}
                              className="pl-10 h-11 bg-gray-50 border-gray-200 focus:border-[#1f2d3d] focus:ring-1 focus:ring-[#1f2d3d] rounded-xl file:text-[#1f2d3d] file:font-medium text-gray-600 file:bg-gray-200 file:border-0 file:rounded-lg file:px-2 file:py-1 file:mr-3 file:text-xs hover:bg-gray-100 transition-colors"
                            />
                            <Paperclip className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none group-hover:text-[#1f2d3d] transition-colors" />
                          </div>
                          <p className="text-[10px] text-gray-400 text-right">Max 3 files</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Or Type Response
                          </Label>
                          <Textarea
                            value={submissions[assignment.id]?.text || ""}
                            onChange={(e) => handleTextChange(assignment.id, e.target.value)}
                            placeholder="Write your submission here..."
                            className="min-h-[44px] h-11 py-2.5 bg-gray-50 border-gray-200 focus:border-[#1f2d3d] focus:ring-1 focus:ring-[#1f2d3d] rounded-xl resize-none focus:h-32 transition-all duration-200 text-[#1f2d3d] placeholder:text-gray-400"
                            disabled={isSubmitting[assignment.id]}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleSubmit(assignment.id)}
                          disabled={isSubmitting[assignment.id] || (!submissions[assignment.id]?.files?.length && !submissions[assignment.id]?.text?.trim())}
                          className="bg-[#1f2d3d] hover:bg-[#2a3f54] text-white rounded-xl px-6 shadow-md transition-all"
                        >
                          {isSubmitting[assignment.id] ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              {isSubmitted ? 'Update Submission' : 'Submit Assignment'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
