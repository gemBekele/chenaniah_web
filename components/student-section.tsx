"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Users, Bell, ExternalLink, CheckCircle2, AlertCircle, AlertTriangle, Info, FileText } from "lucide-react"
import { toast } from "sonner"
import { getApiBaseUrl } from "@/lib/utils"
import StudentResources, { Resource } from "@/components/student-resources"
import { Label } from "@/components/ui/label"

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

interface Notice {
  id: number
  title: string
  content: string
  type: string
  createdAt: string
}

interface StudentSectionProps {
  user: any
  onSectionUpdate: () => void
}

export default function StudentSection({ user, onSectionUpdate }: StudentSectionProps) {
  const [section, setSection] = useState<Section | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Selection state
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null)
  const [isUpdatingSection, setIsUpdatingSection] = useState(false)

  useEffect(() => {
    if (user.sectionId) {
      loadSectionData()
    } else {
      loadAllSections()
    }
  }, [user.sectionId])

  const getToken = () => localStorage.getItem('student_token') || sessionStorage.getItem('student_token')

  const loadAllSections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sections`)
      const data = await response.json()
      if (data.success) {
        setSections(data.sections || [])
      }
    } catch (err) {
      console.error("Error loading sections:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSectionData = async () => {
    setIsLoading(true)
    try {
      const sectionId = user.sectionId

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
      console.error("Error loading section data:", err)
      toast.error("Failed to load section data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSectionSelect = async (sectionId: number) => {
    const token = getToken()
    if (!token) return

    setIsUpdatingSection(true)
    try {
      const response = await fetch(`${API_BASE_URL}/student/select-section`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sectionId }),
      })

      const data = await response.json()
      if (data.success) {
        setSelectedSectionId(sectionId)
        toast.success('Section selected successfully')
        onSectionUpdate() // This should trigger a re-fetch of user profile in parent
      } else {
        toast.error(data.error || 'Failed to select section')
      }
    } catch (err) {
      console.error('Section selection error:', err)
      toast.error('Failed to select section')
    } finally {
      setIsUpdatingSection(false)
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
        <Loader2 className="h-8 w-8 animate-spin text-[#e8cb85]" />
      </div>
    )
  }

  // If no section selected, show selection UI
  if (!user.sectionId) {
    return (
      <div className="space-y-6">
        <Card className="border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-[#1f2d3d] text-white p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Users className="h-6 w-6 text-[#e8cb85]" />
              </div>
              <CardTitle className="text-xl font-bold">
                Select Your Section
              </CardTitle>
            </div>
            <CardDescription className="text-white/70 text-base">
              Please select your choir section to access section-specific resources and announcements.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-[#1f2d3d]">
                Available Sections
              </Label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={selectedSectionId === section.id ? "default" : "outline"}
                    className={`
                      h-auto py-4 px-4 flex flex-col items-center gap-2 rounded-xl transition-all relative overflow-hidden
                      ${selectedSectionId === section.id 
                        ? "text-white shadow-lg scale-[1.02]" 
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md text-gray-600 bg-white"
                      }
                    `}
                    style={selectedSectionId === section.id ? { backgroundColor: section.color } : {}}
                    onClick={() => handleSectionSelect(section.id)}
                    disabled={isUpdatingSection}
                  >
                    {selectedSectionId !== section.id && (
                      <div 
                        className="absolute top-0 left-0 right-0 h-1" 
                        style={{ backgroundColor: section.color }}
                      />
                    )}
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        selectedSectionId === section.id 
                          ? "bg-white/20 text-white" 
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {section.code.toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold">{section.name}</span>
                    {selectedSectionId === section.id && (
                      <CheckCircle2 className="h-4 w-4 absolute top-2 right-2" />
                    )}
                  </Button>
                ))}
              </div>
              {sections.length === 0 && (
                <p className="text-sm text-gray-400 italic">No sections available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!section) return null

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="overflow-hidden border-gray-100 shadow-sm">
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

          </div>
        </CardHeader>

        {/* Section Leader */}
        {section.leader && (
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-[#1f2d3d] text-white flex items-center justify-center font-bold">
                {section.leader.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Section Leader</p>
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
              <Card key={notice.id} className={`${getNoticeBgColor(notice.type)} border shadow-sm`}>
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
        
        {/* Reuse StudentResources component but pass filtered resources */}
        <StudentResources 
          user={user} 
          resources={resources} 
          hideTelegramBanner={true} // We already have a telegram button in header
        />
      </div>
    </div>
  )
}
