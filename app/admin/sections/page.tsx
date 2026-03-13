"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Users, Plus, Edit2, Trash2, CheckCircle2, XCircle, Palette } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { AdminLayout } from "@/components/admin-layout"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const API_BASE_URL = getApiBaseUrl()

interface Section {
  id: number
  name: string
  code: string
  color: string
  leaderId?: number
  leader?: {
    id: number
    username: string
    fullNameEnglish?: string
  }
  _count?: {
    students: number
    resources: number
  }
}

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    color: '#3B82F6'
  })
  const [isLeaderDialogOpen, setIsLeaderDialogOpen] = useState(false)
  const [selectedSectionForLeader, setSelectedSectionForLeader] = useState<Section | null>(null)
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [isStudentsDialogOpen, setIsStudentsDialogOpen] = useState(false)
  const [sectionStudents, setSectionStudents] = useState<any[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [selectedSectionForStudents, setSelectedSectionForStudents] = useState<Section | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    if (!token) {
      router.push('/admin')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/sections`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('student_token')
        sessionStorage.removeItem('admin_token')
        sessionStorage.removeItem('student_token')
        router.push('/admin')
        return
      }

      const data = await response.json()
      if (data.success) {
        setSections(data.sections || [])
      }
    } catch (err) {
      console.error("Error loading sections:", err)
      toast.error("Failed to load sections")
    } finally {
      setIsLoading(false)
    }
  }

  const loadAllStudents = async () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    try {
      const response = await fetch(`${API_BASE_URL}/admin/trainees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        setAllStudents(data.students || [])
      }
    } catch (err) {
      console.error("Error loading students:", err)
    }
  }

  const loadSectionStudents = async (sectionId: number) => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    setIsLoadingStudents(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/trainees?sectionId=${sectionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        setSectionStudents(data.students || [])
      }
    } catch (err) {
      console.error("Error loading section students:", err)
      toast.error("Failed to load students")
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    
    try {
      const url = editingSection 
        ? `${API_BASE_URL}/sections/${editingSection.id}` 
        : `${API_BASE_URL}/sections`
      
      const method = editingSection ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(editingSection ? "Section updated" : "Section created")
        setIsDialogOpen(false)
        setEditingSection(null)
        setFormData({ name: '', code: '', color: '#3B82F6' })
        loadSections()
      } else {
        toast.error(data.error || "Something went wrong")
      }
    } catch (err) {
      console.error("Error saving section:", err)
      toast.error("Failed to save section")
    }
  }

  const handleAssignLeader = async (studentId: number) => {
    if (!selectedSectionForLeader) return
    
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    try {
      const response = await fetch(`${API_BASE_URL}/sections/${selectedSectionForLeader.id}/leader`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Section leader assigned")
        setIsLeaderDialogOpen(false)
        loadSections()
      } else {
        toast.error(data.error || "Failed to assign leader")
      }
    } catch (err) {
      console.error("Error assigning leader:", err)
      toast.error("Failed to assign leader")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this section?")) return

    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    try {
      const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Section deleted")
        loadSections()
      } else {
        toast.error(data.error || "Failed to delete section")
      }
    } catch (err) {
      console.error("Error deleting section:", err)
      toast.error("Failed to delete section")
    }
  }

  const openEditDialog = (section: Section) => {
    setEditingSection(section)
    setFormData({
      name: section.name,
      code: section.code,
      color: section.color
    })
    setIsDialogOpen(true)
  }

  if (isLoading && sections.length === 0) {
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
              <h1 className="text-2xl font-bold text-[#1f2d3d] tracking-tight">Section Management</h1>
              <p className="text-gray-500 mt-1">Manage choir voice sections and leaders</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                setEditingSection(null)
                setFormData({ name: '', code: '', color: '#3B82F6' })
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Section
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingSection ? 'Edit Section' : 'Create New Section'}</DialogTitle>
                  <DialogDescription>
                    Define the voice section name, code, and theme color.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Section Name (e.g., a- Soprano)</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., a- Soprano"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Section Code (e.g., a)</Label>
                    <Input 
                      id="code" 
                      value={formData.code} 
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="e.g., a"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Theme Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="color" 
                        type="color"
                        value={formData.color} 
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input 
                        value={formData.color} 
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit" className="bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white w-full">
                      {editingSection ? 'Update Section' : 'Create Section'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <Card key={section.id} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div 
                  className="h-2 w-full" 
                  style={{ backgroundColor: section.color }}
                />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold text-[#1f2d3d]">{section.name}</CardTitle>
                      <CardDescription className="font-mono text-xs uppercase tracking-widest mt-1">
                        Code: {section.code}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#1f2d3d]" onClick={() => openEditDialog(section)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-rose-600" onClick={() => handleDelete(section.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 py-2 border-y border-gray-50">
                    <div className="flex-1 text-center">
                      <p className="text-2xl font-bold text-[#1f2d3d]">{section._count?.students || 0}</p>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Students</p>
                    </div>
                    <div className="w-px h-8 bg-gray-100" />
                    <div className="flex-1 text-center">
                      <p className="text-2xl font-bold text-[#1f2d3d]">{section._count?.resources || 0}</p>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Files</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Section Leader</p>
                    {section.leader ? (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[#1f2d3d] text-white flex items-center justify-center text-xs font-bold">
                          {section.leader.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1f2d3d] truncate">
                            {section.leader.fullNameEnglish || section.leader.username}
                          </p>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400 italic">No leader assigned</p>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-200 text-gray-600 hover:bg-[#1f2d3d] hover:text-white transition-colors text-xs h-9"
                    onClick={() => router.push(`/admin/sections/${section.id}`)}
                  >
                    Manage Section
                  </Button>

                </CardContent>
              </Card>
            ))}

            {sections.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No sections defined</h3>
                <p className="text-gray-500 max-w-xs mx-auto mt-2">
                  Voice sections like Soprano, Alto, etc. will appear here once created.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-6 border-gray-200"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Section
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Students Dialog */}
      <Dialog open={isStudentsDialogOpen} onOpenChange={setIsStudentsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: selectedSectionForStudents?.color }}
              />
              Students in {selectedSectionForStudents?.name}
            </DialogTitle>
            <DialogDescription>
              {sectionStudents.length} student{sectionStudents.length !== 1 ? 's' : ''} assigned to this section.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingStudents ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sectionStudents.length > 0 ? (
              <div className="space-y-3">
                {sectionStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1f2d3d] text-white flex items-center justify-center font-bold">
                        {student.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#1f2d3d]">
                          {student.fullNameEnglish || student.username}
                        </p>
                        <p className="text-xs text-gray-500">{student.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                        student.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {student.status}
                      </span>
                      {selectedSectionForStudents?.leaderId === student.id && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase bg-amber-100 text-amber-700">
                          Leader
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 italic">
                <Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <p>No students assigned to this section yet.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Leader Dialog */}
      <Dialog open={isLeaderDialogOpen} onOpenChange={setIsLeaderDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: selectedSectionForLeader?.color }}
              />
              Assign Leader for {selectedSectionForLeader?.name}
            </DialogTitle>
            <DialogDescription>
              Select a student to lead this section. They will be able to upload section-specific resources.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="relative">
              <Input 
                placeholder="Search students by name..." 
                className="pl-10"
              />
              <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {allStudents.length > 0 ? (
                allStudents.map((student) => (
                  <button
                    key={student.id}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                      selectedSectionForLeader?.leaderId === student.id
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                    onClick={() => handleAssignLeader(student.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {student.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[#1f2d3d]">
                          {student.fullNameEnglish || student.username}
                        </p>
                        <p className="text-[10px] text-gray-500">{student.phone}</p>
                      </div>
                    </div>
                    {selectedSectionForLeader?.leaderId === student.id && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 italic">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading students...
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
