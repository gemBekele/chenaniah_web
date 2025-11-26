"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowLeft, User, FileText, DollarSign, CheckCircle2, XCircle, Clock, Save } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin-layout"
import { toast } from "sonner"

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

  useEffect(() => {
    if (params.id) {
      loadTraineeStats()
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

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="container mx-auto max-w-7xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/admin/trainees')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trainees
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {stats.student.fullNameEnglish || stats.student.username}
          </h1>
          <p className="text-muted-foreground">Trainee Details and Performance</p>
        </div>

        {/* Student Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Student Information</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-32">
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
                  {isUpdatingStatus ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name (English)</p>
                <p className="font-medium">{stats.student.fullNameEnglish || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name (Amharic)</p>
                <p className="font-medium">{stats.student.fullNameAmharic || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{stats.student.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium">{stats.student.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{stats.student.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profile Complete</p>
                {stats.student.profileComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-amber-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="font-medium">{new Date(stats.student.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="assignments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="assignments">
              <FileText className="h-4 w-4 mr-2" />
              Assignments ({stats.assignments.submitted}/{stats.assignments.total})
            </TabsTrigger>
            <TabsTrigger value="payments">
              <DollarSign className="h-4 w-4 mr-2" />
              Payments ({stats.payments.paid}/{stats.payments.total})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Performance</CardTitle>
                <CardDescription>
                  Average Grade: {stats.assignments.averageGrade !== null 
                    ? `${stats.assignments.averageGrade.toFixed(1)}%` 
                    : 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.assignments.submissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No assignments submitted yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.assignments.submissions.map((submission) => (
                      <Card key={submission.id} className="border-border/50">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{submission.assignment.title}</CardTitle>
                              <CardDescription className="mt-1">
                                Due: {new Date(submission.assignment.dueDate).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            {submission.grade !== null && (
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">{submission.grade}%</div>
                                <div className="text-sm text-muted-foreground">Graded</div>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Submitted</p>
                              <p className="font-medium">
                                {new Date(submission.submittedAt).toLocaleString()}
                              </p>
                            </div>
                            {submission.grade !== null && submission.feedback && (
                              <div>
                                <p className="text-sm text-muted-foreground">Feedback</p>
                                <p className="text-sm">{submission.feedback}</p>
                              </div>
                            )}
                            {submission.grade === null && (
                              <div className="border-t pt-3 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label htmlFor={`grade-${submission.id}`}>Grade (0-100)</Label>
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
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`feedback-${submission.id}`}>Feedback</Label>
                                    <Input
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
                                      placeholder="Enter feedback"
                                    />
                                  </div>
                                </div>
                                <Button
                                  onClick={() => gradeAssignment(submission.id)}
                                  disabled={gradingSubmission === submission.id || !grade}
                                >
                                  {gradingSubmission === submission.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : null}
                                  Grade Assignment
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  Paid: {stats.payments.paid} | Pending: {stats.payments.pending} | Overdue: {stats.payments.overdue}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.payments.records.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No payment records</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Month</th>
                          <th className="text-left p-3 font-medium">Amount</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Paid Date</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.payments.records.map((payment) => (
                          <tr key={payment.id} className="border-b hover:bg-muted/50">
                            <td className="p-3">{payment.month}</td>
                            <td className="p-3 font-medium">ETB {payment.amount.toFixed(2)}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                payment.status === 'paid' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : payment.status === 'overdue'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="p-3">
                              {payment.paidAt 
                                ? new Date(payment.paidAt).toLocaleDateString()
                                : '-'}
                            </td>
                            <td className="p-3">
                              {payment.status !== 'paid' && (
                                <Button
                                  variant="outline"
                                  size="sm"
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
        </Tabs>
        </div>
      </div>
    </AdminLayout>
  )
}

