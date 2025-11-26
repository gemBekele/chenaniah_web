"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowLeft, FileText, CheckCircle2, Clock, User, Download, Eye } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { AdminLayout } from "@/components/admin-layout"
import { toast } from "sonner"
import { format } from "date-fns"
import Link from 'next/link'
import { PDFViewer } from "@/components/pdf-viewer"

const API_BASE_URL = getApiBaseUrl()

interface AssignmentSubmission {
  id: number
  studentId: number
  assignmentId: number
  filePath?: string
  text?: string
  grade?: number
  feedback?: string
  submittedAt: string
  gradedAt?: string
  gradedBy?: string
  student: {
    id: number
    username: string
    fullNameEnglish?: string
    fullNameAmharic?: string
  }
}

interface Assignment {
  id: number
  title: string
  description?: string
  dueDate: string
  createdAt: string
  submissions: AssignmentSubmission[]
}

export default function AssignmentAssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [gradingSubmission, setGradingSubmission] = useState<number | null>(null)
  const [grade, setGrade] = useState("")
  const [feedback, setFeedback] = useState("")
  const [pdfViewer, setPdfViewer] = useState<{ url: string; title: string } | null>(null)

  useEffect(() => {
    if (params.id) {
      loadAssignment()
    }
  }, [params.id])

  const loadAssignment = async () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/trainees/assignments/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/admin')
        return
      }

      const data = await response.json()
      if (data.success) {
        setAssignment(data.assignment)
      }
    } catch (err) {
      console.error("Error loading assignment:", err)
      toast.error('Failed to load assignment')
    } finally {
      setIsLoading(false)
    }
  }

  const gradeSubmission = async (submissionId: number) => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) return

    if (!grade || parseInt(grade) < 0 || parseInt(grade) > 100) {
      toast.error('Grade must be between 0 and 100')
      return
    }

    setGradingSubmission(submissionId)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/trainees/assignments/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grade: parseInt(grade),
          feedback: feedback,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Assignment graded successfully')
        setGrade("")
        setFeedback("")
        setGradingSubmission(null)
        loadAssignment()
      } else {
        toast.error(data.error || 'Failed to grade assignment')
      }
    } catch (err) {
      console.error("Error grading assignment:", err)
      toast.error('Failed to grade assignment')
    } finally {
      setGradingSubmission(null)
    }
  }

  const isPDF = (filePath: string) => {
    return filePath.toLowerCase().endsWith('.pdf')
  }

  const getFileUrl = (filePath: string) => {
    return `${API_BASE_URL}/${filePath}`
  }

  const openFile = (filePath: string, title: string) => {
    const url = getFileUrl(filePath)
    if (isPDF(filePath)) {
      setPdfViewer({ url, title })
    } else {
      window.open(url, '_blank')
    }
  }

  const downloadFile = (filePath: string) => {
    const url = getFileUrl(filePath)
    const link = document.createElement('a')
    link.href = url
    link.download = filePath.split('/').pop() || 'file'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading || !assignment) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  const gradedCount = assignment.submissions.filter(s => s.grade !== null).length
  const totalSubmissions = assignment.submissions.length

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push('/admin/assignments')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assignments
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">{assignment.title}</h1>
            <p className="text-muted-foreground">
              Due: {format(new Date(assignment.dueDate), 'PPp')}
            </p>
            {assignment.description && (
              <p className="text-muted-foreground mt-2">{assignment.description}</p>
            )}
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Submissions Overview</CardTitle>
              <CardDescription>
                {totalSubmissions} submission{totalSubmissions !== 1 ? 's' : ''} | {gradedCount} graded | {totalSubmissions - gradedCount} pending
              </CardDescription>
            </CardHeader>
          </Card>

          {assignment.submissions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No submissions yet</p>
                <p className="text-sm mt-1">Students haven't submitted this assignment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignment.submissions.map((submission) => (
                <Card key={submission.id} className="border-border/60">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <CardTitle className="text-lg">
                              {submission.student.fullNameEnglish || submission.student.username}
                            </CardTitle>
                            {submission.student.fullNameAmharic && (
                              <CardDescription>{submission.student.fullNameAmharic}</CardDescription>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Submitted: {format(new Date(submission.submittedAt), 'PPp')}</span>
                          </div>
                          {submission.gradedAt && (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Graded: {format(new Date(submission.gradedAt), 'PPp')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {submission.grade !== null && (
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary">{submission.grade}%</div>
                          <div className="text-sm text-muted-foreground">Grade</div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {submission.text && (
                      <div>
                        <Label className="text-sm font-medium">Text Submission</Label>
                        <div className="mt-2 p-4 bg-muted/50 rounded-lg border border-border/40">
                          <p className="whitespace-pre-wrap">{submission.text}</p>
                        </div>
                      </div>
                    )}

                    {submission.filePath && (
                      <div>
                        <Label className="text-sm font-medium">File Submission</Label>
                        <div className="mt-2 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openFile(submission.filePath!, assignment?.title || 'Assignment')}
                            className="gap-2"
                          >
                            {isPDF(submission.filePath) ? (
                              <>
                                <Eye className="h-4 w-4" />
                                View PDF
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4" />
                                Open File
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadFile(submission.filePath!)}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}

                    {submission.grade !== null && submission.feedback && (
                      <div>
                        <Label className="text-sm font-medium">Feedback</Label>
                        <div className="mt-2 p-4 bg-muted/50 rounded-lg border border-border/40">
                          <p className="whitespace-pre-wrap">{submission.feedback}</p>
                        </div>
                      </div>
                    )}

                    {submission.grade === null && (
                      <div className="border-t pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`grade-${submission.id}`}>Grade (0-100) *</Label>
                            <Input
                              id={`grade-${submission.id}`}
                              type="number"
                              min="0"
                              max="100"
                              value={gradingSubmission === submission.id ? grade : ""}
                              onChange={(e) => {
                                if (gradingSubmission === submission.id) {
                                  setGrade(e.target.value)
                                } else {
                                  setGradingSubmission(submission.id)
                                  setGrade(e.target.value)
                                }
                              }}
                              placeholder="Enter grade"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`feedback-${submission.id}`}>Feedback</Label>
                            <Textarea
                              id={`feedback-${submission.id}`}
                              value={gradingSubmission === submission.id ? feedback : ""}
                              onChange={(e) => {
                                if (gradingSubmission === submission.id) {
                                  setFeedback(e.target.value)
                                } else {
                                  setGradingSubmission(submission.id)
                                  setFeedback(e.target.value)
                                }
                              }}
                              placeholder="Enter feedback for the student"
                              className="mt-1 min-h-[100px]"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => gradeSubmission(submission.id)}
                          disabled={gradingSubmission === submission.id || !grade}
                          className="w-full md:w-auto"
                        >
                          {gradingSubmission === submission.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Grading...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Grade Assignment
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Link href={`/admin/trainees/${submission.studentId}`}>
                        <Button variant="outline" size="sm">
                          View Student Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {pdfViewer && (
            <PDFViewer
              url={pdfViewer.url}
              title={pdfViewer.title}
              open={!!pdfViewer}
              onOpenChange={(open) => !open && setPdfViewer(null)}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

