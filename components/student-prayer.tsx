"use client"

import { useEffect, useState } from "react"
import { Clock, Check, Calendar, ChevronLeft, ChevronRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getApiBaseUrl } from "@/lib/utils"

const API_BASE_URL = getApiBaseUrl()

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface PrayerSlot {
  id: number
  dayOfWeek: number
  startTime: string
  claimedById: number | null
  claimedAt: string | null
  claimedBy?: {
    id: number
    fullNameEnglish?: string
    fullNameAmharic?: string
    photoPath?: string
  }
}

interface MySlot {
  id: number
  dayOfWeek: number
  startTime: string
}

export default function StudentPrayer() {
  const [slots, setSlots] = useState<PrayerSlot[]>([])
  const [slotsByDay, setSlotsByDay] = useState<Record<number, PrayerSlot[]>>({})
  const [mySlot, setMySlot] = useState<MySlot | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const [claiming, setClaiming] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    // Get user ID from token
    const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUserId(payload.userId)
      } catch (e) {
        console.error('Failed to parse token')
      }
    }
    
    fetchSlots()
    fetchMySlot()
  }, [])

  const fetchSlots = async () => {
    try {
      const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/prayer/slots`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setSlots(data.slots || [])
        setSlotsByDay(data.slotsByDay || {})
      }
    } catch (error) {
      console.error("Failed to fetch prayer slots", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMySlot = async () => {
    try {
      const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/prayer/my-slot`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setMySlot(data.slot)
      }
    } catch (error) {
      console.error("Failed to fetch my prayer slot", error)
    }
  }

  const handleClaimSlot = async (slot: PrayerSlot) => {
    if (mySlot) {
      toast.error('You already have a prayer slot. Please release it first.')
      return
    }

    if (slot.claimedById) {
      toast.error('This slot is already claimed')
      return
    }

    setClaiming(true)
    try {
      const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/prayer/slots/${slot.id}/claim`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || 'Slot claimed successfully!')
        fetchSlots()
        fetchMySlot()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to claim slot')
      }
    } catch (error) {
      toast.error('Failed to claim slot')
    } finally {
      setClaiming(false)
    }
  }

  const handleReleaseSlot = async () => {
    if (!mySlot) return

    if (!confirm('Are you sure you want to release your prayer slot?')) return

    try {
      const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/prayer/slots/${mySlot.id}/claim`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        toast.success('Prayer slot released')
        fetchSlots()
        setMySlot(null)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to release slot')
      }
    } catch (error) {
      toast.error('Failed to release slot')
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const getEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const endMinutes = minutes + 15
    const endHours = hours + Math.floor(endMinutes / 60)
    const finalMinutes = endMinutes % 60
    return `${(endHours % 24).toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`
  }

  const currentDaySlots = slotsByDay[selectedDay] || []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f2d3d]"></div>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Prayer slots have not been set up yet</p>
        <p className="text-sm mt-2">Please check back later</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#1f2d3d] flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#e8cb85]" />
          Chain Prayer
        </h3>
      </div>

      {/* My Current Slot */}
      {mySlot && (
        <div className="bg-gradient-to-r from-[#1f2d3d] to-[#2a3f54] text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-75">Your Prayer Time</p>
              <p className="text-xl font-bold">
                {DAY_NAMES[mySlot.dayOfWeek]} at {formatTime(mySlot.startTime)}
              </p>
              <p className="text-sm opacity-75">
                {formatTime(mySlot.startTime)} - {formatTime(getEndTime(mySlot.startTime))}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReleaseSlot}
              className="text-white border-white/50 hover:bg-white/10 hover:text-white"
            >
              Release
            </Button>
          </div>
        </div>
      )}

      {/* Day Selector */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-2">
        <button
          onClick={() => setSelectedDay((selectedDay - 1 + 7) % 7)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="flex gap-1">
          {DAY_NAMES.map((day, index) => (
            <button
              key={day}
              onClick={() => setSelectedDay(index)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDay === index
                  ? 'bg-[#1f2d3d] text-white'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{SHORT_DAY_NAMES[index]}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setSelectedDay((selectedDay + 1) % 7)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Time Slots Grid */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-gray-600">Claimed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#e8cb85]" />
            <span className="text-gray-600">Your Slot</span>
          </div>
        </div>

        {currentDaySlots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No slots available on {DAY_NAMES[selectedDay]}</p>
            <p className="text-sm">(Excluded period)</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {currentDaySlots.map((slot) => {
              const isMySlot = mySlot?.id === slot.id
              const isClaimed = !!slot.claimedById
              const isAvailable = !isClaimed

              return (
                <button
                  key={slot.id}
                  onClick={() => {
                    if (isAvailable && !mySlot) {
                      handleClaimSlot(slot)
                    } else if (isMySlot) {
                      handleReleaseSlot()
                    }
                  }}
                  disabled={claiming || (isClaimed && !isMySlot) || Boolean(mySlot && !isMySlot)}
                  className={`
                    p-2 rounded-lg text-xs font-medium transition-all
                    ${isMySlot 
                      ? 'bg-[#e8cb85] text-[#1f2d3d] ring-2 ring-[#1f2d3d]' 
                      : isAvailable 
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                    ${claiming ? 'opacity-50' : ''}
                  `}
                  title={
                    isMySlot 
                      ? 'Your slot - click to release' 
                      : isClaimed 
                        ? `Claimed by ${slot.claimedBy?.fullNameEnglish || slot.claimedBy?.fullNameAmharic || 'someone'}` 
                        : 'Click to claim'
                  }
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{formatTime(slot.startTime)}</span>
                    {isMySlot && <Check className="h-3 w-3" />}
                    {isClaimed && !isMySlot && <User className="h-3 w-3" />}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
        <p className="font-medium text-[#1f2d3d] mb-2">How it works:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Each prayer slot is 15 minutes long</li>
          <li>You can claim one slot per week</li>
          <li>Pray during your claimed time each week</li>
          <li>Wednesday 5-7 PM and Sunday 3-6 PM are excluded (service times)</li>
        </ul>
      </div>
    </div>
  )
}
