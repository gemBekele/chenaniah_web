"use client"

import { useState } from "react"
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
  ArrowRight,
  Search
} from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [activeTab, setActiveTab] = useState<"screening" | "interview">("screening")

  const checkStatus = async (type: "screening" | "interview") => {
    if (!phone.trim() || phone.trim().length < 8) {
      setError("Please enter a valid phone number")
      return
    }

    setIsChecking(true)
    setError(null)
    setHasSearched(true)
    // Reset status when searching again to avoid showing old results while loading
    setStatus(null) 

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

  const handleKeyPress = (e: React.KeyboardEvent, type: "screening" | "interview") => {
    if (e.key === 'Enter') {
      checkStatus(type)
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

  // Helper component for the Input Form
  const StatusCheckForm = ({ type }: { type: "screening" | "interview" }) => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          {type === 'screening' ? (
            <Search className="h-8 w-8 text-primary" />
          ) : (
            <Trophy className="h-8 w-8 text-primary" />
          )}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          {type === 'screening' ? 'First Round Result' : 'In-Person Interview Result'}
        </h2>
        <p className="text-muted-foreground">
          {type === 'screening' 
            ? "Check if you passed the initial screening" 
            : "Check your final interview result"}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`phone-${type}`} className="text-sm font-medium">
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id={`phone-${type}`}
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                setError(null)
                setHasSearched(false)
              }}
              onKeyPress={(e) => handleKeyPress(e, type)}
              className="pl-10 h-12 text-lg"
              disabled={isChecking}
            />
          </div>
          {error && (
            <p className="text-sm text-rose-600 animate-in slide-in-from-top-1">{error}</p>
          )}
        </div>

        <Button
          onClick={() => checkStatus(type)}
          disabled={isChecking || !phone.trim()}
          size="lg"
          className="w-full h-12 text-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {isChecking ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent mr-2" />
              Checking...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Check Result
            </>
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Hero Section - Untouched as requested */}
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
            Enter your phone number to check if you have been selected for our worship ministry program.
          </p>
        </div>
      </section>

      {/* Status Check Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            
            <Tabs 
              defaultValue="screening" 
              value={activeTab} 
              onValueChange={(val) => {
                setActiveTab(val as "screening" | "interview")
                setHasSearched(false)
                setPhone("")
                setError(null)
                setStatus(null)
              }} 
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-12 h-12 sm:h-14 p-1 bg-muted/50 backdrop-blur-sm rounded-full border border-border/50">
                <TabsTrigger 
                  value="screening"
                  className="rounded-full h-full text-xs sm:text-sm md:text-base font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 px-2 sm:px-4"
                >
                  <span className="hidden sm:inline">First Round Result</span>
                  <span className="sm:hidden">First Round</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="interview"
                  className="rounded-full h-full text-xs sm:text-sm md:text-base font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 px-2 sm:px-4"
                >
                  <span className="hidden sm:inline">In-Person Interview Result</span>
                  <span className="sm:hidden">Interview</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="screening" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="p-6 sm:p-10 bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl">
                  {!hasSearched ? (
                    <StatusCheckForm type="screening" />
                  ) : (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                      {status?.overall_status === 'not_found' ? (
                        <div className="text-center py-8">
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-6">
                            <XCircle className="h-10 w-10 text-muted-foreground" />
                          </div>
                          <h3 className="text-2xl font-bold mb-3">Not Found</h3>
                          <p className="text-muted-foreground text-lg">
                            {status.status_message || "This phone number is not registered in our system."}
                          </p>
                          <Button 
                            variant="outline" 
                            onClick={() => setHasSearched(false)}
                            className="mt-8"
                          >
                            Check Another Number
                          </Button>
                        </div>
                      ) : (
                        <>
                          {status?.submission_status === 'approved' ? (
                            <div className="text-center space-y-8">
                              <div className="relative inline-block">
                                <div className="absolute inset-0 bg-[#E5C985]/40 rounded-full animate-pulse opacity-50"></div>
                                <div className="relative inline-flex items-center justify-center w-28 h-28 bg-[#E5C985] rounded-full mb-4 shadow-lg">
                                  <CheckCircle className="h-14 w-14 text-[#212E3E]" />
                                </div>
                              </div>
                              <div className="space-y-6">
                                <div>
                                  <h3 className="text-3xl sm:text-4xl font-bold text-[#212E3E] mb-3">
                                    Application Approved
                                  </h3>
                                  {status.applicant_name && (
                                    <p className="text-xl text-[#212E3E]/80 font-semibold">
                                      {status.applicant_name}
                                    </p>
                                  )}
                                </div>
                                <div className="bg-gradient-to-br from-[#E5C985]/10 to-transparent rounded-2xl p-8 border border-[#E5C985]/20">
                                  <p className="text-lg text-foreground leading-relaxed font-medium mb-4">
                                    እንኳን ደስ አልዎት!
                                  </p>
                                  <p className="text-base text-foreground/80 leading-relaxed mb-4">
                                    ክናንያ የዝማሬ አገልግሎት ለህብረት መዘምራን ያዘጋጀውን የመጀመሪያ ዙር ማጣሪያ (screening) አልፈዋል::
                                  </p>
                                  <p className="text-base text-foreground/80 leading-relaxed">
                                    ከሰኞ (ህዳር 1) ጀምሮ ሁለተኛ ዙር ማጣሪያ በአካል (in person) ስለምናደርግ ይህንን ማስፈንጠሪያ ተጠቅማችሁ ቀጠሮ በመያዝ በቦታው እንድትገኙ እናሳውቃለን::
                                  </p>
                                </div>
                                <Button
                                  onClick={() => router.push('/schedule')}
                                  size="lg"
                                  className="bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E] font-bold px-10 h-14 text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                                >
                                  <Calendar className="h-5 w-5 mr-2" />
                                  Schedule Interview
                                  <ArrowRight className="h-5 w-5 ml-2" />
                                </Button>
                              </div>
                            </div>
                          ) : status?.submission_status === 'rejected' ? (
                            <div className="text-center space-y-8">
                              <div className="inline-flex items-center justify-center w-24 h-24 bg-muted rounded-full mb-4">
                                <XCircle className="h-12 w-12 text-muted-foreground" />
                              </div>
                              <div className="space-y-6">
                                <div>
                                  <h3 className="text-3xl font-bold text-[#212E3E] mb-3">
                                    Application Status
                                  </h3>
                                  {status.applicant_name && (
                                    <p className="text-xl text-[#212E3E]/80 font-semibold">
                                      {status.applicant_name}
                                    </p>
                                  )}
                                </div>
                                <div className="bg-muted/30 rounded-2xl p-8 border border-border/50">
                                  <p className="text-lg text-foreground leading-relaxed mb-4">
                                    ስለተሳተፉ እጅግ በጣም እናመሰግናለን!
                                  </p>
                                  <p className="text-base text-foreground/80 leading-relaxed">
                                    ለዚህኛው ዙር ልንቀበልዎ አልቻልንም:: በሚቀጥለው ዙር ደግመን እናገኝዎታለን ብለን ተስፋ እናደርጋለን::
                                  </p>
                                </div>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setHasSearched(false)}
                                  className="mt-4"
                                >
                                  Check Another Number
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center space-y-8">
                              <div className="inline-flex items-center justify-center w-24 h-24 bg-[#E5C985]/20 rounded-full mb-4">
                                <Clock className="h-12 w-12 text-[#212E3E]" />
                              </div>
                              <div className="space-y-4">
                                <h3 className="text-3xl font-bold text-[#212E3E] mb-2">Under Review</h3>
                                <p className="text-xl text-foreground/80">Your application is still under review.</p>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setHasSearched(false)}
                                  className="mt-4"
                                >
                                  Check Another Number
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="interview" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="p-6 sm:p-10 bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl">
                  {!hasSearched ? (
                    <StatusCheckForm type="interview" />
                  ) : (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                      {status?.overall_status === 'not_found' ? (
                         <div className="text-center py-8">
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-6">
                            <XCircle className="h-10 w-10 text-muted-foreground" />
                          </div>
                          <h3 className="text-2xl font-bold mb-3">Not Found</h3>
                          <p className="text-muted-foreground text-lg">
                            {status.status_message || "This phone number is not registered in our system."}
                          </p>
                          <Button 
                            variant="outline" 
                            onClick={() => setHasSearched(false)}
                            className="mt-8"
                          >
                            Check Another Number
                          </Button>
                        </div>
                      ) : (
                        <>
                          {(() => {
                            // Use appointment status logic based on final_decision:
                            // - If final_decision === 'accepted', status was 'completed' → accepted
                            // - If final_decision === 'rejected', status was 'no_show' → rejected
                            // - If appointment_date exists but final_decision is null → scheduled (not yet reviewed)
                            const finalDecision = status?.final_decision?.toLowerCase()
                            const hasAppointment = !!(status?.appointment_date)
                            
                            // Check if status was 'completed' (final_decision = 'accepted')
                            if (finalDecision === 'accepted') {
                              return (
                                <div className="text-center space-y-8">
                                  <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-[#E5C985]/40 rounded-full animate-ping opacity-75"></div>
                                    <div className="relative inline-flex items-center justify-center w-28 h-28 bg-[#E5C985] rounded-full mb-4 shadow-lg">
                                      <Trophy className="h-14 w-14 text-[#212E3E]" />
                                    </div>
                                  </div>
                                  <div className="space-y-6">
                                    <div>
                                      <h3 className="text-3xl sm:text-4xl font-bold text-[#212E3E] mb-3">
                                        🎉 እንኳን ደስ አልዎት!
                                      </h3>
                                      {status?.applicant_name && (
                                        <p className="text-xl text-[#212E3E]/80 font-semibold">
                                          {status.applicant_name}
                                        </p>
                                      )}
                                    </div>
                                    <div className="bg-gradient-to-br from-[#E5C985]/10 to-transparent rounded-2xl p-8 border border-[#E5C985]/20">
                                      <p className="text-lg text-foreground leading-relaxed font-medium mb-4">
                                        
የክናንያ የህብረት መዘምራንን የማጣሪያ ፈተናዎች ሁሉ አልፈዋል። 
                                      </p>
                                      <p className="text-base text-foreground/80 leading-relaxed">
                                       
ከህዳር 18/2018 ዓ.ም ጀምሮ ወደ  chenaniah.org/choir/signup በመሄድ የሚጠየቁትን መረጃ ሁሉ እንዲያስገቡ እና ምዝገባዎትን እንዲያጠናቅቁ እንጠይቃለን።

የመጀመሪያ ስብሰባ ረቡዕ (ህዳር 24) ከቀኑ 11:00 ሰዓት፣ በቤዛ አለምአቀፍ ቤተክርስቲያን ይኖረናል::</p>
                                      <p className="text-base text-foreground/80 leading-relaxed mt-4">
                                        ስለ ቀጣይ ፕሮግራሞች በቅርቡ እናሳውቀዎታለን::
                                      </p>
                                    </div>
                                    
                                    {status?.decision_made_at && (
                                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-100">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">Official Acceptance • {formatDate(status.decision_made_at)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            } 
                            // Check if status was 'no_show' (final_decision = 'rejected')
                            else if (finalDecision === 'rejected') {
                              return (
                                <div className="text-center space-y-8">
                                  <div className="inline-flex items-center justify-center w-24 h-24 bg-muted rounded-full mb-4">
                                    <XCircle className="h-12 w-12 text-muted-foreground" />
                                  </div>
                                  <div className="space-y-6">
                                    <h3 className="text-3xl font-bold text-[#212E3E] mb-3">
                                      Interview Result
                                    </h3>
                                    <div className="bg-muted/30 rounded-2xl p-8 border border-border/50">
                                      <p className="text-lg text-foreground leading-relaxed">
                                        Thank you for interviewing with us. Unfortunately, you were not selected at this time.
                                      </p>
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setHasSearched(false)}
                                      className="mt-4"
                                    >
                                      Check Another Number
                                    </Button>
                                  </div>
                                </div>
                              )
                            } 
                            // If appointment exists but no final_decision → scheduled (not yet reviewed)
                            else if (hasAppointment) {
                              return (
                                <div className="text-center space-y-8">
                                  <div className="inline-flex items-center justify-center w-24 h-24 bg-[#E5C985]/20 rounded-full mb-4">
                                    <Clock className="h-12 w-12 text-[#212E3E]" />
                                  </div>
                                  <div className="space-y-6">
                                    <div>
                                      <h3 className="text-3xl font-bold text-[#212E3E] mb-3">
                                        Interview Scheduled
                                      </h3>
                                      {status?.applicant_name && (
                                        <p className="text-xl text-[#212E3E]/80 font-semibold">
                                          {status.applicant_name}
                                        </p>
                                      )}
                                    </div>
                                    <div className="bg-gradient-to-br from-[#E5C985]/10 to-transparent rounded-2xl p-8 border border-[#E5C985]/20">
                                      <p className="text-lg text-foreground leading-relaxed font-medium mb-4">
                                        Your interview has been scheduled but not yet reviewed.
                                      </p>
                                      {status?.appointment_date && (
                                        <div className="mt-4 space-y-2">
                                          <p className="text-base text-foreground/80">
                                            <strong>Date:</strong> {formatDate(status.appointment_date)}
                                          </p>
                                          {status?.appointment_time && (
                                            <p className="text-base text-foreground/80">
                                              <strong>Time:</strong> {formatTime(status.appointment_time)}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                      <p className="text-base text-foreground/80 leading-relaxed mt-4">
                                        Please wait for the review to be completed. Results will be available here once the interview has been reviewed.
                                      </p>
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setHasSearched(false)}
                                      className="mt-4"
                                    >
                                      Check Another Number
                                    </Button>
                                  </div>
                                </div>
                              )
                            } 
                            // No appointment scheduled
                            else {
                              return (
                                <div className="text-center space-y-8">
                                  <div className="inline-flex items-center justify-center w-24 h-24 bg-muted rounded-full mb-4">
                                    <Clock className="h-12 w-12 text-muted-foreground" />
                                  </div>
                                  <div className="space-y-4">
                                    <h3 className="text-3xl font-bold text-[#212E3E] mb-2">No Interview Result Yet</h3>
                                    <p className="text-xl text-muted-foreground max-w-md mx-auto">
                                      {status?.submission_status === 'approved' 
                                        ? "You have been approved for an interview. Please schedule it if you haven't already." 
                                        : "You are not currently eligible for an interview result."}
                                    </p>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setHasSearched(false)}
                                      className="mt-4"
                                    >
                                      Check Another Number
                                    </Button>
                                  </div>
                                </div>
                              )
                            }
                          })()}
                        </>
                      )}
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </>
  )
}
