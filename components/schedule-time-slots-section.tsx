"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { getApiBaseUrl } from "@/lib/utils"
const API_BASE_URL = getApiBaseUrl()

interface TimeSlot {
  id: number
  time: string
  label: string
  available: boolean
  date: string
  location?: string
  period?: 'morning' | 'afternoon'
}

interface ScheduleTimeSlotsSectionProps {
  selectedDate?: Date | null
  onTimeSelect?: (time: string) => void
  selectedTime?: string | null
  refreshKey?: number
}

export function ScheduleTimeSlotsSection({ 
  selectedDate, 
  onTimeSelect, 
  selectedTime,
  refreshKey,
}: ScheduleTimeSlotsSectionProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch time slots from API when date is selected
  useEffect(() => {
    if (selectedDate) {
      const fetchTimeSlots = async () => {
        setIsLoading(true)
        setError(null)
        try {
          // Fix timezone issue - use local date instead of UTC
          const year = selectedDate.getFullYear()
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
          const day = String(selectedDate.getDate()).padStart(2, '0')
          const dateStr = `${year}-${month}-${day}`
          console.log('📅 Fetching slots for date:', dateStr)
          console.log('🔗 API URL:', `${API_BASE_URL}/schedule/time-slots?date=${dateStr}`)
          
          const response = await fetch(`${API_BASE_URL}/schedule/time-slots?date=${dateStr}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const data = await response.json()
          console.log('📦 API Response:', data)
          
          if (data.success) {
            // Convert API data to expected format and filter to show only available slots
            const allSlots = data.timeSlots.map((slot: any) => ({
              id: slot.id,
              time: slot.time,
              label: slot.label,
              available: slot.available === 1 || slot.available === true,
              date: slot.date,
              location: (slot.location && slot.location !== null && slot.location !== 'null') ? slot.location : undefined,
              period: slot.period || undefined
            }))
            
            // Filter to show only available slots for better UX
            const availableSlots = allSlots.filter((slot: TimeSlot) => slot.available)
            console.log('✅ Loaded', allSlots.length, 'total slots,', availableSlots.length, 'available')
            setTimeSlots(availableSlots)
          } else {
            throw new Error(data.error || 'Failed to fetch time slots')
          }
        } catch (error) {
          console.error("Error fetching time slots:", error)
          setError(error instanceof Error ? error.message : 'Failed to load time slots. Please check your connection and try again.')
          setTimeSlots([])
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchTimeSlots()
    } else {
      setTimeSlots([])
      setError(null)
    }
  }, [selectedDate, refreshKey])
  
  const handleTimeClick = (time: string) => {
    if (onTimeSelect) {
      onTimeSelect(time)
    }
  }

  // Classify time slots into morning and afternoon using period field
  // Always verify period against time to ensure correctness (afternoon starts at 2:00 PM)
  const classifySlots = (slots: TimeSlot[]) => {
    const morning: TimeSlot[] = []
    const afternoon: TimeSlot[] = []
    
    slots.forEach(slot => {
      // Parse time to determine correct period
      const match = slot.time.match(/(\d{1,2}):(\d{2})/)
      if (match) {
        const hours = parseInt(match[1], 10)
        // Morning: 9:00 AM - 1:59 PM (09:00 - 13:59)
        // Afternoon: 2:00 PM - 5:00 PM (14:00 - 17:00)
        const correctPeriod = hours >= 9 && hours < 14 ? 'morning' : 
                              hours >= 14 && hours <= 17 ? 'afternoon' : null
        
        // Use time-based calculation to ensure correctness
        // This ensures slots are classified correctly even if database period is outdated
        if (correctPeriod === 'morning') {
          morning.push(slot)
        } else if (correctPeriod === 'afternoon') {
          afternoon.push(slot)
        }
      } else {
        // Fallback: use period field from database if time parsing fails
        if (slot.period === 'morning') {
          morning.push(slot)
        } else if (slot.period === 'afternoon') {
          afternoon.push(slot)
        }
      }
    })
    
    // Sort each group by time
    const sortByTime = (a: TimeSlot, b: TimeSlot) => {
      const timeA = a.time.match(/(\d{1,2}):(\d{2})/)
      const timeB = b.time.match(/(\d{1,2}):(\d{2})/)
      if (timeA && timeB) {
        const hoursA = parseInt(timeA[1], 10)
        const hoursB = parseInt(timeB[1], 10)
        if (hoursA !== hoursB) return hoursA - hoursB
        return parseInt(timeA[2], 10) - parseInt(timeB[2], 10)
      }
      return 0
    }
    
    return {
      morning: morning.sort(sortByTime),
      afternoon: afternoon.sort(sortByTime)
    }
  }
  
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Step 2
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Choose Your Preferred Time
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Select a time slot that works best for you.
            </p>
          </div>
          
          {!selectedDate ? (
            <Card className="p-8 text-center bg-background/50 backdrop-blur-sm border-border/50">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Please Select a Date First</h3>
              <p className="text-muted-foreground">
                Choose a date from the calendar above to see available time slots.
              </p>
            </Card>
          ) : (
            <Card className="p-6 sm:p-8 bg-background/50 backdrop-blur-sm border-border/50">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  Available Time Slots for {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Click on an available time slot to select it.
                </p>
              </div>
              
              {error ? (
                <div className="text-center py-8">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                    <p className="text-red-600 dark:text-red-400 font-medium mb-2">Error loading time slots</p>
                    <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
                    <p className="text-xs text-red-400 dark:text-red-500 mt-2">Please check that the backend API is running at {API_BASE_URL}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedDate) {
                        setError(null)
                        // Trigger a refresh by updating the refreshKey through the parent
                        // For now, just refetch
                        const year = selectedDate.getFullYear()
                        const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
                        const day = String(selectedDate.getDate()).padStart(2, '0')
                        const dateStr = `${year}-${month}-${day}`
                        
                        fetch(`${API_BASE_URL}/schedule/time-slots?date=${dateStr}`)
                          .then(res => res.json())
                          .then(data => {
                            if (data.success) {
                              const allSlots = data.timeSlots.map((slot: any) => ({
                                id: slot.id,
                                time: slot.time,
                                label: slot.label,
                                available: slot.available === 1 || slot.available === true,
                                date: slot.date,
                                period: slot.period || undefined
                              }))
                              const availableSlots = allSlots.filter((slot: TimeSlot) => slot.available)
                              setTimeSlots(availableSlots)
                              setError(null)
                            }
                          })
                          .catch(err => {
                            setError(err.message)
                          })
                      }
                    }}
                  >
                    Retry
                  </Button>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Loading time slots...</span>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No available time slots for this date.</p>
                  <p className="text-sm text-muted-foreground mt-2">Please try selecting another date.</p>
                </div>
              ) : (() => {
                const { morning, afternoon } = classifySlots(timeSlots)
                return (
                  <div className="space-y-8">
                    {/* Morning Section */}
                    {morning.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Morning Slots
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {morning.map((slot) => (
                            <Button
                              key={slot.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handleTimeClick(slot.time)}
                              className={cn(
                                "h-12 flex flex-col items-center justify-center gap-1 rounded-xl transition-all",
                                selectedTime === slot.time && "bg-primary text-primary-foreground border-primary shadow-md hover:bg-primary/90",
                                selectedTime !== slot.time && "hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
                              )}
                            >
                              <span className="text-sm font-medium">{slot.label}</span>
                              {selectedTime === slot.time && (
                                <CheckCircle className="h-3 w-3" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Afternoon Section */}
                    {afternoon.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Afternoon Slots
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {afternoon.map((slot) => (
                            <Button
                              key={slot.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handleTimeClick(slot.time)}
                              className={cn(
                                "h-12 flex flex-col items-center justify-center gap-1 rounded-xl transition-all",
                                selectedTime === slot.time && "bg-primary text-primary-foreground border-primary shadow-md hover:bg-primary/90",
                                selectedTime !== slot.time && "hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
                              )}
                            >
                              <span className="text-sm font-medium">{slot.label}</span>
                              {selectedTime === slot.time && (
                                <CheckCircle className="h-3 w-3" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
              
              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-background border border-primary/50"></div>
                  <span className="text-sm text-muted-foreground">Available</span>
                </div>
              </div>
            </Card>
          )}
          
          {selectedTime && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20">
                <Clock className="h-4 w-4" />
                <span className="font-medium">
                  Selected Time: {timeSlots.find(slot => slot.time === selectedTime)?.label}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
