"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, User, FileText, DollarSign, CheckCircle2, XCircle, Clock, Save, ChevronDown, ChevronUp, Phone, MapPin, Calendar, Shield, GraduationCap, Users, Bell, Plus, Trash2 } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin-layout"
import { toast } from "sonner"
import { PDFViewer } from "@/components/pdf-viewer"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

const API_BASE_URL = getApiBaseUrl()

interface TraineeStats {
  student: {
    id: number
    username: string
    fullNameEnglish?: string
    fullNameAmharic?: string
    phone: string
    status: string
    profileComplete: boolean
    createdAt: string
    photoPath?: string
    idDocumentPath?: string
    recommendationLetterPath?: string
    essay?: string
    localChurch?: string
  }
  assignments: {
    total: number
    submitted: number
    graded: number
    averageGrade: number | null
    submissions: Array<{
      id: number
      assignmentId: number
      assignment: {
        id: number
        title: string
        description?: string
        dueDate: string
      }
      grade?: number
      feedback?: string
      submittedAt: string
      gradedAt?: string
    }>
  }
  payments: {
    total: number
    paid: number
    pending: number
    overdue: number
    records: Array<{
      id: number
      amount: number
      month: string
      status: string
      paidAt?: string
      notes?: string
    }>
  }
}

export default function TraineeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [stats, setStats] = useState<TraineeStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [gradingSubmission, setGradingSubmission] = useState<number | null>(null)
  const [grade, setGrade] = useState("")
  const [feedback, setFeedback] = useState("")
  const [pdfViewer, setPdfViewer] = useState<{ url: string; title: string } | null>(null)
  const [studentTeams, setStudentTeams] = useState<Array<{id: number; name: string; color: string; joinReason: string; joinedAt: string}>>([])  
  const [personalNotices, setPersonalNotices] = useState<Array<{id: number; title: string; content: string; type: string; createdAt: string}>>([])  
  const [newNotice, setNewNotice] = useState({ title: "", content: "", type: "info" })
  const [addingNotice, setAddingNotice] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadTraineeStats()
      loadStudentTeams()
      loadPersonalNotices()
    }
  }, [params.id])

  const loadTraineeStats = async () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/trainees/${params.id}`, {
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
        setStats(data)
        setNewStatus(data.student.status)
      }
    } catch (err) {
      console.error("Error loading trainee stats:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) return

    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/trainees/${params.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Status updated successfully')
        loadTraineeStats()
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch (err) {
      console.error("Error updating status:", err)
      toast.error('Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const gradeAssignment = async (submissionId: number) => {
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
        loadTraineeStats()
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

  const updatePaymentStatus = async (paymentId: number, status: string) => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/admin/trainees/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Payment status updated')
        loadTraineeStats()
      } else {
        toast.error(data.error || 'Failed to update payment')
      }
    } catch (err) {
      console.error("Error updating payment:", err)
      toast.error('Failed to update payment')
    }
  }

  const handleViewDocument = (path: string, title: string) => {
    const url = `${API_BASE_URL}/${path}`
    const lowerPath = path.toLowerCase()
    if (lowerPath.endsWith('.pdf') || 
        lowerPath.endsWith('.jpg') || 
        lowerPath.endsWith('.jpeg') || 
        lowerPath.endsWith('.png') || 
        lowerPath.endsWith('.gif') || 
        lowerPath.endsWith('.webp')) {
      setPdfViewer({ url, title })
    } else {
      window.open(url, '_blank')
    }
  }

  const loadStudentTeams = async () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/teams/student/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStudentTeams(data.teams || [])
      }
    } catch (err) {
      console.error("Error loading student teams:", err)
    }
  }

  const loadPersonalNotices = async () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/notices/student/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Filter to only get personal notices for this student
        setPersonalNotices((data.notices || []).filter((n: any) => n.isPersonal))
      }
    } catch (err) {
      console.error("Error loading personal notices:", err)
    }
  }

  const createPersonalNotice = async () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) return

    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      toast.error('Title and content are required')
      return
    }

    setAddingNotice(true)
    try {
      const response = await fetch(`${API_BASE_URL}/notices/personal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newNotice,
          studentId: params.id,
        }),
      })

      if (response.ok) {
        toast.success('Personal notice created')
        setNewNotice({ title: "", content: "", type: "info" })
        loadPersonalNotices()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to create notice')
      }
    } catch (err) {
      console.error("Error creating personal notice:", err)
      toast.error('Failed to create notice')
    } finally {
      setAddingNotice(false)
    }
  }

  const deletePersonalNotice = async (noticeId: number) => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) return

    if (!confirm('Delete this personal notice?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/notices/${noticeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast.success('Notice deleted')
        loadPersonalNotices()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete notice')
      }
    } catch (err) {
      toast.error('Failed to delete notice')
    }
  }

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="container mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin/trainees')} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Trainee Profile</h1>
              <p className="text-sm text-muted-foreground">Manage trainee information and performance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Profile Info */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="overflow-hidden border-none shadow-md">
                <div className="h-32 bg-gradient-to-r from-[#1f2d3d] to-[#2c3e50]"></div>
                <CardContent className="relative pt-0 px-6 pb-6">
                  <div className="flex flex-col items-center -mt-16 mb-4">
                    <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                      {stats.student.photoPath ? (
                        <img 
                          src={`${API_BASE_URL}/${stats.student.photoPath}`} 
                          alt="Profile" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <User className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <div className="text-center mt-4">
                      <h2 className="text-xl font-bold text-foreground">{stats.student.fullNameEnglish || stats.student.username}</h2>
                      {stats.student.fullNameAmharic && (
                        <p className="text-sm text-muted-foreground mt-1">{stats.student.fullNameAmharic}</p>
                      )}
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <Badge variant={stats.student.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                          {stats.student.status}
                        </Badge>
                        {stats.student.profileComplete && (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{stats.student.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{stats.student.username}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{stats.student.localChurch || 'No church listed'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {new Date(stats.student.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Documents</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {stats.student.idDocumentPath ? (
                        <Button 
                          variant="outline" 
                          className="justify-start w-full"
                          onClick={() => handleViewDocument(stats.student.idDocumentPath!, 'ID Document')}
                        >
                          <FileText className="h-4 w-4 mr-2 text-blue-600" />
                          View ID Document
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md bg-gray-50">
                          <XCircle className="h-4 w-4" /> No ID Document
                        </div>
                      )}
                      
                      {stats.student.recommendationLetterPath ? (
                        <Button 
                          variant="outline" 
                          className="justify-start w-full"
                          onClick={() => handleViewDocument(stats.student.recommendationLetterPath!, 'Recommendation Letter')}
                        >
                          <FileText className="h-4 w-4 mr-2 text-blue-600" />
                          View Recommendation
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md bg-gray-50">
                          <XCircle className="h-4 w-4" /> No Recommendation
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Account Actions</h3>
                    <div className="flex gap-2">
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="graduated">Graduated</SelectItem>
                          <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={updateStatus} disabled={isUpdatingStatus || newStatus === stats.student.status}>
                        {isUpdatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Content - Stats & Tabs */}
            <div className="lg:col-span-8 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Assignments</p>
                      <p className="text-2xl font-bold">{stats.assignments.submitted}/{stats.assignments.total}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Grade</p>
                      <p className="text-2xl font-bold">
                        {stats.assignments.averageGrade !== null ? `${stats.assignments.averageGrade.toFixed(1)}%` : 'N/A'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payments</p>
                      <p className="text-2xl font-bold">{stats.payments.paid}/{stats.payments.total}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="essay" className="space-y-4">
                <TabsList className="w-full justify-start h-auto p-1 bg-white border rounded-lg">
                  <TabsTrigger value="essay" className="px-6 py-2 data-[state=active]:bg-gray-100">Overview</TabsTrigger>
                  <TabsTrigger value="assignments" className="px-6 py-2 data-[state=active]:bg-gray-100">Assignments</TabsTrigger>
                  <TabsTrigger value="payments" className="px-6 py-2 data-[state=active]:bg-gray-100">Payments</TabsTrigger>
                  <TabsTrigger value="teams" className="px-6 py-2 data-[state=active]:bg-gray-100">
                    Teams {studentTeams.length > 0 && <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-1.5 rounded-full">{studentTeams.length}</span>}
                  </TabsTrigger>
                  <TabsTrigger value="notices" className="px-6 py-2 data-[state=active]:bg-gray-100">
                    Notices {personalNotices.length > 0 && <span className="ml-1 bg-purple-100 text-purple-700 text-xs px-1.5 rounded-full">{personalNotices.length}</span>}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="essay" className="space-y-4">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        Personal Essay
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats.student.essay ? (
                        <div className="bg-gray-50 p-6 rounded-lg text-sm leading-relaxed whitespace-pre-wrap border">
                          {stats.student.essay}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
                          <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>No essay submitted</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="assignments" className="space-y-4">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle>Assignment History</CardTitle>
                      <CardDescription>Track submission status and grades</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.assignments.submissions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
                          <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>No assignments submitted yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {stats.assignments.submissions.map((submission) => (
                            <Card key={submission.id} className="overflow-hidden border border-gray-100 hover:border-gray-200 transition-colors">
                              <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h3 className="font-semibold text-lg">{submission.assignment.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Due: {new Date(submission.assignment.dueDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  {submission.grade !== null ? (
                                    <Badge variant="outline" className="text-lg px-3 py-1 border-green-200 bg-green-50 text-green-700">
                                      {submission.grade}%
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">Pending Grade</Badge>
                                  )}
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Submitted</span>
                                    <span className="font-medium">{new Date(submission.submittedAt).toLocaleString()}</span>
                                  </div>
                                  
                                  {submission.grade !== null && submission.feedback && (
                                    <div className="pt-3 border-t border-gray-200">
                                      <p className="text-sm font-medium text-muted-foreground mb-1">Feedback</p>
                                      <p className="text-sm">{submission.feedback}</p>
                                    </div>
                                  )}
                                  
                                  {submission.grade === null && (
                                    <div className="pt-3 border-t border-gray-200">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                        <div className="space-y-2">
                                          <Label htmlFor={`grade-${submission.id}`}>Grade (0-100)</Label>
                                          <Input
                                            id={`grade-${submission.id}`}
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={gradingSubmission === submission.id ? grade : ""}
                                            onChange={(e) => {
                                              if (gradingSubmission !== submission.id) {
                                                setGradingSubmission(submission.id)
                                                setFeedback("")
                                              }
                                              setGrade(e.target.value)
                                            }}
                                            placeholder="Score"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor={`feedback-${submission.id}`}>Feedback</Label>
                                          <div className="flex gap-2">
                                            <Input
                                              id={`feedback-${submission.id}`}
                                              value={gradingSubmission === submission.id ? feedback : ""}
                                              onChange={(e) => {
                                                if (gradingSubmission !== submission.id) {
                                                  setGradingSubmission(submission.id)
                                                  setGrade("")
                                                }
                                                setFeedback(e.target.value)
                                              }}
                                              placeholder="Optional feedback"
                                            />
                                            <Button
                                              onClick={() => gradeAssignment(submission.id)}
                                              disabled={gradingSubmission !== submission.id || !grade}
                                              size="icon"
                                            >
                                              {gradingSubmission === submission.id && isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <Save className="h-4 w-4" />
                                              )}
                                            </Button>
                                          </div>
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
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle>Payment Records</CardTitle>
                      <CardDescription>
                        Paid: {stats.payments.paid} | Pending: {stats.payments.pending} | Overdue: {stats.payments.overdue}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.payments.records.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
                          <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>No payment records found</p>
                        </div>
                      ) : (
                        <div className="rounded-md border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-gray-50">
                                <th className="text-left p-4 font-medium text-muted-foreground">Month</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Paid Date</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats.payments.records.map((payment) => (
                                <tr key={payment.id} className="border-b last:border-0 hover:bg-gray-50/50">
                                  <td className="p-4 font-medium">{payment.month}</td>
                                  <td className="p-4">ETB {payment.amount.toFixed(2)}</td>
                                  <td className="p-4">
                                    <Badge variant="outline" className={`
                                      ${payment.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                      ${payment.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                      ${payment.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                    `}>
                                      {payment.status}
                                    </Badge>
                                  </td>
                                  <td className="p-4 text-muted-foreground">
                                    {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : '-'}
                                  </td>
                                  <td className="p-4">
                                    {payment.status !== 'paid' && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => updatePaymentStatus(payment.id, 'paid')}
                                      >
                                        Mark Paid
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="teams" className="space-y-4">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        Joined Teams
                      </CardTitle>
                      <CardDescription>Teams this trainee has joined</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {studentTeams.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
                          <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>Not a member of any teams</p>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {studentTeams.map((team) => (
                            <div 
                              key={team.id} 
                              className="bg-gray-50 rounded-lg p-4"
                              style={{ borderLeftWidth: '4px', borderLeftColor: team.color }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-foreground">{team.name}</h4>
                                <span className="text-xs text-muted-foreground">
                                  Joined {format(new Date(team.joinedAt), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground italic">
                                Reason: "{team.joinReason}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notices" className="space-y-4">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        Personal Notices
                      </CardTitle>
                      <CardDescription>Private notices visible only to this trainee</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Create Notice Form */}
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <h4 className="font-medium text-sm text-foreground">Create New Notice</h4>
                        <Input
                          placeholder="Notice title"
                          value={newNotice.title}
                          onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                        />
                        <Textarea
                          placeholder="Notice content..."
                          value={newNotice.content}
                          onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                          rows={3}
                        />
                        <div className="flex items-center gap-3">
                          <Select value={newNotice.type} onValueChange={(v) => setNewNotice({ ...newNotice, type: v })}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                              <SelectItem value="success">Success</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={createPersonalNotice}
                            disabled={addingNotice}
                            size="sm"
                          >
                            {addingNotice ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Plus className="h-4 w-4 mr-2" />
                            )}
                            Add Notice
                          </Button>
                        </div>
                      </div>

                      {/* Existing Notices */}
                      {personalNotices.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                          <p>No personal notices for this trainee</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {personalNotices.map((notice) => (
                            <div 
                              key={notice.id} 
                              className={`rounded-lg p-4 border-l-4 ${
                                notice.type === 'urgent' ? 'bg-red-50 border-l-red-500' :
                                notice.type === 'warning' ? 'bg-amber-50 border-l-amber-500' :
                                notice.type === 'success' ? 'bg-green-50 border-l-green-500' :
                                'bg-blue-50 border-l-blue-500'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-semibold text-foreground">{notice.title}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(notice.createdAt), 'MMM d, yyyy')}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deletePersonalNotice(notice.id)}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notice.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      {pdfViewer && (
        <PDFViewer
          url={pdfViewer.url}
          title={pdfViewer.title}
          open={!!pdfViewer}
          onOpenChange={(open) => !open && setPdfViewer(null)}
        />
      )}
    </AdminLayout>
  )
}

