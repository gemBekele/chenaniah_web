"use client"

import { useEffect, useState } from "react"
import { Bell, Calendar, AlertCircle, Info, CheckCircle2, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { getApiBaseUrl } from "@/lib/utils"

const API_BASE_URL = getApiBaseUrl()

interface Notice {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'urgent'
  active: boolean
  createdAt: string
  updatedAt: string
  isPersonal?: boolean
  targetStudentId?: number | null
}

export default function StudentNoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
        
        // If we have a token, try to get personal notices too
        if (token) {
          try {
            // Parse the token to get user ID
            const payload = JSON.parse(atob(token.split('.')[1]))
            const userId = payload.userId
            
            const response = await fetch(`${API_BASE_URL}/notices/student/${userId}`, {
              headers: { 'Authorization': `Bearer ${token}` },
            })
            
            if (response.ok) {
              const data = await response.json()
              setNotices(data.notices || [])
              setLoading(false)
              return
            }
          } catch (e) {
            console.error("Failed to fetch personal notices, falling back to public", e)
          }
        }
        
        // Fallback to public notices only
        const response = await fetch(`${API_BASE_URL}/notices`)
        if (response.ok) {
          const data = await response.json()
          setNotices(data.notices || [])
        }
      } catch (error) {
        console.error("Failed to fetch notices", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotices()
  }, [])

  if (notices.length === 0) return null

  const displayedNotices = expanded ? notices : notices.slice(0, 2)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      default: return <Info className="h-5 w-5 text-[#1f2d3d]" />
    }
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-50 border-red-100'
      case 'warning': return 'bg-yellow-50 border-yellow-100'
      case 'success': return 'bg-green-50 border-green-100'
      default: return 'bg-blue-50 border-blue-100'
    }
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-[#1f2d3d] flex items-center gap-2">
          <Bell className="h-5 w-5 text-[#e8cb85]" />
          Notice Board
          {notices.length > 0 && (
            <span className="bg-[#e8cb85] text-[#1f2d3d] text-xs font-bold px-2 py-0.5 rounded-full">
              {notices.length}
            </span>
          )}
        </h3>
        {notices.length > 2 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-500 hover:text-[#1f2d3d] hover:bg-gray-100"
          >
            {expanded ? "Show Less" : "View All"}
          </Button>
        )}
      </div>

      <div className="grid gap-3">
        {displayedNotices.map((notice) => (
          <div 
            key={notice.id} 
            className={`
              relative p-4 rounded-xl border transition-all duration-200 hover:shadow-md bg-white
              ${notice.type === 'urgent' ? 'border-l-4 border-l-red-500 border-gray-100' : 
                notice.type === 'warning' ? 'border-l-4 border-l-amber-500 border-gray-100' : 
                notice.type === 'success' ? 'border-l-4 border-l-emerald-500 border-gray-100' : 
                'border-l-4 border-l-[#1f2d3d] border-gray-100'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div className={`
                p-2 rounded-full shrink-0
                ${notice.type === 'urgent' ? 'bg-red-50 text-red-500' : 
                  notice.type === 'warning' ? 'bg-amber-50 text-amber-500' : 
                  notice.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 
                  'bg-gray-50 text-[#1f2d3d]'
                }
              `}>
                {getTypeIcon(notice.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#1f2d3d] text-base">{notice.title}</h4>
                    {notice.isPersonal && (
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        Personal
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(notice.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {notice.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
