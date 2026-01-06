"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, DollarSign, Calendar, CheckCircle2, XCircle, Search, Filter, Download, Eye, FileText, User, Clock, ArrowLeft } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { AdminLayout } from "@/components/admin-layout"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'

const API_BASE_URL = getApiBaseUrl()

interface Payment {
  id: number
  studentId: number
  amount: number
  month: string
  status: string
  paidAt?: string
  notes?: string
  depositSlipPath?: string
  createdAt: string
  student: {
    id: number
    username: string
    fullNameEnglish?: string
    fullNameAmharic?: string
    phone: string
  }
}

interface PaymentStats {
  total: number
  paid: number
  pending: number
  overdue: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  overdueAmount: number
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("")
  const [viewingReceipt, setViewingReceipt] = useState<{ url: string; title: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadPayments()
  }, [statusFilter, monthFilter])

  const loadPayments = async () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (monthFilter) {
        params.append('month', monthFilter)
      }

      const response = await fetch(`${API_BASE_URL}/admin/trainees/payments/all?${params.toString()}`, {
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
        setPayments(data.payments || [])
        calculateStats(data.payments || [])
      }
    } catch (err) {
      console.error("Error loading payments:", err)
      toast.error('Failed to load payments')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (paymentsList: Payment[]) => {
    const stats: PaymentStats = {
      total: paymentsList.length,
      paid: 0,
      pending: 0,
      overdue: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
    }

    paymentsList.forEach((payment) => {
      stats.totalAmount += payment.amount
      
      if (payment.status === 'paid') {
        stats.paid++
        stats.paidAmount += payment.amount
      } else if (payment.status === 'overdue') {
        stats.overdue++
        stats.overdueAmount += payment.amount
      } else {
        stats.pending++
        stats.pendingAmount += payment.amount
      }
    })

    setStats(stats)
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
        loadPayments()
      } else {
        toast.error(data.error || 'Failed to update payment')
      }
    } catch (err) {
      console.error("Error updating payment:", err)
      toast.error('Failed to update payment')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Paid
          </span>
        )
      case 'overdue':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Overdue
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )
    }
  }

  const filteredPayments = payments.filter((payment) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        payment.student.fullNameEnglish?.toLowerCase().includes(query) ||
        payment.student.fullNameAmharic?.toLowerCase().includes(query) ||
        payment.student.username.toLowerCase().includes(query) ||
        payment.student.phone.includes(query) ||
        payment.month.includes(query)
      )
    }
    return true
  })

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  if (isLoading && !stats) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1f2d3d] tracking-tight mb-2">Monthly Contributions</h1>
            <p className="text-gray-500">Track and manage trainee monthly payment contributions</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardDescription className="text-gray-500">Total Payments</CardDescription>
                  <CardTitle className="text-2xl text-[#1f2d3d]">{stats.total}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">ETB {stats.totalAmount.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardDescription className="text-emerald-600">Paid</CardDescription>
                  <CardTitle className="text-2xl text-emerald-700">{stats.paid}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-emerald-600">ETB {stats.paidAmount.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardDescription className="text-amber-600">Pending</CardDescription>
                  <CardTitle className="text-2xl text-amber-700">{stats.pending}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-600">ETB {stats.pendingAmount.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardDescription className="text-rose-600">Overdue</CardDescription>
                  <CardTitle className="text-2xl text-rose-700">{stats.overdue}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-rose-600">ETB {stats.overdueAmount.toFixed(2)}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6 border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-200 pb-4">
              <CardTitle className="text-lg text-[#1f2d3d]">Filters</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search" className="text-[#1f2d3d]">Search</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, phone, or month..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status" className="text-[#1f2d3d]">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="mt-1 bg-gray-50 border-gray-200 focus:ring-[#e8cb85]/20 text-[#1f2d3d]">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="month" className="text-[#1f2d3d]">Month</Label>
                  <Input
                    id="month"
                    type="month"
                    value={monthFilter || getCurrentMonth()}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="mt-1 bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20 text-[#1f2d3d]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card className="shadow-md border-none bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-100 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-[#1f2d3d] font-bold">Contribution Records</CardTitle>
                  <CardDescription className="text-gray-500 mt-1">
                    {filteredPayments.length} record{filteredPayments.length !== 1 ? 's' : ''} found for the selected period
                  </CardDescription>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-[#e8cb85]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-gray-50/30">
                  <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-10 w-10 text-gray-300" />
                  </div>
                  <p className="text-xl font-semibold text-[#1f2d3d]">No contributions found</p>
                  <p className="text-sm mt-2 text-gray-400">Try adjusting your filters to find what you're looking for</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Trainee</th>
                        <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Month</th>
                        <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Amount</th>
                        <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Status</th>
                        <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Submission Date</th>
                        <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Receipt</th>
                        <th className="text-right p-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-[#1f2d3d] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                {(payment.student.fullNameEnglish || payment.student.username).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-[#1f2d3d] group-hover:text-[#e8cb85] transition-colors">
                                  {payment.student.fullNameEnglish || payment.student.username}
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                  <FileText className="h-3 w-3" />
                                  {payment.student.phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                              {payment.month}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-[#1f2d3d]">
                              ETB {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="p-4">{getStatusBadge(payment.status)}</td>
                          <td className="p-4">
                            <div className="text-sm text-gray-600">
                              {new Date(payment.createdAt).toLocaleDateString(undefined, { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="p-4">
                            {payment.depositSlipPath ? (
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (!payment.depositSlipPath) return
                                    const url = `${API_BASE_URL}/${payment.depositSlipPath}`
                                    setViewingReceipt({ 
                                      url, 
                                      title: `Receipt - ${payment.student.fullNameEnglish || payment.student.username} - ${payment.month}` 
                                    })
                                  }}
                                  className="h-8 w-8 p-0 border-gray-200 hover:bg-[#1f2d3d] hover:text-white transition-all"
                                  title="View Receipt"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const url = `${API_BASE_URL}/${payment.depositSlipPath}`
                                    const link = document.createElement('a')
                                    link.href = url
                                    link.download = `receipt-${payment.student.username}-${payment.month}.pdf`
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                  }}
                                  className="h-8 w-8 p-0 border-gray-200 hover:bg-[#1f2d3d] hover:text-white transition-all"
                                  title="Download Receipt"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-gray-300 italic text-xs">No receipt</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {payment.status !== 'paid' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updatePaymentStatus(payment.id, 'paid')}
                                  className="h-8 px-3 border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all font-semibold text-xs"
                                >
                                  Approve
                                </Button>
                              )}
                              <Link href={`/admin/trainees/${payment.studentId}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-[#1f2d3d] hover:bg-gray-100">
                                  <User className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

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
      </div>
    </AdminLayout>
  )
}

