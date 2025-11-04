"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Calendar, Clock, MapPin, User, Phone } from "lucide-react"
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
    phone: ""
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false)
  const [phoneVerificationStatus, setPhoneVerificationStatus] = useState<{
    verified: boolean | null
    message: string
    applicantName?: string
  }>({ verified: null, message: "" })
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const verifyPhoneNumber = useCallback(async (phone: string) => {
    setIsVerifyingPhone(true)
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
  }, [])
  
  // Verify phone number when it changes (debounced)
  useEffect(() => {
    if (formData.phone.trim().length < 8) {
      setPhoneVerificationStatus({ verified: null, message: "" })
      return
    }
    
    const timeoutId = setTimeout(() => {
      verifyPhoneNumber(formData.phone)
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [formData.phone, verifyPhoneNumber])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Call the API to create the appointment
      const API_BASE_URL = getApiBaseUrl()
      const response = await fetch(`${API_BASE_URL}/schedule/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicant_name: formData.name,
          applicant_email: "", // Not required, backend will handle
          applicant_phone: formData.phone,
          scheduled_date: selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : '',
          scheduled_time: selectedTime,
          notes: "" // Not required
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsSubmitted(true)
        // Trigger parent to refresh slots
        if (onBooked) onBooked()
      } else {
        alert(`Failed to create appointment: ${data.error}`)
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
    let timeOfDay = ''
    if (hours >= 5 && hours < 12) {
      timeOfDay = 'morning'
    } else if (hours >= 12 && hours < 17) {
      timeOfDay = 'afternoon'
    } else if (hours >= 17 && hours < 21) {
      timeOfDay = 'evening'
    } else {
      timeOfDay = 'night'
    }
    
    return `${displayHours}:${minutes} ${period} ${timeOfDay}`
  }
  
  const isFormValid = formData.name && formData.phone && selectedDate && selectedTime && phoneVerificationStatus.verified === true
  
  if (isSubmitted) {
    return (
      <section className="py-16 sm:py-24 bg-gradient-to-br from-background to-muted/20">
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
                    <span>{formatTime(selectedTime)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Chenaniah Ministry Office, Addis Ababa</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">What to expect:</p>
                <ul className="text-left space-y-1">
                  <li>• Please arrive 10 minutes early</li>
                  <li>• Bring a valid ID</li>
                  <li>• Prepare to discuss your musical background</li>
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
                  Please select a date and time, and fill in all required fields to proceed.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  )
}
