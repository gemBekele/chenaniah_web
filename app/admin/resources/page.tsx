"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Folder, Plus, Upload, X, FileText, ExternalLink, Download } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { AdminLayout } from "@/components/admin-layout"
import { toast } from "sonner"

const API_BASE_URL = getApiBaseUrl()

interface Resource {
  id: number
  title: string
  description?: string
  type: 'file' | 'link' | 'folder'
  url?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createdAt: string
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "file" as "file" | "link",
    url: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/resources/all`, {
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
        setResources(data.resources || [])
      }
    } catch (err) {
      console.error("Error loading resources:", err)
      toast.error('Failed to load resources')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB')
        return
      }
      setSelectedFile(file)
      if (!formData.title) {
        setFormData({ ...formData, title: file.name })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title) {
      toast.error('Title is required')
      return
    }

    if (formData.type === 'file' && !selectedFile) {
      toast.error('Please select a file')
      return
    }

    if (formData.type === 'link' && !formData.url) {
      toast.error('URL is required for links')
      return
    }

    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }

    setIsSubmitting(true)
    setUploadingFile(true)

    try {
      if (formData.type === 'file' && selectedFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', selectedFile)
        uploadFormData.append('title', formData.title)
        uploadFormData.append('description', formData.description || '')

        const response = await fetch(`${API_BASE_URL}/admin/resources/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        })

        const data = await response.json()
        if (data.success) {
          toast.success('Resource uploaded successfully')
          setFormData({ title: "", description: "", type: "file", url: "" })
          setSelectedFile(null)
          setShowCreateForm(false)
          loadResources()
        } else {
          toast.error(data.error || 'Failed to upload resource')
        }
      } else if (formData.type === 'link') {
        const response = await fetch(`${API_BASE_URL}/admin/resources`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description || undefined,
            type: 'link',
            url: formData.url,
          }),
        })

        const data = await response.json()
        if (data.success) {
          toast.success('Resource created successfully')
          setFormData({ title: "", description: "", type: "file", url: "" })
          setShowCreateForm(false)
          loadResources()
        } else {
          toast.error(data.error || 'Failed to create resource')
        }
      }
    } catch (err) {
      console.error("Error creating resource:", err)
      toast.error('Failed to create resource')
    } finally {
      setIsSubmitting(false)
      setUploadingFile(false)
    }
  }

  if (isLoading) {
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
              <h1 className="text-2xl font-bold text-[#1f2d3d] tracking-tight">Resources</h1>
              <p className="text-gray-500 mt-1">Upload and manage shared resources for trainees</p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-[#1f2d3d] text-white hover:bg-[#1f2d3d]/90 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>

          {showCreateForm && (
            <Card className="mb-8 border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4 bg-white">
              <CardHeader className="bg-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-[#1f2d3d]">Add New Resource</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)} className="h-8 w-8 p-0 text-gray-500 hover:text-[#1f2d3d]">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-[#1f2d3d]">Resource Type *</Label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as "file" | "link" })}
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8cb85] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[#1f2d3d]"
                        required
                      >
                        <option value="file">File Upload</option>
                        <option value="link">External Link</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-[#1f2d3d]">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Resource title"
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
                      placeholder="Resource description"
                      className="min-h-[80px] bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20"
                    />
                  </div>

                  {formData.type === 'file' ? (
                    <div className="space-y-2">
                      <Label htmlFor="file" className="text-[#1f2d3d]">File *</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="file"
                          type="file"
                          onChange={handleFileChange}
                          required
                          className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1f2d3d]/10 file:text-[#1f2d3d] hover:file:bg-[#1f2d3d]/20 bg-gray-50 border-gray-200"
                        />
                      </div>
                      {selectedFile && (
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="url" className="text-[#1f2d3d]">URL *</Label>
                      <Input
                        id="url"
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://example.com"
                        required
                        className="bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20"
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="border-gray-200 text-gray-600 hover:bg-gray-50">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || uploadingFile} className="bg-[#1f2d3d] text-white hover:bg-[#1f2d3d]/90">
                      {isSubmitting || uploadingFile ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {uploadingFile ? 'Uploading...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          {formData.type === 'file' ? (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Resource
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Create Resource
                            </>
                          )}
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
                    <CardTitle className="text-lg text-[#1f2d3d]">All Resources</CardTitle>
                    <CardDescription className="text-gray-500">Shared resources available to trainees</CardDescription>
                  </div>
                  <Folder className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {resources.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Folder className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No resources uploaded yet</p>
                  <p className="text-sm mt-1">Click the "Add Resource" button to share files or links</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((resource) => (
                    <Card key={resource.id} className="border-gray-200 hover:border-[#1f2d3d]/30 transition-all hover:shadow-md group flex flex-col h-full shadow-sm bg-white">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gray-50 text-[#1f2d3d] group-hover:bg-[#1f2d3d] group-hover:text-white transition-colors">
                            {resource.type === 'file' ? (
                              <FileText className="h-5 w-5" />
                            ) : (
                              <ExternalLink className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate text-[#1f2d3d] group-hover:text-[#e8cb85] transition-colors" title={resource.title}>
                              {resource.title}
                            </CardTitle>
                            {resource.description && (
                              <CardDescription className="mt-1 line-clamp-2 text-xs text-gray-500">
                                {resource.description}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-end pt-0">
                        <div className="space-y-3 mt-auto pt-3 border-t border-gray-100">
                          {resource.fileName && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="truncate max-w-[150px]">{resource.fileName}</span>
                              {resource.fileSize && <span className="shrink-0">• {(resource.fileSize / 1024 / 1024).toFixed(2)} MB</span>}
                            </p>
                          )}
                          <div className="flex gap-2">
                            {resource.type === 'link' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(resource.url, '_blank')}
                                className="flex-1 border-gray-200 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d] transition-colors text-gray-600"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Link
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(resource.fileUrl, '_blank')}
                                className="flex-1 border-gray-200 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d] transition-colors text-gray-600"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            )}
                          </div>
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
