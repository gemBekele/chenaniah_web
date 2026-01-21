"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Users, ArrowLeft, Upload, Bell, FileText, Trash2, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { AdminLayout } from "@/components/admin-layout"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"

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
    notices: number
  }
}

interface Resource {
  id: number
  title: string
  description?: string
  type: 'file' | 'link'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createdAt: string
}

interface Notice {
  id: number
  title: string
  content: string
  type: string
  active: boolean
  createdAt: string
}

interface Student {
  id: number
  username: string
  fullNameEnglish?: string
  phone: string
  status: string
}

export default function AdminSectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sectionId = parseInt(params.id as string)

  const [section, setSection] = useState<Section | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLeaderDialogOpen, setIsLeaderDialogOpen] = useState(false)

  // Resource upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Notice form state
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    type: 'info'
  })
  const [isCreatingNotice, setIsCreatingNotice] = useState(false)

  useEffect(() => {
    if (sectionId) {
      loadSection()
      loadStudents()
      loadResources()
      loadNotices()
    }
  }, [sectionId])

  const getToken = () => localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')

  const loadSection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sections`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
      const data = await response.json()
      if (data.success) {
        const found = data.sections.find((s: Section) => s.id === sectionId)
        setSection(found || null)
      }
    } catch (err) {
      console.error("Error loading section:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/trainees?sectionId=${sectionId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
      const data = await response.json()
      if (data.success) {
        setStudents(data.students || [])
      }
    } catch (err) {
      console.error("Error loading students:", err)
    }
  }

  const loadAllStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/trainees`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
      const data = await response.json()
      if (data.success) {
        setAllStudents(data.students || [])
      }
    } catch (err) {
      console.error("Error loading all students:", err)
    }
  }

  const handleAssignLeader = async (studentId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sections/${sectionId}/leader`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Section leader assigned")
        setIsLeaderDialogOpen(false)
        loadSection()
      } else {
        toast.error(data.error || "Failed to assign leader")
      }
    } catch (err) {
      console.error("Error assigning leader:", err)
      toast.error("Failed to assign leader")
    }
  }

  const loadResources = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/resources/all`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
      const data = await response.json()
      if (data.success) {
        // Filter resources for this section
        const sectionResources = (data.resources || []).filter((r: any) => r.sectionId === sectionId)
        setResources(sectionResources)
      }
    } catch (err) {
      console.error("Error loading resources:", err)
    }
  }

  const loadNotices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/notices?sectionId=${sectionId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
      const data = await response.json()
      if (data.success) {
        setNotices(data.notices || [])
      }
    } catch (err) {
      console.error("Error loading notices:", err)
    }
  }

  const handleFileUpload = async () => {
    if (uploadFiles.length === 0) return

    setIsUploading(true)
    const formData = new FormData()
    uploadFiles.forEach(file => formData.append('files', file))
    formData.append('titles', JSON.stringify(uploadFiles.map(f => f.name)))
    formData.append('descriptions', JSON.stringify(uploadFiles.map(() => '')))
    formData.append('sectionId', sectionId.toString())

    try {
      const response = await fetch(`${API_BASE_URL}/resources/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`${data.count} file(s) uploaded successfully`)
        setUploadFiles([])
        loadResources()
      } else {
        toast.error(data.error || "Upload failed")
      }
    } catch (err) {
      console.error("Error uploading:", err)
      toast.error("Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreateNotice = async () => {
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      toast.error("Title and content are required")
      return
    }

    setIsCreatingNotice(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/notices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...noticeForm,
          sectionId: sectionId,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Notice created")
        setNoticeForm({ title: '', content: '', type: 'info' })
        loadNotices()
      } else {
        toast.error(data.error || "Failed to create notice")
      }
    } catch (err) {
      console.error("Error creating notice:", err)
      toast.error("Failed to create notice")
    } finally {
      setIsCreatingNotice(false)
    }
  }

  const handleDeleteResource = async (id: number) => {
    if (!confirm("Delete this resource?")) return

    try {
      const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Resource deleted")
        loadResources()
      }
    } catch (err) {
      console.error("Error deleting resource:", err)
    }
  }

  const handleDeleteNotice = async (id: number) => {
    if (!confirm("Delete this notice?")) return

    try {
      const response = await fetch(`${API_BASE_URL}/admin/notices/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Notice deleted")
        loadNotices()
      }
    } catch (err) {
      console.error("Error deleting notice:", err)
    }
  }

  const getNoticeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'urgent': return <AlertCircle className="h-4 w-4 text-rose-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!section) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p className="text-gray-500">Section not found</p>
          <Button variant="outline" onClick={() => router.push('/admin/sections')} className="mt-4">
            Back to Sections
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/admin/sections')}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div 
              className="w-4 h-12 rounded-full" 
              style={{ backgroundColor: section.color }}
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#1f2d3d]">{section.name}</h1>
              <p className="text-gray-500 text-sm">Code: {section.code}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1f2d3d]">{students.length}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Students</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1f2d3d]">{resources.length}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Resources</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1f2d3d]">{notices.length}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Notices</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leader Info */}
          <Card className="bg-white mb-6">
            <CardContent className="p-4 flex items-center justify-between">
              {section.leader ? (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1f2d3d] text-white flex items-center justify-center font-bold">
                    {section.leader.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Section Leader</p>
                    <p className="font-semibold text-[#1f2d3d]">
                      {section.leader.fullNameEnglish || section.leader.username}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Section Leader</p>
                    <p className="font-semibold text-gray-400 italic">No leader assigned</p>
                  </div>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  loadAllStudents()
                  setIsLeaderDialogOpen(true)
                }}
              >
                {section.leader ? 'Change Leader' : 'Assign Leader'}
              </Button>
            </CardContent>
          </Card>

          {/* Assign Leader Dialog */}
          <Dialog open={isLeaderDialogOpen} onOpenChange={setIsLeaderDialogOpen}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: section.color }}
                  />
                  Assign Leader for {section.name}
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
                          section.leaderId === student.id
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
                        {section.leaderId === student.id && (
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

          {/* Tabs */}
          <Tabs defaultValue="resources" className="space-y-4">
            <TabsList className="bg-white border">
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="notices">Notices</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
            </TabsList>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-4">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Upload Resources</CardTitle>
                  <CardDescription>Upload files for this section's students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-gray-300 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to select files</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, images, audio files</p>
                    </label>
                  </div>

                  {uploadFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm flex-1 truncate">{file.name}</span>
                          <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ))}
                      <Button
                        onClick={handleFileUpload}
                        disabled={isUploading}
                        className="w-full bg-[#1f2d3d] hover:bg-[#1f2d3d]/90"
                      >
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload Files"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Existing Resources */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Section Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  {resources.length > 0 ? (
                    <div className="space-y-2">
                      {resources.map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm">{resource.title}</p>
                              <p className="text-xs text-gray-400">{resource.fileName}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-rose-600"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-8">No resources uploaded yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notices Tab */}
            <TabsContent value="notices" className="space-y-4">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Create Notice</CardTitle>
                  <CardDescription>Send an announcement to this section</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={noticeForm.title}
                      onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                      placeholder="Notice title..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      value={noticeForm.content}
                      onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                      placeholder="Write your announcement..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <div className="flex gap-2">
                      {['info', 'success', 'warning', 'urgent'].map((type) => (
                        <Button
                          key={type}
                          variant={noticeForm.type === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNoticeForm({ ...noticeForm, type })}
                          className={noticeForm.type === type 
                            ? "bg-[#1f2d3d] text-white hover:bg-[#1f2d3d]/90" 
                            : "text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100"}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateNotice}
                    disabled={isCreatingNotice}
                    className="w-full bg-[#1f2d3d] hover:bg-[#1f2d3d]/90"
                  >
                    {isCreatingNotice ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Notice"}
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Notices */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Section Notices</CardTitle>
                </CardHeader>
                <CardContent>
                  {notices.length > 0 ? (
                    <div className="space-y-2">
                      {notices.map((notice) => (
                        <div key={notice.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-3">
                            {getNoticeIcon(notice.type)}
                            <div>
                              <p className="font-medium text-sm">{notice.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-2">{notice.content}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-rose-600"
                            onClick={() => handleDeleteNotice(notice.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-8">No notices yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Section Students</CardTitle>
                  <CardDescription>{students.length} students in this section</CardDescription>
                </CardHeader>
                <CardContent>
                  {students.length > 0 ? (
                    <div className="space-y-2">
                      {students.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1f2d3d] text-white flex items-center justify-center font-bold">
                              {student.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                {student.fullNameEnglish || student.username}
                              </p>
                              <p className="text-xs text-gray-500">{student.phone}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                            student.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {student.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-8">No students in this section</p>
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
