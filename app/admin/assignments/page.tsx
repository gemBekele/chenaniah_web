"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, FileText, Plus, Calendar, X, ArrowLeft, MoreVertical, Trash2, Eye, CheckCircle2, Clock } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { AdminLayout } from "@/components/admin-layout"
import { toast } from "sonner"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const API_BASE_URL = getApiBaseUrl()

interface Assignment {
  id: number
  title: string
  description?: string
  dueDate: string
  createdAt: string
  _count?: {
    submissions: number
  }
}

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  })
  const router = useRouter()

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/trainees/assignments/all`, {
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
        setAssignments(data.assignments || [])
      }
    } catch (err) {
      console.error("Error loading assignments:", err)
      toast.error('Failed to load assignments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.dueDate) {
      toast.error('Title and due date are required')
      return
    }

    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/trainees/assignments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          dueDate: formData.dueDate,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Assignment created successfully')
        setFormData({ title: "", description: "", dueDate: "" })
        setShowCreateForm(false)
        loadAssignments()
      } else {
        toast.error(data.error || 'Failed to create assignment')
      }
    } catch (err) {
      console.error("Error creating assignment:", err)
      toast.error('Failed to create assignment')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading && assignments.length === 0) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center min-h-screen bg-[#f8f9fa]">
          <Loader2 className="h-8 w-8 animate-spin text-[#1f2d3d]" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f8f9fa] p-6 font-sans">
        <div className="container mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/admin')} className="rounded-full hover:bg-gray-200">
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-[#1f2d3d] tracking-tight">Assignments</h1>
                <p className="text-gray-500 mt-1">Manage coursework and track submissions</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-[#1f2d3d] hover:bg-[#2a3f54] text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </div>

          {/* Assignments Grid */}
          {assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-[#1f2d3d]">No assignments yet</h3>
              <p className="text-gray-500 mt-2 max-w-sm text-center">
                Create your first assignment to get started. Trainees will see it in their portal.
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="mt-8 bg-[#1f2d3d] text-white rounded-full px-8"
              >
                Create Assignment
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((assignment) => {
                const isOverdue = new Date(assignment.dueDate) < new Date()
                
                return (
                  <div 
                    key={assignment.id} 
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                          <FileText className="h-6 w-6" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-400 hover:text-[#1f2d3d]">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/assignments/${assignment.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <h3 className="text-lg font-bold text-[#1f2d3d] mb-2 line-clamp-1" title={assignment.title}>
                        {assignment.title}
                      </h3>
                      
                      <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1">
                        {assignment.description || "No description provided."}
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            Due Date
                          </span>
                          <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-[#1f2d3d]'}`}>
                            {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" />
                            Submissions
                          </span>
                          <Badge variant="secondary" className="bg-gray-100 text-[#1f2d3d]">
                            {assignment._count?.submissions || 0}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <Button 
                        className="w-full bg-white border border-gray-200 text-[#1f2d3d] hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d] transition-colors rounded-xl"
                        onClick={() => router.push(`/admin/assignments/${assignment.id}`)}
                      >
                        View Submissions
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Create Assignment Dialog */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl">
            <DialogHeader className="p-6 pb-4 border-b border-gray-100">
              <DialogTitle className="text-xl font-bold text-[#1f2d3d] flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#1f2d3d]" />
                Create New Assignment
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Final Project Proposal"
                    required
                    className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#1f2d3d]/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                    className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#1f2d3d]/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide instructions for the assignment..."
                    className="min-h-[120px] resize-none rounded-xl bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#1f2d3d]/10 p-4"
                  />
                </div>
              </div>

              <div className="p-6 pt-2 bg-gray-50/50 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 rounded-xl h-11 border-gray-200 hover:bg-gray-100 hover:text-[#1f2d3d]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl h-11 bg-[#1f2d3d] hover:bg-[#2a3f54] text-white shadow-lg shadow-[#1f2d3d]/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create Assignment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
