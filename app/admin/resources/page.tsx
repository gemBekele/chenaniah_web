"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Folder, Plus, Upload, X, FileText, ExternalLink, Download, Trash2 } from "lucide-react"
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
  batchId?: string
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "file" as "file" | "link",
    url: "",
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      
      // Validate file sizes
      const oversizedFiles = newFiles.filter(file => file.size > 50 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        toast.error(`${oversizedFiles.length} file(s) exceed the 50MB limit`)
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }
      
      // Add new files to existing list (accumulate)
      setSelectedFiles(prev => [...prev, ...newFiles])
      
      // Set title only for first single file
      if (selectedFiles.length === 0 && newFiles.length === 1 && !formData.title) {
        setFormData({ ...formData, title: newFiles[0].name })
      }
      
      // Reset input to allow selecting the same file again or adding more
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    if (newFiles.length === 0) {
      setFormData(prev => ({ ...prev, title: "" }))
    }
  }

  const clearAllFiles = () => {
    setSelectedFiles([])
    setFormData(prev => ({ ...prev, title: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedFiles.length <= 1 && !formData.title) {
      toast.error('Title is required')
      return
    }

    if (formData.type === 'file' && selectedFiles.length === 0) {
      toast.error('Please select at least one file')
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
      if (formData.type === 'file' && selectedFiles.length > 0) {
        const uploadFormData = new FormData()
        
        // Append all files
        selectedFiles.forEach(file => {
          uploadFormData.append('files', file)
        })
        
        // For multiple files, send titles and descriptions as arrays
        // Use custom title if provided, otherwise use filename
        const titles = selectedFiles.map((file, index) => {
          if (selectedFiles.length === 1) {
            return formData.title || file.name
          }
          // For multiple files, use filename but allow title as prefix if provided
          if (formData.title && formData.title !== `${selectedFiles.length} files`) {
            // Use the title as a base, append filename or number
            return `${formData.title} - ${file.name}`
          }
          return file.name
        })
        // Use description for all files in the batch, or empty
        const descriptions = selectedFiles.map(() => formData.description || '')
        
        uploadFormData.append('titles', JSON.stringify(titles))
        uploadFormData.append('descriptions', JSON.stringify(descriptions))

        const response = await fetch(`${API_BASE_URL}/admin/resources/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        })

        const data = await response.json()
        if (data.success) {
          const count = data.count || data.resources?.length || selectedFiles.length
          toast.success(`${count} resource${count > 1 ? 's' : ''} uploaded successfully`)
          setFormData({ title: "", description: "", type: "file", url: "" })
          setSelectedFiles([])
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          setShowCreateForm(false)
          loadResources()
        } else {
          toast.error(data.error || 'Failed to upload resource(s)')
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

  const handleDelete = async (resourceId: number, resourceTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${resourceTitle}"? This action cannot be undone.`)) {
      return
    }

    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }

    setDeletingId(resourceId)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Resource deleted successfully')
        loadResources()
      } else {
        toast.error(data.error || 'Failed to delete resource')
      }
    } catch (err) {
      console.error("Error deleting resource:", err)
      toast.error('Failed to delete resource')
    } finally {
      setDeletingId(null)
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
                      <Label htmlFor="title" className="text-[#1f2d3d]">
                        Title {selectedFiles.length > 1 && <span className="text-xs text-gray-400 font-normal">(optional for multiple files)</span>} *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder={selectedFiles.length > 1 ? "Optional - filenames will be used" : "Resource title"}
                        required={selectedFiles.length === 0 || selectedFiles.length === 1}
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
                      <div className="flex items-center justify-between">
                        <Label htmlFor="file" className="text-[#1f2d3d]">Files *</Label>
                        {selectedFiles.length > 0 && (
                          <button
                            type="button"
                            onClick={clearAllFiles}
                            className="text-xs text-red-500 hover:text-red-600 font-medium"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          id="file"
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 border-gray-200 hover:border-[#1f2d3d] hover:bg-gray-50"
                        >
                          <Plus className="h-4 w-4" />
                          Add Files
                        </Button>
                        {selectedFiles.length > 0 && (
                          <span className="text-sm text-gray-500">
                            {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} ready to upload
                          </span>
                        )}
                      </div>
                      {selectedFiles.length > 0 && (
                        <div className="space-y-2 mt-3">
                          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between gap-2 p-2 bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                                  <span className="text-sm text-gray-700 truncate" title={file.name}>
                                    {file.name}
                                  </span>
                                  <span className="text-xs text-gray-500 shrink-0">
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-600 transition-colors shrink-0"
                                  title="Remove file"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 text-center">
                            Click "Add Files" to add more, or remove files using the × button
                          </p>
                        </div>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(resource.id, resource.title)}
                              disabled={deletingId === resource.id}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                            >
                              {deletingId === resource.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
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
