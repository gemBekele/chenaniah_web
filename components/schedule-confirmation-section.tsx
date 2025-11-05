"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Calendar, Clock, MapPin, User, Phone, Music } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"

interface ScheduleConfirmationSectionProps {
  selectedDate?: Date | null
  selectedTime?: string | null
  onBooked?: () => void
}

export function ScheduleConfirmationSection({ 
  selectedDate, 
  selectedTime,
  onBooked
}: ScheduleConfirmationSectionProps) {
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    selectedSong: "",
    additionalSong: "",
    additionalSongSinger: ""
  })
  
  // Predefined songs that applicants must choose from
  const predefinedSongs = [
    "ደሙን ለእኔ አፍሱ (አዲሱ ወርቁ)",
    "እውቀት ሳይኖረኝ (አብርሃም እና እያሱ)",
    "መበርቻዬ (ተከስተ ጌትነት)"
  ]
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false)
  const [phoneVerificationStatus, setPhoneVerificationStatus] = useState<{
    verified: boolean | null
    message: string
    applicantName?: string
  }>({ verified: null, message: "" })
  const [slotLocation, setSlotLocation] = useState<string>("")
  const [existingAppointment, setExistingAppointment] = useState<{
    hasExisting: boolean
    date?: string
    time?: string
  } | null>(null)
  const [isCheckingAppointment, setIsCheckingAppointment] = useState(false)
  const successSectionRef = useRef<HTMLDivElement>(null)
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const checkExistingAppointment = useCallback(async (phone: string) => {
    setIsCheckingAppointment(true)
    try {
      const API_BASE_URL = getApiBaseUrl()
      const response = await fetch(`${API_BASE_URL}/schedule/appointments/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone })
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (data.has_existing_appointment && data.appointments && data.appointments.length > 0) {
          const latest = data.appointments[0]
          setExistingAppointment({
            hasExisting: true,
            date: latest.scheduled_date,
            time: latest.scheduled_time
          })
        } else {
          setExistingAppointment({ hasExisting: false })
        }
      } else {
        setExistingAppointment({ hasExisting: false })
      }
    } catch (error) {
      console.error('Error checking existing appointment:', error)
      setExistingAppointment({ hasExisting: false })
    } finally {
      setIsCheckingAppointment(false)
    }
  }, [])

  const verifyPhoneNumber = useCallback(async (phone: string) => {
    setIsVerifyingPhone(true)
    setExistingAppointment(null) // Reset existing appointment check
    try {
      const API_BASE_URL = getApiBaseUrl()
      const response = await fetch(`${API_BASE_URL}/schedule/verify-applicant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone })
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (data.is_applicant) {
          setPhoneVerificationStatus({
            verified: true,
            message: `Phone verified! Welcome, ${data.applicant_name || 'applicant'}`,
            applicantName: data.applicant_name
          })
          // Auto-fill name from backend
          setFormData(prev => ({
            ...prev,
            name: data.applicant_name || ""
          }))
          // Check for existing appointments after successful verification
          // await checkExistingAppointment(phone)
        } else {
          setPhoneVerificationStatus({
            verified: false,
            message: "This phone number is not registered as an applicant."
          })
        }
      } else {
        setPhoneVerificationStatus({
          verified: false,
          message: data.error || "Unable to verify phone number."
        })
      }
    } catch (error) {
      console.error('Error verifying phone:', error)
      setPhoneVerificationStatus({
        verified: false,
        message: "Error verifying phone number. Please try again."
      })
    } finally {
      setIsVerifyingPhone(false)
    }
  }, [checkExistingAppointment])
  
  // Verify phone number when it changes (debounced)
  useEffect(() => {
    if (formData.phone.trim().length < 8) {
      setPhoneVerificationStatus({ verified: null, message: "" })
      setExistingAppointment(null)
      return
    }
    
    const timeoutId = setTimeout(() => {
      verifyPhoneNumber(formData.phone)
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [formData.phone, verifyPhoneNumber])

  // Fetch location from time slot
  useEffect(() => {
    const fetchSlotLocation = async () => {
      if (!selectedDate || !selectedTime) {
        setSlotLocation("")
        return
      }
      
      try {
        const API_BASE_URL = getApiBaseUrl()
        const year = selectedDate.getFullYear()
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
        const day = String(selectedDate.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        
        const response = await fetch(`${API_BASE_URL}/schedule/time-slots?date=${dateStr}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.timeSlots) {
            const slot = data.timeSlots.find((s: any) => s.time === selectedTime)
            if (slot && slot.location && slot.location !== null && slot.location !== 'null') {
              setSlotLocation(slot.location)
            } else {
              setSlotLocation("")
            }
          } else {
            setSlotLocation("")
          }
        } else {
          setSlotLocation("")
        }
      } catch (error) {
        console.error('Error fetching slot location:', error)
        setSlotLocation("")
      }
    }
    
    fetchSlotLocation()
  }, [selectedDate, selectedTime])
  
  // Scroll to success message when submission is successful
  useEffect(() => {
    if (isSubmitted && successSectionRef.current) {
      let scrollLocked = true
      let targetScrollPosition: number | null = null
      
      // Lock scroll position temporarily
      const lockScroll = () => {
        if (scrollLocked && targetScrollPosition !== null) {
          window.scrollTo({
            top: targetScrollPosition,
            behavior: 'auto' // Instant scroll to maintain position
          })
        }
      }
      
      // Wait for DOM to update, then scroll
      const scrollToSuccess = () => {
        if (successSectionRef.current) {
          const element = successSectionRef.current
          const elementTop = element.getBoundingClientRect().top + window.pageYOffset
          const offset = 20 // Small offset from top
          targetScrollPosition = elementTop - offset
          
          // Scroll to the success message
          window.scrollTo({
            top: targetScrollPosition,
            behavior: 'smooth'
          })
          
          // Lock scroll for 1 second to prevent jumping
          const scrollInterval = setInterval(lockScroll, 50)
          setTimeout(() => {
            scrollLocked = false
            clearInterval(scrollInterval)
          }, 1500)
        }
      }
      
      // Use multiple animation frames to ensure DOM is ready
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(scrollToSuccess, 300)
        })
      })
    }
  }, [isSubmitted])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Call the API to create the appointment
      const API_BASE_URL = getApiBaseUrl()
      const requestBody = {
        applicant_name: formData.name,
        applicant_email: "", // Not required, backend will handle
        applicant_phone: formData.phone,
        scheduled_date: selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : '',
        scheduled_time: selectedTime,
        notes: "", // Not required
        selected_song: formData.selectedSong,
        additional_song: formData.additionalSong,
        additional_song_singer: formData.additionalSongSinger
      }
      
      // Debug logging
      console.log('Submitting appointment with song data:', {
        selected_song: requestBody.selected_song,
        additional_song: requestBody.additional_song,
        additional_song_singer: requestBody.additional_song_singer
      })
      
      const response = await fetch(`${API_BASE_URL}/schedule/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsSubmitted(true)
        // Delay the refresh to allow scroll to success message first
        setTimeout(() => {
          if (onBooked) onBooked()
        }, 500)
      } else {
        // If backend reports existing appointment, update state
        if (data.error && data.error.includes('already have a scheduled')) {
          if (data.existing_appointment) {
            setExistingAppointment({
              hasExisting: true,
              date: data.existing_appointment.date,
              time: data.existing_appointment.time
            })
          }
        }
        alert(`Failed to create appointment: ${data.error || 'Unknown error'}`)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('Error creating appointment. Please try again.')
      setIsSubmitting(false)
    }
  }
  
  // Convert 24-hour time format (HH:MM) to readable format (H:MM AM/PM)
  const formatTime = (time: string | null | undefined): string => {
    if (!time) return ''
    
    // Try to parse time in HH:MM format
    const match = time.match(/(\d{1,2}):(\d{2})/)
    if (!match) return time // Return as-is if format doesn't match
    
    const hours = parseInt(match[1], 10)
    const minutes = match[2]
    
    // Convert to 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    
    // Determine time of day for better readability
    // Morning: 5:00 AM - 1:59 PM (05:00 - 13:59)
    // Afternoon: 2:00 PM - 5:00 PM (14:00 - 17:00)
    let timeOfDay = ''
    if (hours >= 5 && hours < 14) {
      timeOfDay = 'morning'
    } else if (hours >= 14 && hours < 17) {
      timeOfDay = 'afternoon'
    } else if (hours >= 17 && hours < 21) {
      timeOfDay = 'evening'
    } else {
      timeOfDay = 'night'
    }
    
    return `${displayHours}:${minutes} ${period} ${timeOfDay}`
  }
  
  const isFormValid = formData.name && formData.phone && selectedDate && selectedTime && 
                      phoneVerificationStatus.verified === true && formData.selectedSong && 
                      formData.additionalSong && formData.additionalSongSinger
                      // && !existingAppointment?.hasExisting
  
  if (isSubmitted) {
    return (
      <section 
        ref={successSectionRef}
        className="py-16 sm:py-24 bg-gradient-to-br from-background to-muted/20"
        id="appointment-success"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-8 bg-background/50 backdrop-blur-sm border-border/50">
              <div className="mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Interview Scheduled Successfully!</h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Your interview has been confirmed. Please save the details below.
                </p>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-6 mb-6">
                <h3 className="font-semibold mb-4">Interview Details</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{selectedDate?.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{formatTime(selectedTime)} session</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary/30">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs font-semibold text-primary/90 block mb-2 uppercase tracking-wide">Interview Location</span>
                          <span className="text-lg font-bold text-black-500">{slotLocation || "Location not specified"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <ul className="text-left space-y-1">
                  <li>• Please arrive 10 minutes early</li>
                  <li>• Bring a valid ID</li>
                  <li>• Prepare to discuss your background</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>
    )
  }
  
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Step 3
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Confirm Your Details
            </h2>
            <p className="text-muted-foreground text-lg">
              Please provide your contact information to complete the scheduling process.
            </p>
          </div>
          
          <Card className="p-6 sm:p-8 bg-background/50 backdrop-blur-sm border-border/50">
            {/* Selected Date and Time Summary */}
            {(selectedDate || selectedTime) && (
              <div className="mb-8 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <h3 className="font-semibold mb-3 text-primary">Selected Appointment</h3>
                <div className="space-y-2">
                  {selectedDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">{selectedTime}</span>
                    </div>
                  )}
                  {slotLocation && (
                    <div className="mt-3 pt-3 border-t border-primary/20">
                      <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-xs font-medium text-primary/80 block mb-1 uppercase tracking-wide">Interview Location</span>
                            <span className="text-m font-semibold text-black">{slotLocation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`pl-10 ${
                        phoneVerificationStatus.verified === false 
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" 
                          : phoneVerificationStatus.verified === true 
                          ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500"
                          : ""
                      }`}
                      required
                    />
                    {isVerifyingPhone && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  {phoneVerificationStatus.message && (
                    <p className={`text-xs ${
                      phoneVerificationStatus.verified === true 
                        ? "text-emerald-600" 
                        : phoneVerificationStatus.verified === false
                        ? "text-rose-600"
                        : "text-muted-foreground"
                    }`}>
                      {phoneVerificationStatus.message}
                    </p>
                  )}
                  {existingAppointment?.hasExisting && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm font-semibold text-amber-800 mb-1">
                        ⚠️ You already have a scheduled interview
                      </p>
                      <p className="text-xs text-amber-700">
                        {existingAppointment.date && (
                          <>
                            Date: {new Date(existingAppointment.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                            {existingAppointment.time && ` at ${formatTime(existingAppointment.time)}`}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        You cannot schedule another appointment until your current one is completed or cancelled.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Name will appear after phone verification"
                      value={formData.name}
                      readOnly
                      className="pl-10 bg-muted/50 cursor-not-allowed"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Song Selection Section */}
              <div className="space-y-6 border-t border-border/50 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Music className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Song Selection</h3>
                </div>
                
                {/* Predefined Song Selection */}
                <div className="space-y-2">
                  <Label htmlFor="selectedSong" className="text-sm font-medium">
                    Select One of the Required Songs *
                  </Label>  
                  <Select
                    value={formData.selectedSong}
                    onValueChange={(value) => handleInputChange('selectedSong', value)}
                  >
                    <SelectTrigger id="selectedSong" className="w-full">
                      <SelectValue placeholder="Choose a song from the list" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedSongs.map((song, index) => (
                        <SelectItem key={index} value={song}>
                          {song}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                
                </div>
                
                {/* Additional Song Selection */}
                <div className="space-y-2"><p className="text-s text-muted-foreground mt-2 mb-2">
                   ይህ በኢንተርቪው ቀን ከላይ ከመረጡት ዝማሬ በተጨማሪ የሚዘምሩት መዝሙር ነው። 
                  </p><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="additionalSong" className="text-sm font-medium">
                      Additional Song Name *
                    </Label>
                    <Input
                      id="additionalSong"
                      type="text"
                      placeholder="Enter song name"
                      value={formData.additionalSong}
                      onChange={(e) => handleInputChange('additionalSong', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="additionalSongSinger" className="text-sm font-medium">
                      Singer/Artist *
                    </Label>
                    <Input
                      id="additionalSongSinger"
                      type="text"
                      placeholder="Enter singer/artist name"
                      value={formData.additionalSongSinger}
                      onChange={(e) => handleInputChange('additionalSongSinger', e.target.value)}
                      required
                    />
                  </div>
                </div></div>
                
                
              </div>
              
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                    Scheduling Interview...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Interview Appointment
                  </>
                )}
              </Button>
            </form>
            
            {!isFormValid && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Please select a date and time, verify your phone number, and fill in all required fields including song selections to proceed.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  )
}
