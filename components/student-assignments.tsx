"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, FileText, CheckCircle2, Clock, Send, Calendar, Edit2, X } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface AssignmentCardProps {
  assignment: Assignment
  isSubmittedTab?: boolean
  submissions: Record<number, { text: string; files?: File[] }>
  isSubmitting: Record<number, boolean>
  editingSubmission: Record<number, boolean>
  onTextChange: (assignmentId: number, text: string) => void
  onSubmit: (assignmentId: number) => void
  onToggleEdit: (assignmentId: number) => void
}

const AssignmentCard = ({ 
  assignment, 
  isSubmittedTab = false,
  submissions,
  isSubmitting,
  editingSubmission,
  onTextChange,
  onSubmit,
  onToggleEdit
}: AssignmentCardProps) => {
  const isGraded = assignment.status === 'graded'
  const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status === 'pending'
  const isEditing = editingSubmission[assignment.id]

  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-6 transition-all hover:border-gray-300">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={`font-medium text-xs px-2.5 py-0.5 rounded-full border ${
                isGraded 
                  ? 'text-blue-600 border-blue-200 bg-blue-50'
                  : assignment.status === 'submitted'
                  ? 'text-emerald-600 border-emerald-200 bg-emerald-50'
                  : 'text-amber-600 border-amber-200 bg-amber-50'
              }`}
            >
              {assignment.status}
            </Badge>
            <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
              Due {new Date(assignment.dueDate).toLocaleDateString()}
            </span>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-[#1f2d3d]">
              {assignment.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed whitespace-pre-wrap">
              {assignment.description}
            </p>
          </div>

          {assignment.session && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>{assignment.session.name}</span>
            </div>
          )}
        </div>
        
        {isGraded && assignment.grade !== undefined && (
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-[#1f2d3d]">{assignment.grade}%</span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Grade</span>
          </div>
        )}
      </div>

      {isGraded && assignment.feedback && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Feedback</p>
          <p className="text-sm text-gray-700 leading-relaxed">{assignment.feedback}</p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-100 space-y-4">
        {isSubmittedTab && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Submitted on {new Date(assignment.submittedAt!).toLocaleDateString()}</span>
            </div>
            {!isGraded && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onToggleEdit(assignment.id)}
                className="h-8 text-xs text-gray-500 hover:text-[#1f2d3d]"
              >
                {isEditing ? (
                  <>
                    <X className="h-3 w-3 mr-1.5" />
                    Cancel Edit
                  </>
                ) : (
                  <>
                    <Edit2 className="h-3 w-3 mr-1.5" />
                    Edit Submission
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {(!isSubmittedTab || isEditing) && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isSubmittedTab ? 'Update Submission' : 'Your Answer'}
            </Label>
            <div className="flex gap-3 items-start">
              <Textarea
                value={submissions[assignment.id]?.text || ""}
                onChange={(e) => onTextChange(assignment.id, e.target.value)}
                placeholder="Type your answer..."
                className="min-h-[80px] flex-1 resize-none text-sm border-gray-200 focus:border-[#1f2d3d] focus:ring-1 focus:ring-[#1f2d3d] bg-gray-50/30 focus:bg-white transition-colors"
                disabled={isSubmitting[assignment.id]}
              />
              <Button
                onClick={() => onSubmit(assignment.id)}
                disabled={isSubmitting[assignment.id] || !submissions[assignment.id]?.text?.trim()}
                size="icon"
                className="h-10 w-10 shrink-0 bg-[#1f2d3d] hover:bg-[#2a3f54] text-white rounded-lg"
              >
                {isSubmitting[assignment.id] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function StudentAssignments({ user }: StudentAssignmentsProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [submissions, setSubmissions] = useState<Record<number, { text: string; files?: File[] }>>({})
  const [isSubmitting, setIsSubmitting] = useState<Record<number, boolean>>({})
  const [sessions, setSessions] = useState<SessionOption[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [sessionSubmission, setSessionSubmission] = useState<{ sessionId: string; text: string }>({
    sessionId: '',
    text: '',
  })
  const [isSessionSubmitting, setIsSessionSubmitting] = useState(false)
  const [showDirectSubmission, setShowDirectSubmission] = useState(false)
  const [editingSubmission, setEditingSubmission] = useState<Record<number, boolean>>({})

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

  const handleTextChange = useCallback((assignmentId: number, text: string) => {
    setSubmissions(prev => {
      const current = prev[assignmentId] || {}
      return {
        ...prev,
        [assignmentId]: {
          ...current,
          text: text,
        }
      }
    })
  }, [])

  const handleSessionTextChange = (text: string) => {
    setSessionSubmission(prev => ({ ...prev, text }))
  }

  const handleSubmit = async (assignmentId: number) => {
    const submission = submissions[assignmentId]
    if (!submission || !submission.text || !submission.text.trim()) {
      toast.error('Please type your submission as text')
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
      formData.append('text', submission.text.trim())
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
        setEditingSubmission(prev => ({ ...prev, [assignmentId]: false }))
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

    if (!sessionSubmission.text || !sessionSubmission.text.trim()) {
      toast.error('Please type your submission as text')
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
      formData.append('text', sessionSubmission.text.trim())
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
        setSessionSubmission({ sessionId: '', text: '' })
        loadAssignments()
        setShowDirectSubmission(false)
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

  const toggleEditMode = (assignmentId: number) => {
    setEditingSubmission(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  const pendingAssignments = assignments.filter(a => a.status === 'pending')
  const submittedAssignments = assignments.filter(a => a.status === 'submitted' || a.status === 'graded')

  return (
    <div key={user.id} className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1f2d3d] tracking-tight">Assignments</h2>
          <p className="text-gray-500 text-sm">Manage your coursework</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowDirectSubmission(true)}
          className="h-9 text-xs font-medium border-gray-200"
        >
          <FileText className="h-3.5 w-3.5 mr-2 text-gray-500" />
          Direct Submission
        </Button>
      </div>

      {/* Direct Submission Dialog */}
      <Dialog open={showDirectSubmission} onOpenChange={setShowDirectSubmission}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#1f2d3d]">Direct Submission</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Submit work for a specific session without an assignment post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Session</Label>
              <select
                value={sessionSubmission.sessionId}
                onChange={(e) => setSessionSubmission(prev => ({ ...prev, sessionId: e.target.value }))}
                disabled={isLoadingSessions}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-[#1f2d3d] focus:border-[#1f2d3d] focus:ring-1 focus:ring-[#1f2d3d] outline-none transition-all"
              >
                <option value="">{isLoadingSessions ? 'Loading...' : 'Select a session...'}</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name} — {new Date(session.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Your Work</Label>
              <Textarea
                value={sessionSubmission.text}
                onChange={(e) => handleSessionTextChange(e.target.value)}
                placeholder="Type your submission here..."
                className="min-h-[150px] resize-none text-sm border-gray-200 focus:border-[#1f2d3d] focus:ring-1 focus:ring-[#1f2d3d]"
                disabled={isSessionSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSessionSubmit}
              disabled={isSessionSubmitting || !sessionSubmission.sessionId || !sessionSubmission.text.trim()}
              className="w-full bg-[#1f2d3d] hover:bg-[#2a3f54] text-white h-10"
            >
              {isSessionSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Submit'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-transparent p-0 border-b border-gray-200 w-full justify-start h-auto rounded-none gap-6 mb-6">
          <TabsTrigger 
            value="pending"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1f2d3d] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-2 text-sm font-medium text-gray-500 data-[state=active]:text-[#1f2d3d] transition-all"
          >
            Pending
            {pendingAssignments.length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs py-0.5 px-2 rounded-full">
                {pendingAssignments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="submitted"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1f2d3d] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-2 text-sm font-medium text-gray-500 data-[state=active]:text-[#1f2d3d] transition-all"
          >
            Submitted
            {submittedAssignments.length > 0 && (
              <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs py-0.5 px-2 rounded-full">
                {submittedAssignments.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 animate-in fade-in-50 duration-300">
          {pendingAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <FileText className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-900">No pending assignments</p>
              <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAssignments.map((assignment) => (
                <AssignmentCard 
                  key={assignment.id} 
                  assignment={assignment}
                  submissions={submissions}
                  isSubmitting={isSubmitting}
                  editingSubmission={editingSubmission}
                  onTextChange={handleTextChange}
                  onSubmit={handleSubmit}
                  onToggleEdit={toggleEditMode}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4 animate-in fade-in-50 duration-300">
          {submittedAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <CheckCircle2 className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-900">No submitted assignments</p>
              <p className="text-xs text-gray-500 mt-1">Assignments you submit will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submittedAssignments.map((assignment) => (
                <AssignmentCard 
                  key={assignment.id} 
                  assignment={assignment} 
                  isSubmittedTab={true}
                  submissions={submissions}
                  isSubmitting={isSubmitting}
                  editingSubmission={editingSubmission}
                  onTextChange={handleTextChange}
                  onSubmit={handleSubmit}
                  onToggleEdit={toggleEditMode}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
