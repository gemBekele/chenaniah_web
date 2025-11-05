"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Phone, 
  Calendar,
  Trophy,
  MessageCircle,
  ArrowRight
} from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface ApplicantStatus {
  is_applicant: boolean
  applicant_name?: string
  submission_status?: string
  final_decision?: string | null
  overall_status: 'accepted' | 'rejected' | 'approved' | 'pending' | 'not_found'
  status_message?: string
  decision_made_at?: string
  appointment_date?: string
  appointment_time?: string
  submitted_at?: string
  reviewer_comments?: string
}

export function ResultSection() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [status, setStatus] = useState<ApplicantStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const checkStatus = async () => {
    if (!phone.trim() || phone.trim().length < 8) {
      setError("Please enter a valid phone number")
      return
    }

    setIsChecking(true)
    setError(null)
    setHasSearched(true)

    try {
      const API_BASE_URL = getApiBaseUrl()
      const response = await fetch(`${API_BASE_URL}/applicant/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone })
      })

      const data = await response.json()

      if (data.success) {
        if (!data.is_applicant) {
          setStatus({
            is_applicant: false,
            overall_status: 'not_found',
            status_message: data.message || 'Phone number not found in our system'
          })
        } else {
          setStatus(data)
        }
      } else {
        setError(data.error || "Unable to check status. Please try again.")
        setStatus(null)
      }
    } catch (error) {
      console.error('Error checking status:', error)
      setError("Error checking status. Please try again.")
      setStatus(null)
    } finally {
      setIsChecking(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkStatus()
    }
  }

  const formatTime = (time: string | null | undefined): string => {
    if (!time) return ''
    const match = time.match(/(\d{1,2}):(\d{2})/)
    if (!match) return time
    const hours = parseInt(match[1], 10)
    const minutes = match[2]
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes} ${period}`
  }

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch {
      return dateStr
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section 
        className="pt-24 sm:pt-32 pb-16 sm:pb-20 text-white relative"
        style={{
          backgroundImage: `url('/assets/image/photo_1_2025-09-19_23-11-01.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#212E3E]/80 to-[#212E3E]/90"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-4 sm:mb-6 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90 text-base sm:text-lg px-4 sm:px-6 py-2">
            Check Your Status
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 text-balance">
            Application
            <span className="block text-[#E5C985]">Result</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto text-pretty px-4">
            Enter your phone number to check if you have been selected or rejected for our worship ministry program.
          </p>
        </div>
      </section>

      {/* Status Check Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 sm:p-8 bg-background/50 backdrop-blur-sm border-border/50 shadow-lg">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <Phone className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">Enter Your Phone Number</h2>
                  <p className="text-muted-foreground">
                    We'll check your application status instantly
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value)
                          setError(null)
                          if (hasSearched) setHasSearched(false)
                        }}
                        onKeyPress={handleKeyPress}
                        className="pl-10"
                        disabled={isChecking}
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-rose-600">{error}</p>
                    )}
                  </div>

                  <Button
                    onClick={checkStatus}
                    disabled={isChecking || !phone.trim()}
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isChecking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                        Checking Status...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Check My Status
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Result Display */}
            {hasSearched && status && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {status.overall_status === 'not_found' && (
                  <Card className="p-8 bg-background/50 backdrop-blur-sm border-border/50 shadow-lg">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-4">
                        <XCircle className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Not Found</h3>
                      <p className="text-muted-foreground">
                        {status.status_message || "This phone number is not registered in our system."}
                      </p>
                    </div>
                  </Card>
                )}

                {status.overall_status === 'accepted' && (
                  <Card className="p-8 bg-background/50 backdrop-blur-sm border-2 border-[#E5C985]/30 shadow-xl">
                    <div className="text-center space-y-6">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-[#E5C985]/40 rounded-full animate-ping opacity-75"></div>
                        <div className="relative inline-flex items-center justify-center w-24 h-24 bg-[#E5C985] rounded-full mb-4">
                          <Trophy className="h-12 w-12 text-[#212E3E]" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-3xl font-bold text-[#212E3E] mb-2">
                          🎉 እንኳን ደስ አልዎት!
                        </h3>
                        {status.applicant_name && (
                          <p className="text-xl text-[#212E3E] font-semibold">
                            {status.applicant_name}
                          </p>
                        )}
                        <div className="space-y-3 text-center bg-muted/30 rounded-lg p-6 border border-[#E5C985]/20">
                          <p className="text-base text-foreground leading-relaxed">
                            ክናንያ የዝማሬ አገልግሎት ለህብረት መዘምራን ያዘጋጀውን የመጀመሪያ ዙር ማጣሪያ (screening) አልፈዋል::
                          </p>
                          <p className="text-base text-foreground leading-relaxed">
                            ከሰኞ (ህዳር 1) ጀምሮ ሁለተኛ ዙር ማጣሪያ በአካል (in person) ስለምናደርግ ይህንን ማስፈንጠሪያ ተጠቅማችሁ ቀጠሮ በመያዝ በቦታው እንድትገኙ እናሳውቃለን::
                          </p>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-[#E5C985]/20">
                        <Button
                          onClick={() => router.push('/schedule')}
                          size="lg"
                          className="bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E] font-semibold px-8"
                        >
                          <Calendar className="h-5 w-5 mr-2" />
                          Schedule Your Interview
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                      </div>
                      {status.appointment_date && (
                        <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-[#E5C985]/20">
                          <div className="flex items-center justify-center gap-2 text-[#212E3E] mb-2">
                            <Calendar className="h-5 w-5" />
                            <span className="font-semibold">Interview Scheduled</span>
                          </div>
                          <p className="text-foreground">
                            {formatDate(status.appointment_date)}
                            {status.appointment_time && ` at ${formatTime(status.appointment_time)}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {status.overall_status === 'rejected' && (
                  <Card className="p-8 bg-background/50 backdrop-blur-sm border-2 border-border/50 shadow-xl">
                    <div className="text-center space-y-6">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-muted rounded-full mb-4">
                        <XCircle className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-3xl font-bold text-[#212E3E] mb-2">
                          Application Status
                        </h3>
                        {status.applicant_name && (
                          <p className="text-xl text-[#212E3E] font-semibold">
                            {status.applicant_name}
                          </p>
                        )}
                        <div className="space-y-3 text-center bg-muted/30 rounded-lg p-6 border border-border/50">
                          <p className="text-base text-foreground leading-relaxed">
                            ስለተሳተፉ እጅግ በጣም እናመሰግናለን!
                          </p>
                          <p className="text-base text-foreground leading-relaxed">
                            ለዚህኛው ዙር ልንቀበልዎ አልቻልንም:: በሚቀጥለው ዙር ደግመን እናገኝዎታለን ብለን ተስፋ እናደርጋለን::
                          </p>
                          <p className="text-base text-foreground leading-relaxed font-semibold mt-4">
                            ጸጋ ይብዛልዎ!
                          </p>
                        </div>
                      </div>
                      {status.reviewer_comments && (
                        <div className="pt-6 border-t border-border/50">
                          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <div className="flex items-start gap-3">
                              <MessageCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="text-left">
                                <p className="text-sm font-semibold text-foreground mb-1">Note:</p>
                                <p className="text-sm text-muted-foreground">{status.reviewer_comments}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {status.overall_status === 'approved' && (
                  <Card className="p-8 bg-background/50 backdrop-blur-sm border-2 border-[#E5C985]/30 shadow-xl">
                    <div className="text-center space-y-6">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-[#E5C985]/40 rounded-full animate-pulse opacity-50"></div>
                        <div className="relative inline-flex items-center justify-center w-24 h-24 bg-[#E5C985] rounded-full mb-4">
                          <CheckCircle className="h-12 w-12 text-[#212E3E]" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-3xl font-bold text-[#212E3E] mb-2">
                          Application Approved
                        </h3>
                        {status.applicant_name && (
                          <p className="text-xl text-[#212E3E] font-semibold">
                            {status.applicant_name}
                          </p>
                        )}
                        <div className="space-y-3 text-center bg-muted/30 rounded-lg p-6 border border-[#E5C985]/20">
                          <p className="text-base text-foreground leading-relaxed">
                            እንኳን ደስ አልዎት!
                          </p>
                          <p className="text-base text-foreground leading-relaxed">
                            ክናንያ የዝማሬ አገልግሎት ለህብረት መዘምራን ያዘጋጀውን የመጀመሪያ ዙር ማጣሪያ (screening) አልፈዋል::
                          </p>
                          <p className="text-base text-foreground leading-relaxed">
                            ከሰኞ (ህዳር 1) ጀምሮ ሁለተኛ ዙር ማጣሪያ በአካል (in person) ስለምናደርግ ይህንን ማስፈንጠሪያ ተጠቅማችሁ ቀጠሮ በመያዝ በቦታው እንድትገኙ እናሳውቃለን::
                          </p>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-[#E5C985]/20">
                        <Button
                          onClick={() => router.push('/schedule')}
                          size="lg"
                          className="bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E] font-semibold px-8"
                        >
                          <Calendar className="h-5 w-5 mr-2" />
                          Schedule Your Interview
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {status.overall_status === 'pending' && (
                  <Card className="p-8 bg-background/50 backdrop-blur-sm border-2 border-[#E5C985]/30 shadow-xl">
                    <div className="text-center space-y-6">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-[#E5C985]/40 rounded-full animate-pulse opacity-50"></div>
                        <div className="relative inline-flex items-center justify-center w-24 h-24 bg-[#E5C985] rounded-full mb-4">
                          <Clock className="h-12 w-12 text-[#212E3E]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-3xl font-bold text-[#212E3E] mb-2">
                          Under Review
                        </h3>
                        {status.applicant_name && (
                          <p className="text-xl text-[#212E3E] font-semibold">
                            {status.applicant_name}
                          </p>
                        )}
                        <p className="text-lg text-foreground">
                          {status.status_message || "Your application is still under review."}
                        </p>
                      </div>
                      <div className="pt-6 border-t border-[#E5C985]/20">
                        <p className="text-sm text-muted-foreground">
                          Please check back later for updates. We'll notify you once a decision has been made.
                        </p>
                        {status.submitted_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Submitted: {formatDate(status.submitted_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
