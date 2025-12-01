"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, FileText, Plus, Calendar, X } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { AdminLayout } from "@/components/admin-layout"
import { toast } from "sonner"
import { format } from "date-fns"

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1f2d3d] tracking-tight">Assignments</h1>
              <p className="text-gray-500 mt-1">Create and manage assignments for trainees</p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-[#1f2d3d] text-white hover:bg-[#1f2d3d]/90 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </div>

          {showCreateForm && (
            <Card className="mb-8 border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4 bg-white">
              <CardHeader className="bg-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-[#1f2d3d]">Create New Assignment</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)} className="h-8 w-8 p-0 text-gray-500 hover:text-[#1f2d3d]">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-[#1f2d3d]">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Assignment title"
                        required
                        className="bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate" className="text-[#1f2d3d]">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="datetime-local"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                        className="bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-[#1f2d3d]">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Assignment description and instructions"
                      className="min-h-[100px] bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20"
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="border-gray-200 text-gray-600 hover:bg-gray-50">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-[#1f2d3d] text-white hover:bg-[#1f2d3d]/90">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Assignment
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border-gray-200 bg-white">
            <CardHeader className="bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-[#1f2d3d]">All Assignments</CardTitle>
                    <CardDescription className="text-gray-500">List of all assignments</CardDescription>
                  </div>
                  <FileText className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {assignments.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No assignments created yet</p>
                  <p className="text-sm mt-1">Click the "Create Assignment" button to get started</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id} className="border-gray-200 hover:border-[#1f2d3d]/30 transition-all group shadow-sm hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-[#1f2d3d] group-hover:text-[#e8cb85] transition-colors">{assignment.title}</CardTitle>
                            {assignment.description && (
                              <CardDescription className="mt-2 line-clamp-2 text-gray-500">{assignment.description}</CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                              <Calendar className="h-4 w-4 text-[#1f2d3d]" />
                              <span>Due: {format(new Date(assignment.dueDate), 'PPp')}</span>
                            </div>
                            <div className="text-gray-500">
                              Submissions: <span className="font-medium text-[#1f2d3d]">{assignment._count?.submissions || 0}</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/assignments/${assignment.id}`)}
                            className="border-gray-200 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d] transition-colors text-gray-600"
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}









