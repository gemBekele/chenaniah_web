"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ScheduleHeroSection } from "@/components/schedule-hero-section"
import { ScheduleCalendarSection } from "@/components/schedule-calendar-section"
import { ScheduleTimeSlotsSection } from "@/components/schedule-time-slots-section"
import { ScheduleConfirmationSection } from "@/components/schedule-confirmation-section"

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState<number>(0)
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    // Reset time selection when date changes
    setSelectedTime(null)
  }
  
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }
  
  return (
    <main className="min-h-screen">
      <Header />
      <ScheduleHeroSection />
      <ScheduleCalendarSection 
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
      />
      <ScheduleTimeSlotsSection 
        selectedDate={selectedDate}
        onTimeSelect={handleTimeSelect}
        selectedTime={selectedTime}
        refreshKey={refreshKey}
      />
      <ScheduleConfirmationSection 
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onBooked={() => setRefreshKey(prev => prev + 1)}
      />
      <Footer />
    </main>
  )
}
