import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock } from "lucide-react"

export function EventsHeroSection() {
  const upcomingHighlight = {
    title: "Annual Worship Leaders Conference 2024",
    date: "March 15-17, 2024",
    location: "Addis Ababa, Ethiopia",
    attendees: "200+ Expected",
    time: "9:00 AM - 5:00 PM",
  }

  return (
    <section className="relative py-24 sm:py-32 bg-gradient-to-br from-[#212E3E] via-[#212E3E] to-[#212E3E]/90 text-white overflow-hidden ">
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
      
      {/* Background pattern */}
      {/* <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border border-[#E5C985] rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 border border-[#E5C985] rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-[#E5C985] rounded-full"></div>
      </div> */}

      <div className="container mx-auto px-4 relative z-10 pt-16 sm:pt-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div>
            <Badge className="mb-6 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90 text-lg px-6 py-2">
              Events & Conferences
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 text-balance">
              Join Us for
              <span className="block text-[#E5C985]">Transformative Events</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-12 text-pretty leading-relaxed">
              Experience powerful worship, learn from expert teachers, and connect with fellow worship leaders at our
              conferences, workshops, and special events throughout the year.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Button size="lg" className="bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E] text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                View All Events
              </Button>
              {/* <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#212E3E] text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-transparent w-full sm:w-auto"
              >
                Register Now
              </Button> */}
            </div>
          </div>

          {/* <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20">
            <div className="text-center mb-6">
              <Badge className="bg-[#E5C985] text-[#212E3E] mb-4">Next Event</Badge>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">{upcomingHighlight.title}</h3>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#E5C985] flex-shrink-0" />
                <span className="text-sm sm:text-base">{upcomingHighlight.date}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#E5C985] flex-shrink-0" />
                <span className="text-sm sm:text-base">{upcomingHighlight.time}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#E5C985] flex-shrink-0" />
                <span className="text-sm sm:text-base">{upcomingHighlight.location}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#E5C985] flex-shrink-0" />
                <span className="text-sm sm:text-base">{upcomingHighlight.attendees}</span>
              </div>
            </div>

            <Button className="w-full mt-4 sm:mt-6 bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E]">
              Register for This Event
            </Button>
          </div> */}
        </div>
      </div>
    </section>
  )
}
