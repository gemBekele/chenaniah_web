"use client"

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, DollarSign, Upload, CheckCircle2, Clock, XCircle, FileText, Eye, Download, Copy } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { toast } from "sonner"

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
  const [showForm, setShowForm] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    month: "",
    year: new Date().getFullYear().toString(),
    notes: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [viewingReceipt, setViewingReceipt] = useState<{ url: string; title: string } | null>(null)

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
    
    if (!formData.amount || !formData.month || !formData.year) {
      toast.error('Amount, month and year are required')
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
      formDataToSend.append('month', `${formData.month} ${formData.year}`)
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
        setFormData({ amount: "", month: "", year: new Date().getFullYear().toString(), notes: "" })
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

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const years = [
    new Date().getFullYear().toString(),
    (new Date().getFullYear() - 1).toString(),
    (new Date().getFullYear() - 2).toString()
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#e8cb85]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bank Information Section */}
      <Card className="border-none shadow-md bg-gradient-to-br from-[#1f2d3d] to-[#2c3e50] text-white overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#e8cb85]" />
            Bank Information
          </CardTitle>
          <CardDescription className="text-gray-300">
            Please use the following details for your monthly contribution
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Account Name</p>
              <p className="text-lg font-bold">Chenaniah yezimare agelglot</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Bank Name</p>
              <p className="text-lg font-bold">Abyssinia Bank</p>
            </div>
            <div className="p-4 bg-[#e8cb85]/10 rounded-xl backdrop-blur-sm border border-[#e8cb85]/20 group relative">
              <p className="text-xs uppercase tracking-wider text-[#e8cb85] font-semibold mb-1">Account Number</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-mono font-bold text-[#e8cb85]">248427809</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText("248427809")
                    toast.success("Account number copied!")
                  }}
                  className="h-8 w-8 p-0 text-[#e8cb85] hover:bg-[#e8cb85] hover:text-[#1f2d3d]"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Submission Form */}
      <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl md:text-2xl text-[#1f2d3d] flex items-center gap-2">
                <Upload className="h-5 w-5 md:h-6 md:w-6 text-[#e8cb85]" />
                Submit Contribution
              </CardTitle>
            </div>
            {showForm && (
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-[#1f2d3d]"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Hide
              </Button>
            )}
          </div>
        </CardHeader>
        {showForm ? (
          <CardContent className="p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="month" className="text-[#1f2d3d] font-semibold">Month *</Label>
                  <Select 
                    value={formData.month} 
                    onValueChange={(value) => setFormData({ ...formData, month: value })}
                  >
                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 text-[#1f2d3d]">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-[#1f2d3d] font-semibold">Year *</Label>
                  <Select 
                    value={formData.year} 
                    onValueChange={(value) => setFormData({ ...formData, year: value })}
                  >
                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 text-[#1f2d3d]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-[#1f2d3d] font-semibold">Amount (ETB) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">ETB</span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      className="h-12 pl-12 bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20 text-[#1f2d3d] text-lg font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositSlip" className="text-[#1f2d3d] font-semibold">Deposit Slip / Receipt *</Label>
                <div className={`mt-1 border-2 border-dashed rounded-xl p-6 md:p-8 text-center transition-colors ${selectedFile ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200 hover:border-[#e8cb85] bg-gray-50'}`}>
                  <input
                    id="depositSlip"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    required
                    className="hidden"
                  />
                  <label htmlFor="depositSlip" className="cursor-pointer flex flex-col items-center gap-2">
                    {selectedFile ? (
                      <>
                        <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-emerald-500" />
                        <p className="text-emerald-700 font-medium text-sm md:text-base truncate max-w-full px-4">{selectedFile.name}</p>
                        <p className="text-xs text-emerald-600">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 md:h-10 md:w-10 text-gray-400" />
                        <p className="text-gray-600 font-medium text-sm md:text-base">Click to upload receipt</p>
                        <p className="text-xs text-gray-400">Image or PDF (Max 10MB)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-[#1f2d3d] font-semibold">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional info..."
                  className="min-h-[80px] bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20 text-[#1f2d3d] resize-none"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-3 pt-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full md:flex-1 h-12 bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white shadow-lg text-base font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Submit Contribution
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ amount: "", month: "", year: new Date().getFullYear().toString(), notes: "" })
                    setSelectedFile(null)
                  }}
                  className="w-full md:w-auto h-12 px-6 border-gray-200 text-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        ) : (
          <CardContent className="p-6">
            <div className="text-center">
              <Button 
                onClick={() => setShowForm(true)}
                className="h-12 w-full md:w-auto px-10 bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white rounded-xl"
              >
                <Upload className="h-5 w-5 mr-2" />
                Submit New Contribution
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Payment History Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1f2d3d]">Contribution History</h3>

        {payments.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
            <CardContent className="py-12 text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-[#1f2d3d]">No records yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="border-gray-200 shadow-sm bg-white">
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-[#1f2d3d]">{payment.month}</CardTitle>
                      <CardDescription className="mt-1 font-bold text-[#1f2d3d]">
                        ETB {payment.amount.toFixed(2)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="space-y-3">
                    {payment.notes && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{payment.notes}</p>
                    )}
                    {payment.depositSlipPath && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!payment.depositSlipPath) return
                            const url = `${API_BASE_URL}/${payment.depositSlipPath}`
                            setViewingReceipt({ url, title: `Receipt - ${payment.month}` })
                          }}
                          className="flex-1 md:flex-none gap-2 border-gray-200 text-gray-600 hover:bg-[#1f2d3d] hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const url = `${API_BASE_URL}/${payment.depositSlipPath}`
                            const link = document.createElement('a')
                            link.href = url
                            link.download = `receipt-${payment.month}`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }}
                          className="flex-1 md:flex-none gap-2 border-gray-200 text-gray-600 hover:bg-[#1f2d3d] hover:text-white"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400 flex justify-between">
                      <span>Submitted: {new Date(payment.createdAt).toLocaleDateString()}</span>
                      {payment.paidAt && <span>Paid: {new Date(payment.paidAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Viewer Modal */}
      <Dialog open={!!viewingReceipt} onOpenChange={(open) => !open && setViewingReceipt(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{viewingReceipt?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-4">
            {viewingReceipt?.url.toLowerCase().endsWith('.pdf') ? (
              <iframe 
                src={viewingReceipt.url} 
                className="w-full h-full border-none rounded-lg shadow-lg"
                title="PDF Viewer"
              />
            ) : (
              <img 
                src={viewingReceipt?.url} 
                alt="Receipt" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            )}
          </div>
          <div className="p-4 border-t bg-white flex justify-end">
            <Button onClick={() => setViewingReceipt(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
