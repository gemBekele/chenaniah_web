"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Clock, Loader2, ArrowLeft, RefreshCw, User, Check, X, ChevronLeft, ChevronRight
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getApiBaseUrl } from "@/lib/utils"
import { AdminLayout } from "@/components/admin-layout"

const API_BASE_URL = getApiBaseUrl()

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface PrayerStats {
  totalSlots: number
  claimedSlots: number
  availableSlots: number
  claimPercentage: number
}

interface ClaimedSlot {
  id: number
  dayOfWeek: number
  startTime: string
  claimedAt: string
  claimedBy: {
    id: number
    fullNameEnglish?: string
    fullNameAmharic?: string
    phone: string
  }
}

export default function AdminPrayerPage() {
  const [stats, setStats] = useState<PrayerStats | null>(null)
  const [claims, setClaims] = useState<ClaimedSlot[]>([])
  const [claimsByDay, setClaimsByDay] = useState<Record<number, ClaimedSlot[]>>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchOverview()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  const fetchOverview = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prayer/admin/overview`, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setClaims(data.claims || [])
        setClaimsByDay(data.claimsByDay || {})
      }
    } catch (error) {
      console.error("Failed to fetch prayer overview", error)
      toast.error("Failed to load prayer data")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSlots = async (reset: boolean = false) => {
    if (reset && !confirm("This will delete all existing slots and claimed times. Are you sure?")) return

    setGenerating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/prayer/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reset }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || "Slots generated successfully")
        fetchOverview()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to generate slots")
      }
    } catch (error) {
      toast.error("Failed to generate slots")
    } finally {
      setGenerating(false)
    }
  }

  const handleReleaseSlot = async (slotId: number) => {
    if (!confirm("Release this prayer slot?")) return

    try {
      const response = await fetch(`${API_BASE_URL}/prayer/slots/${slotId}/claim`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        toast.success("Slot released")
        fetchOverview()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to release slot")
      }
    } catch (error) {
      toast.error("Failed to release slot")
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1f2d3d]" />
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f8f9fa] p-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-[#1f2d3d]">Chain Prayer Management</h1>
                <p className="text-gray-500">View and manage prayer time slots</p>
              </div>
            </div>
            <div className="flex gap-2">
              {stats && stats.totalSlots === 0 ? (
                <Button 
                  onClick={() => handleGenerateSlots(false)}
                  disabled={generating}
                  className="bg-[#1f2d3d] hover:bg-[#2a3f54] text-white"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Clock className="h-4 w-4 mr-2" />
                  )}
                  Generate Slots
                </Button>
              ) : (
                <Button 
                  onClick={() => handleGenerateSlots(true)}
                  disabled={generating}
                  variant="outline"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Regenerate
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500 mb-1">Total Slots</p>
                <p className="text-3xl font-bold text-[#1f2d3d]">{stats.totalSlots}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500 mb-1">Claimed</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.claimedSlots}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500 mb-1">Available</p>
                <p className="text-3xl font-bold text-amber-600">{stats.availableSlots}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500 mb-1">Claim Rate</p>
                <p className="text-3xl font-bold text-[#1f2d3d]">{stats.claimPercentage}%</p>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-emerald-500 transition-all" 
                    style={{ width: `${stats.claimPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Day Selector */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <Button
              variant={selectedDay === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDay(null)}
              className={selectedDay === null ? 'bg-[#1f2d3d] text-white' : ''}
            >
              All Days
            </Button>
            {DAY_NAMES.map((day, index) => {
              const dayClaimCount = (claimsByDay[index] || []).length
              return (
                <Button
                  key={day}
                  variant={selectedDay === index ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDay(index)}
                  className={selectedDay === index ? 'bg-[#1f2d3d] text-white' : ''}
                >
                  {day}
                  {dayClaimCount > 0 && (
                    <span className="ml-1 bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded-full">
                      {dayClaimCount}
                    </span>
                  )}
                </Button>
              )
            })}
          </div>

          {/* Claims List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-[#1f2d3d]">
                Claimed Slots {selectedDay !== null ? `- ${DAY_NAMES[selectedDay]}` : ''}
              </h2>
            </div>
            
            {claims.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500">No slots have been claimed yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Day</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Claimed By</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Claimed At</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {claims
                      .filter(claim => selectedDay === null || claim.dayOfWeek === selectedDay)
                      .map((claim) => (
                        <tr key={claim.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-[#1f2d3d]">
                            {DAY_NAMES[claim.dayOfWeek]}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatTime(claim.startTime)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {claim.claimedBy.fullNameEnglish || claim.claimedBy.fullNameAmharic || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {claim.claimedBy.phone}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {format(new Date(claim.claimedAt), 'MMM d, h:mm a')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReleaseSlot(claim.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Excluded Times Note */}
          <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              <strong>Excluded Times:</strong> Wednesday 5:00 PM - 7:00 PM and Sunday 3:00 PM - 6:00 PM are excluded from prayer slots (service times).
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
