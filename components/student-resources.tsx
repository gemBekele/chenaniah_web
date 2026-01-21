"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Loader2, Download, FileText, Folder, ExternalLink, Image as ImageIcon, File, Eye, Music, X, Send } from "lucide-react"
import { toast } from "sonner"
import { getApiBaseUrl } from "@/lib/utils"
import { PDFViewer } from "@/components/pdf-viewer"

const API_BASE_URL = getApiBaseUrl()

interface StudentUser {
  id: number
  profileComplete: boolean
  sectionId?: number
}

export interface Resource {
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
  category?: string
}

interface StudentResourcesProps {
  user: StudentUser
  resources?: Resource[] // Optional prop to pass resources directly
  hideTelegramBanner?: boolean
}

export default function StudentResources({ user, resources: propResources, hideTelegramBanner }: StudentResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pdfViewer, setPdfViewer] = useState<{ url: string; title: string } | null>(null)
  const [imageViewer, setImageViewer] = useState<{ url: string; title: string } | null>(null)

  useEffect(() => {
    if (propResources) {
      setResources(propResources)
      setIsLoading(false)
    } else {
      loadResources()
    }
  }, [propResources])

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

  const getFileType = (fileName?: string): 'pdf' | 'image' | 'audio' | 'other' => {
    if (!fileName) return 'other'
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'pdf'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext || '')) return 'image'
    if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma'].includes(ext || '')) return 'audio'
    return 'other'
  }

  const isPDF = (fileName?: string) => getFileType(fileName) === 'pdf'
  const isImage = (fileName?: string) => getFileType(fileName) === 'image'
  const isAudio = (fileName?: string) => getFileType(fileName) === 'audio'

  const handleOpen = (resource: Resource) => {
    const url = getFileUrl(resource)
    if (!url) return

    if (resource.type === 'file') {
      const fileType = getFileType(resource.fileName)
      if (fileType === 'pdf') {
        // Open PDF in viewer
        setPdfViewer({ url, title: resource.title })
      } else if (fileType === 'image') {
        // Open image in viewer
        setImageViewer({ url, title: resource.title })
      } else if (fileType === 'audio') {
        // Audio will be played inline, no need to open
        return
      } else {
        // Open in new tab
        window.open(url, '_blank')
      }
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

  const handleSendToTelegram = (resourceId: number) => {
    window.open(`https://t.me/chenaniah_resource_bot?start=resource_${resourceId}`, '_blank')
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
    
    const fileType = getFileType(fileName)
    if (fileType === 'image') return <ImageIcon className="h-6 w-6 text-purple-500" />
    if (fileType === 'pdf') return <FileText className="h-6 w-6 text-rose-500" />
    if (fileType === 'audio') return <Music className="h-6 w-6 text-green-500" />
    return <File className="h-6 w-6 text-gray-400" />
  }

  // Group resources by batchId
  const groupResources = (resources: Resource[]) => {
    const grouped: { [key: string]: Resource[] } = {}
    const ungrouped: Resource[] = []

    resources.forEach(resource => {
      if (resource.batchId) {
        if (!grouped[resource.batchId]) {
          grouped[resource.batchId] = []
        }
        grouped[resource.batchId].push(resource)
      } else {
        ungrouped.push(resource)
      }
    })

    return { grouped, ungrouped }
  }

  const renderResourceCard = (resource: Resource, standalone: boolean = true) => {
    const fileType = resource.type === 'file' ? getFileType(resource.fileName) : null
    
    // If not standalone (inside a batch), use a simpler div wrapper instead of Card
    if (!standalone) {
      return (
        <div 
          key={resource.id} 
          className="group border border-gray-200 rounded-lg p-4 bg-white hover:border-[#1f2d3d] transition-all duration-300 hover:shadow-sm"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {getFileIcon(resource.fileName, resource.type)}
            </div>
            {resource.type === 'file' && resource.fileSize && (
              <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                {formatFileSize(resource.fileSize)}
              </span>
            )}
          </div>
          
          <div className="mb-3">
            <h3 className="font-semibold text-sm text-[#1f2d3d] truncate mb-1" title={resource.title}>
              {resource.title}
            </h3>
            {resource.description && (
              <p className="text-xs text-gray-500 line-clamp-2">
                {resource.description}
              </p>
            )}
            {resource.category && resource.category !== 'General' && (
              <span className="inline-block mt-1 text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {resource.category}
              </span>
            )}
          </div>

          {/* Audio player */}
          {fileType === 'audio' && resource.type === 'file' && (
            <div className="mb-3">
              <audio 
                controls 
                className="w-full h-9"
                src={getFileUrl(resource) || undefined}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Image preview */}
          {fileType === 'image' && resource.type === 'file' && (
            <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 cursor-pointer" onClick={() => handleOpen(resource)}>
              <img
                src={getFileUrl(resource) || ''}
                alt={resource.title}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          <div className="flex gap-2">
            {resource.type === 'file' && (
              <>
                {fileType !== 'audio' && fileType !== 'image' && (
                  <Button
                    onClick={() => handleOpen(resource)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-200 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d] transition-all duration-200 text-gray-600 text-xs"
                  >
                    {fileType === 'pdf' ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open
                      </>
                    )}
                  </Button>
                )}
                {(fileType === 'audio' || fileType === 'image') && (
                  <Button
                    onClick={() => handleOpen(resource)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-200 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d] transition-all duration-200 text-gray-600 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {fileType === 'image' ? 'View Full' : 'Open'}
                  </Button>
                )}
                <Button
                  onClick={() => handleDownload(resource)}
                  variant="outline"
                  size="sm"
                  className="border-gray-200 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d] transition-all duration-200 text-gray-600"
                  title="Download"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  onClick={() => handleSendToTelegram(resource.id)}
                  variant="outline"
                  size="sm"
                  className="w-auto px-3 border-gray-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200 text-gray-600 text-xs"
                  title="Send to Telegram"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Telegram
                </Button>
              </>
            )}
            {resource.type === 'link' && (
              <>
                <Button
                  onClick={() => handleOpen(resource)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-200 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d] transition-all duration-200 text-gray-600 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open Link
                </Button>
                <Button
                  onClick={() => handleSendToTelegram(resource.id)}
                  variant="outline"
                  size="sm"
                  className="w-auto px-3 border-gray-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200 text-gray-600 text-xs"
                  title="Send to Telegram"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Telegram
                </Button>
              </>
            )}
          </div>
        </div>
      )
    }
    
    // Standalone card (original implementation)
    return (
      <Card 
        key={resource.id} 
        className="group border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-white"
      >
      <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {getFileIcon(resource.fileName, resource.type)}
            </div>
            {resource.type === 'file' && resource.fileSize && (
              <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                {formatFileSize(resource.fileSize)}
              </span>
            )}
          </div>
          
          <div className="mb-3">
            <h3 className="font-semibold text-[#1f2d3d] truncate mb-1" title={resource.title}>
              {resource.title}
            </h3>
            {resource.description && (
              <p className="text-sm text-gray-500 line-clamp-2 h-10">
                {resource.description}
              </p>
            )}
            {resource.category && resource.category !== 'General' && (
              <span className="inline-block mt-1 text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {resource.category}
              </span>
            )}
          </div>

          {/* Audio player */}
          {fileType === 'audio' && resource.type === 'file' && (
            <div className="mb-3">
              <audio 
                controls 
                className="w-full h-10"
                src={getFileUrl(resource) || undefined}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Image preview */}
          {fileType === 'image' && resource.type === 'file' && (
            <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 cursor-pointer" onClick={() => handleOpen(resource)}>
              <img
                src={getFileUrl(resource) || ''}
                alt={resource.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          <div className="flex gap-2">
            {resource.type === 'file' && (
              <>
                {fileType !== 'audio' && fileType !== 'image' && (
                  <Button
                    onClick={() => handleOpen(resource)}
                    variant="outline"
                    className="flex-1 border-gray-200 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d] transition-all duration-200 text-gray-600"
                  >
                    {fileType === 'pdf' ? (
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
                )}
                {(fileType === 'audio' || fileType === 'image') && (
                  <Button
                    onClick={() => handleOpen(resource)}
                    variant="outline"
                    className="flex-1 border-gray-200 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d] transition-all duration-200 text-gray-600"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {fileType === 'image' ? 'View Full' : 'Open'}
                  </Button>
                )}
                <Button
                  onClick={() => handleDownload(resource)}
                  variant="outline"
                  size="icon"
                  className="border-gray-200 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d] transition-all duration-200 text-gray-600"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleSendToTelegram(resource.id)}
                  variant="outline"
                  size="sm"
                  className="w-auto px-3 border-gray-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200 text-gray-600 text-xs"
                  title="Send to Telegram"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Telegram
                </Button>
              </>
            )}
            {resource.type === 'link' && (
              <>
                <Button
                  onClick={() => handleOpen(resource)}
                  variant="outline"
                  className="flex-1 border-gray-200 hover:bg-[#1f2d3d] hover:text-white hover:border-[#1f2d3d] transition-all duration-200 text-gray-600"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Link
                </Button>
                <Button
                  onClick={() => handleSendToTelegram(resource.id)}
                  variant="outline"
                  size="sm"
                  className="w-auto px-3 border-gray-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200 text-gray-600 text-xs"
                  title="Send to Telegram"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Telegram
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    )
  }

  const renderResourceGrid = (resourcesToRender: Resource[]) => {
    if (resourcesToRender.length === 0) {
      return (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Folder className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#1f2d3d]">No Resources Found</h3>
            <p className="text-gray-500 max-w-sm mt-1">
              There are no resources in this category yet.
            </p>
          </CardContent>
        </Card>
      )
    }

    const { grouped, ungrouped } = groupResources(resourcesToRender)
    const allGroups = [
      ...Object.entries(grouped).map(([batchId, batchResources]) => ({
        type: 'batch' as const,
        batchId,
        resources: batchResources,
      })),
      ...ungrouped.map(resource => ({
        type: 'single' as const,
        resource,
      })),
    ].sort((a, b) => {
      const aDate = a.type === 'batch' ? a.resources[0].createdAt : a.resource.createdAt
      const bDate = b.type === 'batch' ? b.resources[0].createdAt : b.resource.createdAt
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })

    return (
      <Accordion type="single" collapsible className="w-full space-y-2">
        {allGroups.map((item) => {
          if (item.type === 'batch') {
            // Extract batch title and description
            const firstResource = item.resources[0]
            const commonDescription = item.resources.every(r => r.description === firstResource.description && r.description) 
              ? firstResource.description 
              : undefined
            
            // Try to extract a base title
            let batchTitle: string | undefined
            const titles = item.resources.map(r => r.title)
            let titlePrefix: string | undefined
            
            if (titles.length > 0) {
              const firstTitleMatch = titles[0].match(/^(.+?)\s*-\s*(.+)$/)
              if (firstTitleMatch) {
                const prefix = firstTitleMatch[1]
                if (titles.every(title => title.startsWith(prefix + ' - ') || title === prefix)) {
                  batchTitle = prefix
                  titlePrefix = prefix
                }
              }
            }
            
            const displayResources = titlePrefix 
              ? item.resources.map(r => ({
                  ...r,
                  title: r.title.startsWith(titlePrefix + ' - ') 
                    ? r.title.replace(titlePrefix + ' - ', '')
                    : r.title
                }))
              : item.resources
            
            return (
              <AccordionItem key={item.batchId} value={`batch-${item.batchId}`} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-[#e8cb85]/10 flex items-center justify-center shrink-0">
                      <Folder className="h-4 w-4 text-[#e8cb85]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1f2d3d] text-sm">
                        {batchTitle || `Batch Upload (${item.resources.length} files)`}
                      </h3>
                      <p className="text-xs text-gray-400 font-normal mt-0.5">
                        {new Date(item.resources[0].createdAt).toLocaleDateString()} • {item.resources.length} items
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2 bg-gray-50/30 border-t border-gray-100">
                  {commonDescription && (
                    <p className="text-sm text-gray-600 mb-4 italic border-l-2 border-[#e8cb85] pl-3 py-1">
                      {commonDescription}
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {displayResources.map((resource) => renderResourceCard(resource, false))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          } else {
            const resource = item.resource
            return (
              <AccordionItem key={resource.id} value={`resource-${resource.id}`} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
                  <div className="flex items-center gap-3 text-left overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      {getFileIcon(resource.fileName, resource.type)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#1f2d3d] text-sm truncate pr-4">
                        {resource.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-normal mt-0.5">
                        <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                        {resource.fileSize && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(resource.fileSize)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2 bg-gray-50/30 border-t border-gray-100">
                  <div className="max-w-3xl">
                    {resource.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {resource.description}
                      </p>
                    )}
                    
                    {/* Audio Player Inline */}
                    {getFileType(resource.fileName) === 'audio' && (
                      <div className="mb-4 bg-white p-2 rounded-lg border border-gray-200">
                        <audio 
                          controls 
                          className="w-full h-8"
                          src={getFileUrl(resource) || undefined}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}

                    {/* Image Preview Inline */}
                    {getFileType(resource.fileName) === 'image' && (
                      <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 max-w-sm">
                        <img
                          src={getFileUrl(resource) || ''}
                          alt={resource.title}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                       {/* Action Buttons */}
                       <Button
                        onClick={() => handleOpen(resource)}
                        variant="default"
                        size="sm"
                        className="bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 h-8 text-xs"
                      >
                        {getFileType(resource.fileName) === 'pdf' ? (
                          <>
                            <Eye className="h-3 w-3 mr-1.5" /> View
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-3 w-3 mr-1.5" /> Open
                          </>
                        )}
                      </Button>
                      
                      {resource.type === 'file' && (
                        <Button
                          onClick={() => handleDownload(resource)}
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                        >
                          <Download className="h-3 w-3 mr-1.5" /> Download
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => handleSendToTelegram(resource.id)}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      >
                        <Send className="h-3 w-3 mr-1.5" /> Telegram
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          }
        })}
      </Accordion>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#e8cb85]" />
      </div>
    )
  }

  // Get unique categories
  const categories = Array.from(new Set(resources.map(r => r.category || 'General')))
  // Ensure 'General' is first if it exists, or add it if we want a default tab
  if (categories.includes('General')) {
    categories.sort((a, b) => a === 'General' ? -1 : b === 'General' ? 1 : a.localeCompare(b))
  } else if (categories.length > 0) {
    categories.sort()
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
        <Tabs defaultValue="All" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto p-1 bg-gray-100/50 rounded-xl mb-6">
            <TabsTrigger value="All" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1f2d3d] data-[state=active]:shadow-sm">All</TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1f2d3d] data-[state=active]:shadow-sm">{cat}</TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="All" className="mt-0">
            {renderResourceGrid(resources)}
          </TabsContent>
          
          {categories.map(cat => (
            <TabsContent key={cat} value={cat} className="mt-0">
              {renderResourceGrid(resources.filter(r => (r.category || 'General') === cat))}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {pdfViewer && (
        <PDFViewer
          url={pdfViewer.url}
          title={pdfViewer.title}
          open={!!pdfViewer}
          onOpenChange={(open) => !open && setPdfViewer(null)}
        />
      )}

      {imageViewer && (
        <Dialog open={!!imageViewer} onOpenChange={(open) => !open && setImageViewer(null)}>
          <DialogContent className="max-w-5xl w-[95vw] h-[95vh] p-0 gap-0">
            <div className="relative w-full h-full flex items-center justify-center bg-black/90 p-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
                onClick={() => setImageViewer(null)}
              >
                <X className="h-6 w-6" />
              </Button>
              <img
                src={imageViewer.url}
                alt={imageViewer.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

