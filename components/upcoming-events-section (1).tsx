import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock, ExternalLink } from "lucide-react"
import { EventRegistrationModal } from "@/components/event-registration-modal"

export function UpcomingEventsSection() {
  const events = [
    {
      id: 1,
      title: "Annual Worship Leaders Conference 2024",
      description:
        "Three days of intensive training, worship, and fellowship with worship leaders from across Ethiopia.",
      date: "March 15-17, 2024",
      time: "9:00 AM - 5:00 PM",
      location: "Addis Ababa Conference Center",
      attendees: "200+ Expected",
      price: "Free",
      type: "Conference",
      featured: true,
      image: "/ethiopian-worship-leaders-training-with-harps-and-.jpg",
    },
    {
      id: 2,
      title: "Harp Masterclass Workshop",
      description: "Advanced techniques and worship applications for experienced harp players.",
      date: "February 10, 2024",
      time: "2:00 PM - 6:00 PM",
      location: "Chenaniah Training Center",
      attendees: "30 Max",
      price: "$25",
      type: "Workshop",
      featured: false,
      image: "/ethiopian-traditional-harps-and-musical-instrument.jpg",
    },
    {
      id: 3,
      title: "Biblical Worship Seminar",
      description: "Exploring the theological foundations of worship through Scripture study.",
      date: "January 28, 2024",
      time: "10:00 AM - 4:00 PM",
      location: "Online (Zoom)",
      attendees: "Unlimited",
      price: "Free",
      type: "Seminar",
      featured: false,
      image: "/ethiopian-pastor-teaching-biblical-worship-princip.jpg",
    },
    {
      id: 4,
      title: "Community Worship Night",
      description: "Join us for an evening of worship, prayer, and community fellowship.",
      date: "January 20, 2024",
      time: "7:00 PM - 9:00 PM",
      location: "St. Mary's Church",
      attendees: "All Welcome",
      price: "Free",
      type: "Worship",
      featured: false,
      image: "/ethiopian-church-congregation-worshiping-with-rais.jpg",
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">Upcoming Events</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">
            Don't Miss These Opportunities
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            Mark your calendar for these upcoming events designed to strengthen your worship ministry and connect you
            with fellow believers.
          </p>
        </div>

        <div className="space-y-8">
          {events.map((event, index) => (
            <Card
              key={event.id}
              className={`border-2 transition-all duration-300 hover:shadow-xl ${
                event.featured
                  ? "border-[#E5C985] bg-gradient-to-r from-[#E5C985]/5 to-white"
                  : "border-gray-100 hover:border-[#E5C985]"
              }`}
            >
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-3 gap-0">
                  <div className="lg:col-span-1">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-64 lg:h-full object-cover"
                    />
                  </div>
                  <div className="lg:col-span-2 p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-4 mb-2">
                          <Badge
                            variant={event.featured ? "default" : "outline"}
                            className={
                              event.featured ? "bg-[#E5C985] text-[#212E3E]" : "text-[#212E3E] border-[#212E3E]"
                            }
                          >
                            {event.type}
                          </Badge>
                          {event.featured && <Badge className="bg-[#212E3E] text-white">Featured Event</Badge>}
                        </div>
                        <h3 className="text-2xl font-bold text-[#212E3E] mb-2">{event.title}</h3>
                        <p className="text-gray-600 mb-6 text-pretty">{event.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#E5C985]">{event.price}</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 text-gray-600">
                          <Calendar className="w-5 h-5 text-[#E5C985]" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600">
                          <Clock className="w-5 h-5 text-[#E5C985]" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 text-gray-600">
                          <MapPin className="w-5 h-5 text-[#E5C985]" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600">
                          <Users className="w-5 h-5 text-[#E5C985]" />
                          <span>{event.attendees}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <EventRegistrationModal
                        event={{
                          title: event.title,
                          date: event.date,
                          time: event.time,
                          location: event.location,
                          price: event.price,
                          type: event.type,
                        }}
                      >
                        <Button
                          size="lg"
                          className={
                            event.featured
                              ? "bg-[#212E3E] hover:bg-[#212E3E]/90 text-white"
                              : "bg-[#212E3E] hover:bg-[#212E3E]/90 text-white"
                          }
                        >
                          Register Now
                        </Button>
                      </EventRegistrationModal>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white bg-transparent"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white bg-transparent"
          >
            View All Upcoming Events
          </Button>
        </div>
      </div>
    </section>
  )
}
