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
  submissionText?: string
  filePaths?: string[]
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
  onOpenModal: (assignmentId: number) => void
}

const AssignmentCard = ({ 
  assignment, 
  isSubmittedTab = false,
  submissions,
  isSubmitting,
  editingSubmission,
  onTextChange,
  onSubmit,
  onToggleEdit,
  onOpenModal
}: AssignmentCardProps) => {
  const isGraded = assignment.status === 'graded'
  const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status === 'pending'
  const isEditing = editingSubmission[assignment.id]

  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-5 sm:p-6 transition-all hover:border-gray-300 hover:shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6">
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
          
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-semibold text-[#1f2d3d] leading-tight">
              {assignment.title}
            </h3>
            {assignment.description && (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {assignment.description}
              </p>
            )}
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
        <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2.5">Feedback</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{assignment.feedback}</p>
        </div>
      )}

      <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-gray-100 space-y-4">
        {isSubmittedTab && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Submitted on {new Date(assignment.submittedAt!).toLocaleDateString()}</span>
              </div>
              {!isGraded && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onToggleEdit(assignment.id)}
                  className="h-9 text-xs text-gray-600 hover:text-[#1f2d3d] hover:bg-gray-50 self-start sm:self-auto"
                >
                  {isEditing ? (
                    <>
                      <X className="h-3.5 w-3.5 mr-1.5" />
                      Cancel Edit
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                      Edit Submission
                    </>
                  )}
                </Button>
              )}
            </div>
            {!isEditing && assignment.submissionText && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#1f2d3d]">Your Submission</Label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {assignment.submissionText}
                  </p>
                </div>
              </div>
            )}
            {!isEditing && assignment.filePaths && assignment.filePaths.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#1f2d3d]">Submitted Files</Label>
                <div className="flex flex-wrap gap-2">
                  {assignment.filePaths.map((filePath, index) => {
                    const fileName = filePath.split('/').pop() || `File ${index + 1}`
                    return (
                      <div key={index} className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-gray-600">
                        <FileText className="h-3 w-3 inline mr-1.5" />
                        {fileName}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {(!isSubmittedTab || isEditing) && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <Label className="text-sm font-medium text-[#1f2d3d]">
              {isSubmittedTab ? 'Update Submission' : 'Your Answer'}
            </Label>
            <Button
              onClick={() => onOpenModal(assignment.id)}
              variant="outline"
              className="w-full h-auto min-h-[120px] sm:min-h-[100px] flex flex-col items-start justify-start p-4 text-left border-2 border-dashed border-gray-300 hover:border-[#1f2d3d] hover:bg-gray-50 transition-all"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <FileText className="h-4 w-4" />
                <span>{submissions[assignment.id]?.text || assignment.submissionText ? 'Click to edit your submission' : 'Click to write your answer'}</span>
              </div>
              {submissions[assignment.id]?.text || assignment.submissionText ? (
                <p className="text-sm text-gray-700 line-clamp-3 mt-2">
                  {submissions[assignment.id]?.text || assignment.submissionText}
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-2">Start typing to write your answer...</p>
              )}
            </Button>
            {(submissions[assignment.id]?.text || assignment.submissionText) && (
              <Button
                onClick={() => onSubmit(assignment.id)}
                disabled={isSubmitting[assignment.id] || !submissions[assignment.id]?.text?.trim()}
                size="default"
                className="w-full sm:w-auto sm:min-w-[120px] bg-[#1f2d3d] hover:bg-[#2a3f54] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting[assignment.id] ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            )}
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
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null)

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
          const loadedAssignments = data.assignments || []
          setAssignments(loadedAssignments)
          
          // Pre-populate submission text for submitted assignments
          const initialSubmissions: Record<number, { text: string; files?: File[] }> = {}
          loadedAssignments.forEach((assignment: Assignment) => {
            if (assignment.submissionText) {
              initialSubmissions[assignment.id] = {
                text: assignment.submissionText,
                files: assignment.filePaths?.map(() => undefined as any) // Placeholder for files
              }
            }
          })
          setSubmissions(prev => ({ ...prev, ...initialSubmissions }))
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
    if (!sessionSubmission.text || !sessionSubmission.text.trim()) {
      toast.error('Please type your submission as text')
      return
    }

    if (!sessionSubmission.sessionId) {
      toast.error('Please select a session to submit your work')
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

  const handleOpenModal = (assignmentId: number) => {
    setEditingAssignmentId(assignmentId)
    // Pre-populate with existing submission text if available
    const assignment = assignments.find(a => a.id === assignmentId)
    if (assignment && assignment.submissionText && !submissions[assignmentId]?.text) {
      handleTextChange(assignmentId, assignment.submissionText)
    }
  }

  const handleCloseModal = () => {
    setEditingAssignmentId(null)
  }

  const handleSubmitFromModal = async (assignmentId: number) => {
    await handleSubmit(assignmentId)
    handleCloseModal()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  // Filter out auto-created session assignments from pending list (they should only be accessible via session dropdown)
  const pendingAssignments = assignments.filter(a => 
    a.status === 'pending' && 
    !(a.description === 'Auto-created from student upload' || a.description?.includes('Auto-created'))
  )
  const submittedAssignments = assignments.filter(a => a.status === 'submitted' || a.status === 'graded')

  return (
    <div key={user.id} className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-0">
        <h2 className="text-lg sm:text-xl font-semibold text-[#1f2d3d] tracking-tight">Assignments</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowDirectSubmission(true)}
          className="h-8 text-xs font-medium border-gray-200 hover:border-[#1f2d3d] hover:bg-gray-50 w-full sm:w-auto"
        >
          <FileText className="h-3.5 w-3.5 mr-2 text-gray-500" />
          Submit for Session
        </Button>
      </div>

      {/* Assignment Writing Modal */}
      {editingAssignmentId !== null && (() => {
        const assignment = assignments.find(a => a.id === editingAssignmentId)
        if (!assignment) return null
        return (
          <Dialog open={editingAssignmentId !== null} onOpenChange={(open) => !open && handleCloseModal()}>
            <DialogContent className="max-w-5xl w-[95vw] h-[92vh] max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
              <DialogHeader className="px-6 py-5 border-b border-gray-200 flex-shrink-0 bg-gray-50/50">
                <DialogTitle className="text-xl font-semibold text-[#1f2d3d]">
                  {assignment.title}
                </DialogTitle>
                {assignment.description && (
                  <DialogDescription className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {assignment.description}
                  </DialogDescription>
                )}
              </DialogHeader>
              <div className="flex-1 overflow-hidden flex flex-col px-6 py-5 min-h-0">
                <Label htmlFor="modal-textarea" className="text-sm font-medium text-[#1f2d3d] mb-3 flex-shrink-0">
                  Your Answer
                </Label>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <Textarea
                    id="modal-textarea"
                    value={submissions[editingAssignmentId]?.text || assignment.submissionText || ""}
                    onChange={(e) => handleTextChange(editingAssignmentId, e.target.value)}
                    placeholder="Start typing your answer here..."
                    className="w-full h-full min-h-0 resize-none text-base border-gray-200 focus:border-[#1f2d3d] focus:ring-2 focus:ring-[#1f2d3d]/20 bg-white rounded-lg px-5 py-4 leading-relaxed disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                    disabled={isSubmitting[editingAssignmentId]}
                    style={{ minHeight: '100%', height: '100%' }}
                  />
                </div>
              </div>
              <DialogFooter className="px-6 py-4 border-t border-gray-200 flex-shrink-0 gap-3 bg-gray-50/30">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isSubmitting[editingAssignmentId]}
                  className="flex-1 sm:flex-initial min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSubmitFromModal(editingAssignmentId)}
                  disabled={isSubmitting[editingAssignmentId] || !submissions[editingAssignmentId]?.text?.trim()}
                  className="flex-1 sm:flex-initial bg-[#1f2d3d] hover:bg-[#2a3f54] text-white min-w-[140px]"
                >
                  {isSubmitting[editingAssignmentId] ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Answer
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      })()}

      {/* Session-Based Submission Dialog */}
      <Dialog open={showDirectSubmission} onOpenChange={setShowDirectSubmission}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1f2d3d]">Submit Work for Session</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 leading-relaxed">
              Submit your work for a specific session (optional). You can select a session to organize your submission, but it's not required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="session-select" className="text-sm font-medium text-[#1f2d3d]">
                Select Session <span className="text-gray-400 text-xs">(Optional)</span>
              </Label>
              <select
                id="session-select"
                value={sessionSubmission.sessionId}
                onChange={(e) => setSessionSubmission(prev => ({ ...prev, sessionId: e.target.value }))}
                disabled={isLoadingSessions}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-[#1f2d3d] focus:border-[#1f2d3d] focus:ring-2 focus:ring-[#1f2d3d]/20 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">{isLoadingSessions ? 'Loading sessions...' : 'None (optional)'}</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name} — {new Date(session.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-textarea" className="text-sm font-medium text-[#1f2d3d]">
                Your Work <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="session-textarea"
                value={sessionSubmission.text}
                onChange={(e) => handleSessionTextChange(e.target.value)}
                placeholder="Type or paste your submission here..."
                className="min-h-[200px] resize-y text-sm border-gray-200 focus:border-[#1f2d3d] focus:ring-2 focus:ring-[#1f2d3d]/20 bg-white rounded-lg px-4 py-3 leading-relaxed disabled:bg-gray-50 disabled:cursor-not-allowed"
                disabled={isSessionSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1.5">
                You can write or paste your work in the text area above.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDirectSubmission(false)}
              disabled={isSessionSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSessionSubmit}
              disabled={isSessionSubmitting || !sessionSubmission.text.trim()}
              className="w-full sm:w-auto bg-[#1f2d3d] hover:bg-[#2a3f54] text-white h-10 order-1 sm:order-2"
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-transparent p-0 border-b border-gray-200 w-full justify-start h-auto rounded-none gap-4 sm:gap-6 mb-4 sm:mb-6 overflow-x-auto">
          <TabsTrigger 
            value="pending"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1f2d3d] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-2.5 text-sm font-medium text-gray-500 data-[state=active]:text-[#1f2d3d] transition-all whitespace-nowrap"
          >
            Pending
            {pendingAssignments.length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs py-0.5 px-2 rounded-full font-medium">
                {pendingAssignments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="submitted"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1f2d3d] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-2.5 text-sm font-medium text-gray-500 data-[state=active]:text-[#1f2d3d] transition-all whitespace-nowrap"
          >
            Submitted
            {submittedAssignments.length > 0 && (
              <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs py-0.5 px-2 rounded-full font-medium">
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
                  onOpenModal={handleOpenModal}
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
                  onOpenModal={handleOpenModal}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
