"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  User,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { getApiBaseUrl } from "@/lib/utils"
const API_BASE_URL = getApiBaseUrl()

// Debug: Log the API URL being used
console.log('API_BASE_URL:', API_BASE_URL)

interface TimeSlot {
  id: number
  time: string
  label: string
  available: boolean
  date: string
}

interface InterviewAppointment {
  id: number
  applicant_name: string
  applicant_email: string
  applicant_phone: string
  scheduled_date: string
  scheduled_time: string
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  notes?: string
  created_at: string
}

interface ScheduleStats {
  total_appointments: number
  scheduled: number
  completed: number
  cancelled: number
  no_show: number
}

export default function AdminSchedulePage() {
  const [scheduleStats, setScheduleStats] = useState<ScheduleStats>({ 
    total_appointments: 0, 
    scheduled: 0, 
    completed: 0, 
    cancelled: 0, 
    no_show: 0 
  })
  const [appointments, setAppointments] = useState<InterviewAppointment[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("")
  const router = useRouter()
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [updatingSlots, setUpdatingSlots] = useState<Set<string>>(new Set())
  const [showBulkCreator, setShowBulkCreator] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkConfig, setBulkConfig] = useState({
    interval_minutes: "30",
    morning_start: "09:00",
    morning_end: "12:00",
    afternoon_start: "13:00",
    afternoon_end: "17:00",
  })

  const getToken = () => {
    let token = localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token")
    if (!token) {
      const compressedToken = localStorage.getItem("admin_token_compressed")
      const header = localStorage.getItem("admin_token_header")
      if (compressedToken && header) {
        token = `${header}.${compressedToken}`
      }
    }
    console.log('Token found:', !!token)
    return token
  }

  // Generate 30-minute time slots from 9:00 AM to 5:00 PM
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const timeObj = new Date()
        timeObj.setHours(hour, minute, 0, 0)
        const label = timeObj.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
        slots.push({
          time: timeString,
          label: label,
          available: false
        })
      }
    }
    return slots
  }

  const defaultTimeSlots = generateTimeSlots()

  const fetchScheduleStats = async () => {
    try {
      console.log('Fetching schedule stats...')
      const response = await fetch(`${API_BASE_URL}/schedule/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      console.log('Schedule stats response:', response.status)
      const data = await response.json()
      console.log('Schedule stats data:', data)
      if (data.success) {
        setScheduleStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching schedule stats:", error)
    }
  }

  const fetchAppointments = async () => {
    setIsLoadingSchedule(true)
    try {
      const response = await fetch(`${API_BASE_URL}/schedule/appointments`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setIsLoadingSchedule(false)
    }
  }

  const fetchTimeSlots = async (date?: string) => {
    try {
      console.log('Fetching time slots for date:', date)
      const url = date 
        ? `${API_BASE_URL}/schedule/time-slots?date=${date}`
        : `${API_BASE_URL}/schedule/time-slots`
      console.log('Time slots URL:', url)
      console.log('API_BASE_URL in fetchTimeSlots:', API_BASE_URL)
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      console.log('Time slots response:', response.status)
      const data = await response.json()
      console.log('Time slots data:', data)
      if (data.success) {
        setTimeSlots(data.timeSlots)
      }
    } catch (error) {
      console.error("Error fetching time slots:", error)
    }
  }

  const updateTimeSlotAvailability = async (time: string, available: boolean) => {
    if (!selectedDate) return
    
    // Add loading state
    setUpdatingSlots(prev => new Set(prev).add(time))
    
    try {
      console.log(`Updating slot ${time} to ${available ? 'available' : 'unavailable'} for date ${selectedDate}`)
      
      // Check if slot exists
      const existingSlot = timeSlots.find(slot => slot.time === time && slot.date === selectedDate)
      console.log('Existing slot:', existingSlot)
      
      if (existingSlot) {
        // Update existing slot
        const response = await fetch(`${API_BASE_URL}/schedule/time-slots/${existingSlot.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ available }),
        })
        const data = await response.json()
        console.log('Update response:', data)
        
        if (data.success) {
          setTimeSlots(prev => 
            prev.map(slot => 
              slot.id === existingSlot.id ? { ...slot, available } : slot
            )
          )
        } else {
          console.error("Failed to update slot:", data.error)
          alert(`Failed to update slot: ${data.error}`)
        }
      } else if (available) {
        // Create new slot
        const response = await fetch(`${API_BASE_URL}/schedule/time-slots`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ time, date: selectedDate }),
        })
        const data = await response.json()
        console.log('Create response:', data)
        
        if (data.success) {
          // Refresh the time slots to get the updated list
          await fetchTimeSlots(selectedDate)
        } else {
          console.error("Failed to create slot:", data.error)
          alert(`Failed to create slot: ${data.error}`)
        }
      } else {
        // Trying to make unavailable a slot that doesn't exist - just ignore
        console.log('Slot does not exist, ignoring unavailable request')
      }
    } catch (error) {
      console.error("Error updating time slot:", error)
      alert(`Error updating time slot: ${error}`)
    } finally {
      // Remove loading state
      setUpdatingSlots(prev => {
        const newSet = new Set(prev)
        newSet.delete(time)
        return newSet
      })
    }
  }

  const createBulkSlots = async (startTime: string, endTime: string) => {
    if (!selectedDate) {
      alert("Please select a date first")
      return
    }

    setBulkLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/schedule/time-slots/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          start_time: startTime,
          end_time: endTime,
          interval_minutes: parseInt(bulkConfig.interval_minutes),
        }),
      })
      const data = await response.json()
      
      if (data.success) {
        alert(`Success! Created ${data.slots_created} slots, skipped ${data.slots_skipped} existing slots.`)
        await fetchTimeSlots(selectedDate)
      } else {
        alert(`Failed: ${data.error}`)
      }
    } catch (error) {
      console.error("Error creating bulk slots:", error)
      alert(`Error: ${error}`)
    } finally {
      setBulkLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: number, status: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      })
      const data = await response.json()
      if (data.success) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId ? { ...apt, status: status as any } : apt
          )
        )
        fetchScheduleStats()
      }
    } catch (error) {
      console.error("Error updating appointment status:", error)
    }
  }

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/admin")
      return
    }
    fetchScheduleStats()
    fetchAppointments()
    fetchTimeSlots()
    setIsLoading(false)
  }, [router])

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate)
    }
  }, [selectedDate])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>

      <div className="container mx-auto px-6 lg:px-8 py-8">
        {/* Schedule Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6 mb-8">
          <div className="group relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br from-background to-muted/30 p-3 lg:p-6 border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-muted/20">
            <div className="absolute top-0 right-0 w-16 h-16 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1 lg:mb-2">Total Appointments</p>
              <p className="text-2xl lg:text-4xl font-bold text-foreground mb-2 lg:mb-3">{scheduleStats.total_appointments}</p>
              <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-muted/50 group-hover:bg-muted transition-colors">
                <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl lg:rounded-2xl bg-blue-50 p-3 lg:p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="absolute top-0 right-0 w-16 h-16 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1 lg:mb-2">Scheduled</p>
              <p className="text-2xl lg:text-4xl font-bold text-blue-600 dark:text-blue-500 mb-2 lg:mb-3">{scheduleStats.scheduled}</p>
              <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl lg:rounded-2xl bg-emerald-50 p-3 lg:p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
            <div className="absolute top-0 right-0 w-16 h-16 lg:w-32 lg:h-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1 lg:mb-2">Completed</p>
              <p className="text-2xl lg:text-4xl font-bold text-emerald-600 dark:text-emerald-500 mb-2 lg:mb-3">{scheduleStats.completed}</p>
              <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 dark:text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl lg:rounded-2xl bg-amber-50 p-3 lg:p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
            <div className="absolute top-0 right-0 w-16 h-16 lg:w-32 lg:h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1 lg:mb-2">Cancelled</p>
              <p className="text-2xl lg:text-4xl font-bold text-amber-600 dark:text-amber-500 mb-2 lg:mb-3">{scheduleStats.cancelled}</p>
              <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                <XCircle className="h-4 w-4 lg:h-5 lg:w-5 text-amber-600 dark:text-amber-500" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl lg:rounded-2xl bg-rose-50 p-3 lg:p-6 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/10">
            <div className="absolute top-0 right-0 w-16 h-16 lg:w-32 lg:h-32 bg-gradient-to-br from-rose-500/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1 lg:mb-2">No Show</p>
              <p className="text-2xl lg:text-4xl font-bold text-rose-600 dark:text-rose-500 mb-2 lg:mb-3">{scheduleStats.no_show}</p>
              <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
                <XCircle className="h-4 w-4 lg:h-5 lg:w-5 text-rose-600 dark:text-rose-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Time Slot Management */}
          <Card className="p-6 bg-background/50 backdrop-blur-sm border-border/50">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-6">Time Slot Management</h2>
              
              {/* Improved Date Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <Label htmlFor="date-select" className="text-sm font-semibold">Select Date</Label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkCreator(!showBulkCreator)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Bulk Create
                  </Button>
                </div>
                
                <div className="relative">
                  <Input
                    id="date-select"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full max-w-xs h-12 text-base bg-background/80 border-border/60 rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-all shadow-sm"
                    placeholder="Choose a date"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                {selectedDate && (
                  <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        Managing slots for {new Date(selectedDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bulk Slot Creator */}
              {showBulkCreator && (
                <div className="mb-6 p-4 bg-muted/30 rounded-xl border border-border/50">
                  <h3 className="text-sm font-semibold mb-3">Bulk Create Time Slots</h3>
                  {!selectedDate && (
                    <div className="mb-3 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      Please select a date first
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="interval" className="text-xs">Interval (minutes)</Label>
                        <Input
                          id="interval"
                          type="number"
                          value={bulkConfig.interval_minutes}
                          onChange={(e) => setBulkConfig(prev => ({ ...prev, interval_minutes: e.target.value }))}
                          placeholder="15"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <span className="text-xs text-muted-foreground">
                          {bulkConfig.interval_minutes} min slots
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Morning Start</Label>
                        <Input
                          type="time"
                          value={bulkConfig.morning_start}
                          onChange={(e) => setBulkConfig(prev => ({ ...prev, morning_start: e.target.value }))}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Morning End</Label>
                        <Input
                          type="time"
                          value={bulkConfig.morning_end}
                          onChange={(e) => setBulkConfig(prev => ({ ...prev, morning_end: e.target.value }))}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Afternoon Start</Label>
                        <Input
                          type="time"
                          value={bulkConfig.afternoon_start}
                          onChange={(e) => setBulkConfig(prev => ({ ...prev, afternoon_start: e.target.value }))}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Afternoon End</Label>
                        <Input
                          type="time"
                          value={bulkConfig.afternoon_end}
                          onChange={(e) => setBulkConfig(prev => ({ ...prev, afternoon_end: e.target.value }))}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => createBulkSlots(bulkConfig.morning_start, bulkConfig.morning_end)}
                        disabled={bulkLoading || !selectedDate}
                        className="flex-1 h-9"
                      >
                        {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Morning"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => createBulkSlots(bulkConfig.afternoon_start, bulkConfig.afternoon_end)}
                        disabled={bulkLoading || !selectedDate}
                        className="flex-1 h-9"
                      >
                        {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Afternoon"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedDate ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium mb-2">Available Time Slots</h3>
                  <p className="text-sm text-muted-foreground">Click to toggle availability</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {defaultTimeSlots.map((slot) => {
                    const existingSlot = timeSlots.find(ts => ts.time === slot.time && ts.date === selectedDate)
                    const isAvailable = existingSlot ? existingSlot.available : false
                    const isUpdating = updatingSlots.has(slot.time)
                    
                    return (
                      <Button
                        key={slot.time}
                        variant="outline"
                        size="sm"
                        onClick={() => !isUpdating && updateTimeSlotAvailability(slot.time, !isAvailable)}
                        disabled={isUpdating}
                        className={cn(
                          "h-12 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 hover:scale-105",
                          isAvailable && "bg-primary text-primary-foreground border-primary shadow-md hover:bg-primary/90",
                          !isAvailable && !isUpdating && "hover:bg-muted/50 hover:border-primary/50 hover:text-primary",
                          isUpdating && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <span className="text-sm font-medium">{slot.label}</span>
                            {isAvailable && <CheckCircle className="h-3 w-3" />}
                          </>
                        )}
                      </Button>
                    )
                  })}
                </div>
                
                <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-sm text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-background border border-border"></div>
                    <span className="text-sm text-muted-foreground">Unavailable</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select a date to manage time slots</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
