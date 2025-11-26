"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Users, Search, FileText, DollarSign, Eye, CheckCircle2, XCircle, Clock } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminLayout } from "@/components/admin-layout"
import Link from 'next/link'

const API_BASE_URL = getApiBaseUrl()

interface Trainee {
  id: number
  username: string
  fullNameEnglish?: string
  fullNameAmharic?: string
  phone: string
  status: string
  profileComplete: boolean
  createdAt: string
  appointment?: {
    id: number
    applicantName: string
    scheduledDate: string
    scheduledTime: string
    finalDecision?: string
  }
  _count?: {
    assignmentSubmissions: number
    payments: number
  }
}

export default function AdminTraineesPage() {
  const [trainees, setTrainees] = useState<Trainee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadTrainees()
  }, [statusFilter, searchQuery])

  const loadTrainees = async () => {
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
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`${API_BASE_URL}/admin/trainees?${params.toString()}`, {
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
        setTrainees(data.students || [])
      }
    } catch (err) {
      console.error("Error loading trainees:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200',
      graduated: 'bg-primary/20 text-primary-foreground border-primary/30',
      dismissed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200',
    }
    return badges[status as keyof typeof badges] || badges.inactive
  }

  if (isLoading && trainees.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1f2d3d] tracking-tight">Trainee Management</h1>
            <p className="text-gray-500 mt-1">View and manage all registered trainees</p>
          </div>
          <div className="flex items-center gap-2">
             <div className="bg-white border border-gray-200 text-[#1f2d3d] px-4 py-2 rounded-lg font-medium shadow-sm">
                Total: {trainees.length}
             </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Trainees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-[#1f2d3d]">{trainees.length}</div>
                <Users className="h-5 w-5 text-[#1f2d3d]" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-emerald-600">
                  {trainees.filter(t => t.status === 'active').length}
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Profile Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-blue-600">
                  {trainees.filter(t => t.profileComplete).length}
                </div>
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Graduated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-[#e8cb85]">
                  {trainees.filter(t => t.status === 'graduated').length}
                </div>
                <Clock className="h-5 w-5 text-[#e8cb85]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 shadow-sm border-gray-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, phone, or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20 bg-gray-50"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {['all', 'active', 'inactive', 'graduated'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status 
                      ? "bg-[#1f2d3d] text-white hover:bg-[#1f2d3d]/90" 
                      : "border-gray-200 text-gray-600 hover:text-[#1f2d3d] hover:border-[#1f2d3d]"}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trainees Table */}
        <Card className="shadow-sm border-gray-200 overflow-hidden bg-white">
          <CardHeader className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-lg text-[#1f2d3d]">Trainees List</CardTitle>
                    <CardDescription className="text-gray-500">Manage and monitor trainee progress</CardDescription>
                </div>
                <Users className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {trainees.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No trainees found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left p-4 font-semibold text-gray-500 text-sm">Name</th>
                      <th className="text-left p-4 font-semibold text-gray-500 text-sm">Phone</th>
                      <th className="text-left p-4 font-semibold text-gray-500 text-sm">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-500 text-sm">Profile</th>
                      <th className="text-left p-4 font-semibold text-gray-500 text-sm">Assignments</th>
                      <th className="text-left p-4 font-semibold text-gray-500 text-sm">Payments</th>
                      <th className="text-left p-4 font-semibold text-gray-500 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainees.map((trainee) => (
                      <tr key={trainee.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-[#1f2d3d]">{trainee.fullNameEnglish || trainee.username}</div>
                            {trainee.fullNameAmharic && (
                              <div className="text-sm text-gray-500">{trainee.fullNameAmharic}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{trainee.phone}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(trainee.status)}`}>
                            {trainee.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {trainee.profileComplete ? (
                            <div className="flex items-center text-emerald-600 text-sm">
                                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                <span className="hidden md:inline">Complete</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-amber-600 text-sm">
                                <XCircle className="h-4 w-4 mr-1.5" />
                                <span className="hidden md:inline">Incomplete</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-sm font-medium text-gray-600">{trainee._count?.assignmentSubmissions || 0}</td>
                        <td className="p-4 text-sm font-medium text-gray-600">{trainee._count?.payments || 0}</td>
                        <td className="p-4">
                          <Link href={`/admin/trainees/${trainee.id}`}>
                            <Button variant="outline" size="sm" className="border-gray-200 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d] transition-colors text-gray-600">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

