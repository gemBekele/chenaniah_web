"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface ScheduleCalendarSectionProps {
  onDateSelect?: (date: Date) => void
  selectedDate?: Date | null
}

export function ScheduleCalendarSection({ onDateSelect, selectedDate }: ScheduleCalendarSectionProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [datesWithSlots, setDatesWithSlots] = useState<Set<string>>(new Set())
  const [isLoadingDates, setIsLoadingDates] = useState(true)
  
  // Fetch all dates with available slots on mount
  useEffect(() => {
    const fetchAvailableDates = async () => {
      setIsLoadingDates(true)
      try {
        const response = await fetch(`${API_BASE_URL}/schedule/time-slots`)
        const data = await response.json()
        
        if (data.success) {
          // Filter to only dates with at least one available slot
          const availableDates = new Set<string>()
          data.timeSlots.forEach((slot: any) => {
            if (slot.available === 1 || slot.available === true) {
              availableDates.add(slot.date)
            }
          })
          console.log('📅 Dates with available slots:', Array.from(availableDates).slice(0, 10))
          setDatesWithSlots(availableDates)
        }
      } catch (error) {
        console.error("Error fetching available dates:", error)
      } finally {
        setIsLoadingDates(false)
      }
    }
    
    fetchAvailableDates()
  }, [])
  
  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const isCurrentMonth = date.getMonth() === month
      const isToday = date.getTime() === today.getTime()
      const isPast = date < today
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
      const dateStr = formatDate(date)
      
      // Only enable dates that have available slots and are not in the past
      const hasAvailableSlots = datesWithSlots.has(dateStr)
      const isAvailable = isCurrentMonth && !isPast && hasAvailableSlots
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        isPast,
        isSelected,
        isAvailable
      })
    }
    
    return days
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }
  
  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date)
    if (onDateSelect) {
      onDateSelect(date)
    }
  }
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Step 1
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Select Your Preferred Date
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose a date that works best for your schedule. Available dates are highlighted below.
            </p>
          </div>
          
          <Card className="p-6 sm:p-8 bg-background/50 backdrop-blur-sm border-border/50">
            {isLoadingDates ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
                <span className="text-muted-foreground">Loading available dates...</span>
              </div>
            ) : (
              <>
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                    className="h-10 w-10 p-0 rounded-xl"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <h3 className="text-xl sm:text-2xl font-semibold">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                    className="h-10 w-10 p-0 rounded-xl"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {generateCalendarDays().map((day, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => day.isAvailable && handleDateClick(day.date)}
                      disabled={!day.isAvailable}
                      className={cn(
                        "h-10 w-full rounded-xl transition-all",
                        day.isSelected && "bg-primary text-primary-foreground shadow-md",
                        day.isToday && !day.isSelected && "bg-primary/10 text-primary border border-primary/20",
                        day.isAvailable && !day.isSelected && !day.isToday && "hover:bg-primary/10 hover:border-primary/30",
                        !day.isCurrentMonth && "text-muted-foreground/30",
                        !day.isAvailable && "opacity-30 cursor-not-allowed bg-muted/20"
                      )}
                    >
                      {day.date.getDate()}
                    </Button>
                  ))}
                </div>
              </>
            )}
            
            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-6 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm text-muted-foreground">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/10 border border-primary/20"></div>
                <span className="text-sm text-muted-foreground">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted/50"></div>
                <span className="text-sm text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted/20"></div>
                <span className="text-sm text-muted-foreground">Unavailable</span>
              </div>
            </div>
          </Card>
          
          {selectedDate && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">
                  Selected: {selectedDate.toLocaleDateString('en-US', { 
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
      </div>
    </section>
  )
}
