"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Download, FileText, Folder, ExternalLink, Image as ImageIcon, File, Eye } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { PDFViewer } from "@/components/pdf-viewer"

const API_BASE_URL = getApiBaseUrl()

interface StudentUser {
  id: number
  profileComplete: boolean
}

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

interface StudentResourcesProps {
  user: StudentUser
}

export default function StudentResources({ user }: StudentResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pdfViewer, setPdfViewer] = useState<{ url: string; title: string } | null>(null)

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/resources`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setResources(data.resources || [])
        }
      }
    } catch (err) {
      console.error('Error loading resources:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getFileUrl = (resource: Resource) => {
    if (resource.fileUrl) {
      // If fileUrl is relative, prepend API base URL
      return resource.fileUrl.startsWith('http') 
        ? resource.fileUrl 
        : `${API_BASE_URL}${resource.fileUrl}`
    } else if (resource.url) {
      return resource.url
    }
    return null
  }

  const isPDF = (fileName?: string) => {
    if (!fileName) return false
    const ext = fileName.split('.').pop()?.toLowerCase()
    return ext === 'pdf'
  }

  const handleOpen = (resource: Resource) => {
    const url = getFileUrl(resource)
    if (!url) return

    if (resource.type === 'file' && isPDF(resource.fileName)) {
      // Open PDF in viewer
      setPdfViewer({ url, title: resource.title })
    } else {
      // Open in new tab
      window.open(url, '_blank')
    }
  }

  const handleDownload = (resource: Resource) => {
    const url = getFileUrl(resource)
    if (!url) return

    const link = document.createElement('a')
    link.href = url
    link.download = resource.fileName || resource.title
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (fileName?: string, type?: string) => {
    if (type === 'link') return <ExternalLink className="h-6 w-6 text-blue-500" />
    if (type === 'folder') return <Folder className="h-6 w-6 text-[#e8cb85]" />
    
    const ext = fileName?.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <ImageIcon className="h-6 w-6 text-purple-500" />
    if (['pdf'].includes(ext || '')) return <FileText className="h-6 w-6 text-rose-500" />
    return <File className="h-6 w-6 text-gray-400" />
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
      {resources.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Folder className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#1f2d3d]">No Resources Yet</h3>
            <p className="text-gray-500 max-w-sm mt-1">
              Check back later for shared documents and links.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card 
              key={resource.id} 
              className="group border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-white"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {getFileIcon(resource.fileName, resource.type)}
                  </div>
                  {resource.type === 'file' && resource.fileSize && (
                    <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                      {formatFileSize(resource.fileSize)}
                    </span>
                  )}
                </div>
                
                <div className="mb-4">
                  <h3 className="font-semibold text-[#1f2d3d] truncate mb-1" title={resource.title}>
                    {resource.title}
                  </h3>
                  {resource.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 h-10">
                      {resource.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {resource.type === 'file' && (
                    <>
                      <Button
                        onClick={() => handleOpen(resource)}
                        variant="outline"
                        className="flex-1 border-gray-200 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d] transition-all duration-200 text-gray-600"
                      >
                        {isPDF(resource.fileName) ? (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleDownload(resource)}
                        variant="outline"
                        size="icon"
                        className="border-gray-200 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d] transition-all duration-200 text-gray-600"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {resource.type === 'link' && (
                    <Button
                      onClick={() => handleOpen(resource)}
                      variant="outline"
                      className="w-full border-gray-200 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d] transition-all duration-200 text-gray-600"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Link
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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

