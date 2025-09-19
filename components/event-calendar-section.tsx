"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react"
import { useState } from "react"

export function EventCalendarSection() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const events = [
    {
      id: 1,
      title: "Community Worship Night",
      date: "2024-01-20",
      time: "7:00 PM",
      location: "St. Mary's Church",
      type: "Worship",
    },
    {
      id: 2,
      title: "Biblical Worship Seminar",
      date: "2024-01-28",
      time: "10:00 AM",
      location: "Online (Zoom)",
      type: "Seminar",
    },
    {
      id: 3,
      title: "Harp Masterclass Workshop",
      date: "2024-02-10",
      time: "2:00 PM",
      location: "Chenaniah Training Center",
      type: "Workshop",
    },
    {
      id: 4,
      title: "Annual Worship Leaders Conference",
      date: "2024-03-15",
      time: "9:00 AM",
      location: "Addis Ababa Conference Center",
      type: "Conference",
    },
  ]

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((event) => event.date === dateStr)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">Event Calendar</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">Plan Your Worship Journey</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            Stay organized with our interactive calendar featuring all upcoming events, workshops, and conferences.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-gray-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-2xl font-bold text-[#212E3E]">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("prev")}
                    className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("next")}
                    className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center font-semibold text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {emptyDays.map((day) => (
                    <div key={`empty-${day}`} className="h-20"></div>
                  ))}
                  {days.map((day) => {
                    const dayEvents = getEventsForDate(day)
                    return (
                      <div
                        key={day}
                        className={`h-20 p-1 border rounded-lg cursor-pointer transition-colors ${
                          dayEvents.length > 0
                            ? "bg-[#E5C985]/10 border-[#E5C985] hover:bg-[#E5C985]/20"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-semibold text-sm text-[#212E3E]">{day}</div>
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className="text-xs bg-[#212E3E] text-white rounded px-1 py-0.5 mt-1 truncate"
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-[#E5C985] font-semibold">+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events List */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#212E3E] mb-6">This Month's Events</h3>
            {events
              .filter((event) => {
                const eventDate = new Date(event.date)
                return (
                  eventDate.getMonth() === currentMonth.getMonth() &&
                  eventDate.getFullYear() === currentMonth.getFullYear()
                )
              })
              .map((event) => (
                <Card key={event.id} className="border-l-4 border-l-[#E5C985]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-[#212E3E] text-white text-xs">{event.type}</Badge>
                      <span className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-semibold text-[#212E3E] mb-2">{event.title}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-[#E5C985]" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-[#E5C985]" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-[#212E3E] hover:bg-[#212E3E]/90 text-white">
            <Calendar className="w-5 h-5 mr-2" />
            Subscribe to Calendar
          </Button>
        </div>
      </div>
    </section>
  )
}
