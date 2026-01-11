"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Users, FileText, Bell, ExternalLink, Download, AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { toast } from "sonner"

const API_BASE_URL = getApiBaseUrl()

interface Section {
  id: number
  name: string
  code: string
  color: string
  leader?: {
    id: number
    username: string
    fullNameEnglish?: string
    fullNameAmharic?: string
  }
  _count?: {
    students: number
  }
}

interface Resource {
  id: number
  title: string
  description?: string
  type: 'file' | 'link'
  fileUrl?: string
  fileName?: string
  url?: string
  createdAt: string
}

interface Notice {
  id: number
  title: string
  content: string
  type: string
  createdAt: string
}

export default function StudentSectionPage() {
  const [section, setSection] = useState<Section | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSection()
  }, [])

  const getToken = () => localStorage.getItem('student_token') || sessionStorage.getItem('student_token')

  const loadSection = async () => {
    try {
      // First get student's section from their profile
      const profileRes = await fetch(`${API_BASE_URL}/student/me`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
      const profileData = await profileRes.json()
      
      if (!profileData.success || !profileData.user?.sectionId) {
        setError("You haven't selected a section yet. Please complete your profile first.")
        setIsLoading(false)
        return
      }

      const sectionId = profileData.user.sectionId

      // Get section details
      const sectionsRes = await fetch(`${API_BASE_URL}/sections`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
      const sectionsData = await sectionsRes.json()
      
      if (sectionsData.success) {
        const found = sectionsData.sections.find((s: Section) => s.id === sectionId)
        setSection(found || null)
      }

      // Load resources
      const resourcesRes = await fetch(`${API_BASE_URL}/resources`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
      const resourcesData = await resourcesRes.json()
      if (resourcesData.success) {
        // Filter for section-specific resources
        const sectionResources = resourcesData.resources.filter((r: any) => r.sectionId === sectionId)
        setResources(sectionResources)
      }

      // Load notices
      const noticesRes = await fetch(`${API_BASE_URL}/notices?sectionId=${sectionId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
      const noticesData = await noticesRes.json()
      if (noticesData.success) {
        setNotices(noticesData.notices || [])
      }

    } catch (err) {
      console.error("Error loading section:", err)
      setError("Failed to load section data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = (resource: Resource) => {
    if (resource.fileUrl) {
      const url = resource.fileUrl.startsWith('http') 
        ? resource.fileUrl 
        : `${API_BASE_URL}${resource.fileUrl}`
      window.open(url, '_blank')
    } else if (resource.url) {
      window.open(resource.url, '_blank')
    }
  }

  const getNoticeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case 'urgent': return <AlertCircle className="h-5 w-5 text-rose-500" />
      default: return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getNoticeBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-100'
      case 'warning': return 'bg-amber-50 border-amber-100'
      case 'urgent': return 'bg-rose-50 border-rose-100'
      default: return 'bg-blue-50 border-blue-100'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !section) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#1f2d3d]">No Section Selected</h3>
            <p className="text-gray-500 max-w-sm mt-1">
              {error || "Please select your choir section from your profile to access section-specific resources and announcements."}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="overflow-hidden">
        <div 
          className="h-3 w-full" 
          style={{ backgroundColor: section.color }}
        />
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                style={{ backgroundColor: section.color }}
              >
                {section.code.toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-[#1f2d3d]">{section.name}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  {section._count?.students || 0} choir members
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://t.me/chenaniah_resource_bot', '_blank')}
              className="hidden md:flex"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Telegram Bot
            </Button>
          </div>
        </CardHeader>

        {/* Section Leader */}
        {section.leader && (
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#1f2d3d] text-white flex items-center justify-center font-bold">
                {section.leader.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Section Leader</p>
                <p className="font-semibold text-[#1f2d3d]">
                  {section.leader.fullNameEnglish || section.leader.fullNameAmharic || section.leader.username}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Notices */}
      {notices.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1f2d3d] flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Announcements
          </h2>
          <div className="space-y-3">
            {notices.map((notice) => (
              <Card key={notice.id} className={`${getNoticeBgColor(notice.type)} border`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getNoticeIcon(notice.type)}
                    <div>
                      <h3 className="font-semibold text-[#1f2d3d]">{notice.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Resources */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f2d3d] flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Section Resources
        </h2>
        
        {resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource) => (
              <Card key={resource.id} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-[#1f2d3d]">{resource.title}</h3>
                        {resource.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{resource.description}</p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(resource.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(resource)}
                      className="shrink-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No section-specific resources yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Telegram Access */}
      <Card className="bg-gradient-to-br from-[#1f2d3d] to-[#2d4a5e] text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Access on Telegram</h3>
              <p className="text-white/70 text-sm mt-1">
                Get your section's resources directly on Telegram for easy offline access
              </p>
            </div>
            <Button 
              className="bg-[#e8cb85] hover:bg-[#d4b770] text-[#1f2d3d] font-bold"
              onClick={() => window.open('https://t.me/chenaniah_resource_bot', '_blank')}
            >
              Open Bot
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
