import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users } from "lucide-react"

export function ScheduleHeroSection() {
  return (
    <section className="relative py-24 sm:py-32 pt-20 sm:pt-32 bg-gradient-to-br from-[#212E3E] via-[#212E3E] to-[#212E3E]/90 text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/assets/image/photo_1_2025-09-19_23-11-01.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-[#212E3E]/80" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90 text-lg px-6 py-2">
            Interview Scheduling
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 text-balance">
            Schedule Your
            <span className="block text-[#E5C985]">Interview</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto text-pretty leading-relaxed px-4">
            Congratulations on being accepted! Please select a convenient date and time for your in-person interview with our ministry team.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <Calendar className="w-5 h-5 text-[#E5C985] flex-shrink-0" />
              <span className="text-sm sm:text-base">Choose Date</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <Clock className="w-5 h-5 text-[#E5C985] flex-shrink-0" />
              <span className="text-sm sm:text-base">Select Time</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <MapPin className="w-5 h-5 text-[#E5C985] flex-shrink-0" />
              <span className="text-sm sm:text-base">Confirm Location</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
