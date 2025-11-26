"use client"

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, DollarSign, Upload, CheckCircle2, Clock, XCircle, FileText, Eye, Download } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { toast } from "sonner"
import { PDFViewer } from "@/components/pdf-viewer"

const API_BASE_URL = getApiBaseUrl()

interface StudentUser {
  id: number
  username: string
}

interface Payment {
  id: number
  amount: number
  month: string
  status: string
  paidAt?: string
  notes?: string
  depositSlipPath?: string
  createdAt: string
}

interface StudentPaymentsProps {
  user: StudentUser
}

export default function StudentPayments({ user }: StudentPaymentsProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(true) // Show form by default
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    month: "",
    notes: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfViewer, setPdfViewer] = useState<{ url: string; title: string } | null>(null)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    if (!token) return

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/student/payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401) {
        return
      }

      const data = await response.json()
      if (data.success) {
        setPayments(data.payments || [])
      }
    } catch (err) {
      console.error("Error loading payments:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.month) {
      toast.error('Amount and month are required')
      return
    }

    if (!selectedFile) {
      toast.error('Please upload a deposit slip')
      return
    }

    const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    if (!token) {
      toast.error('Please log in again')
      return
    }

    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('amount', formData.amount)
      formDataToSend.append('month', formData.month)
      if (formData.notes) {
        formDataToSend.append('notes', formData.notes)
      }
      if (selectedFile) {
        formDataToSend.append('depositSlip', selectedFile)
      }

      const response = await fetch(`${API_BASE_URL}/student/submit-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Contribution submitted successfully')
        setFormData({ amount: "", month: "", notes: "" })
        setSelectedFile(null)
        setShowForm(false)
        loadPayments()
      } else {
        toast.error(data.error || 'Failed to submit contribution')
      }
    } catch (err) {
      console.error("Error submitting payment:", err)
      toast.error('Failed to submit contribution')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Paid
          </span>
        )
      case 'overdue':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Overdue
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e8cb85]/20 text-[#1f2d3d] flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )
    }
  }

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#e8cb85]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Payment Submission Form - Always visible at top */}
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-[#1f2d3d] flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-[#e8cb85]" />
                Submit Monthly Contribution
              </CardTitle>
              <CardDescription className="mt-2 text-base text-gray-500">
                Upload your deposit slip and provide contribution details to submit your monthly contribution
              </CardDescription>
            </div>
            {showForm && (
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-[#1f2d3d] hover:bg-gray-100"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Hide Form
              </Button>
            )}
          </div>
        </CardHeader>
        {showForm ? (
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month" className="text-[#1f2d3d]">Month *</Label>
                  <Input
                    id="month"
                    type="month"
                    value={formData.month || getCurrentMonth()}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    required
                    className="mt-1 bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20 text-[#1f2d3d]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Select the month for this contribution</p>
                </div>
                <div>
                  <Label htmlFor="amount" className="text-[#1f2d3d]">Amount (ETB) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="500.00"
                    required
                    className="mt-1 bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20 text-[#1f2d3d] placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="depositSlip" className="text-[#1f2d3d]">Deposit Slip *</Label>
                <Input
                  id="depositSlip"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required
                  className="mt-1 bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20 file:text-[#1f2d3d] file:font-medium text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload a photo or scan of your deposit slip (Image or PDF)
                </p>
                {selectedFile && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600 border border-gray-100">
                    Selected: {selectedFile.name}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="notes" className="text-[#1f2d3d]">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information about this contribution..."
                  className="mt-1 min-h-[100px] bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20 text-[#1f2d3d] placeholder:text-gray-400"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ amount: "", month: "", notes: "" })
                    setSelectedFile(null)
                  }}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Contribution
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        ) : (
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white shadow-sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Show Contribution Form
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Payment History Section */}
      <div>
        <h3 className="text-lg font-semibold text-[#1f2d3d] mb-4">Contribution History</h3>

        {payments.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50 shadow-none">
            <CardContent className="py-12 text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-[#1f2d3d] mb-2">No contribution records yet</p>
              <p className="text-sm text-gray-500 mb-4">Submit your first monthly contribution using the form above</p>
            </CardContent>
          </Card>
        ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id} className="border-gray-200 hover:border-[#1f2d3d]/30 transition-all shadow-sm bg-white">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-[#1f2d3d]">{payment.month}</CardTitle>
                    <CardDescription className="mt-1 text-gray-500">
                      Amount: ETB {payment.amount.toFixed(2)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payment.paidAt && (
                    <div className="text-sm">
                      <span className="text-gray-500">Paid on: </span>
                      <span className="font-medium text-[#1f2d3d]">{new Date(payment.paidAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {payment.notes && (
                    <div className="text-sm">
                      <span className="text-gray-500">Notes: </span>
                      <span className="text-gray-700">{payment.notes}</span>
                    </div>
                  )}
                  {payment.depositSlipPath && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!payment.depositSlipPath) return
                          const url = `${API_BASE_URL}/${payment.depositSlipPath}`
                          if (payment.depositSlipPath.toLowerCase().endsWith('.pdf')) {
                            setPdfViewer({ url, title: `Deposit Slip - ${payment.month}` })
                          } else {
                            window.open(url, '_blank')
                          }
                        }}
                        className="gap-2 border-gray-200 text-gray-600 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d]"
                      >
                        <Eye className="h-4 w-4" />
                        View Deposit Slip
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = `${API_BASE_URL}/${payment.depositSlipPath}`
                          const link = document.createElement('a')
                          link.href = url
                          link.download = `deposit-slip-${payment.month}.pdf`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                        className="gap-2 border-gray-200 text-gray-600 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d]"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  )}
                  <div className="text-xs text-gray-400">
                    Submitted: {new Date(payment.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </div>

      {pdfViewer && (
        <PDFViewer
          url={pdfViewer.url}
          title={pdfViewer.title}
          open={!!pdfViewer}
          onOpenChange={(open) => !open && setPdfViewer(null)}
        />
      )}
    </div>
  )
}

