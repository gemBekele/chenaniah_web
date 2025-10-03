"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Play } from "lucide-react"
import { PhotoGalleryModal } from "@/components/photo-gallery-modal"

export function PastEventsSection() {
  const [galleryModal, setGalleryModal] = useState<{
    isOpen: boolean
    photos: string[]
    eventTitle: string
  }>({
    isOpen: false,
    photos: [],
    eventTitle: ""
  })

  const openGallery = (photos: string[], eventTitle: string) => {
    setGalleryModal({
      isOpen: true,
      photos,
      eventTitle
    })
  }

  const closeGallery = () => {
    setGalleryModal({
      isOpen: false,
      photos: [],
      eventTitle: ""
    })
  }

  const pastEvents = [
    {
      id: 1,
      title: "Matsnanatih worship Night",
      description:
        "A night of worship with Zeritu Kebede, that was attended by thousands of people.",
      date: "November 10-12, 2023",
      location: "Beza International church",
      attendees: "5000+ Participants",
      type: "Conference",
      rating: 4.9,
      highlights: ["Zeritu Kebede", "Illasha Fekadu", "Hana Tekle"],
      resources: {
        photos: 45,
        videos: 8,
        recordings: 12,
      },
      image: "/assets/image/photo_15_2025-09-19_23-11-01.jpg",
      photos: [
        "/assets/image/photo_10_2025-09-19_23-11-01.jpg",
        "/assets/image/photo_11_2025-09-19_23-11-01.jpg",
        "/assets/image/photo_12_2025-09-19_23-11-01.jpg",
        "/assets/image/photo_13_2025-09-19_23-11-01.jpg",
        "/assets/image/photo_14_2025-09-19_23-11-01.jpg",
        "/assets/image/photo_15_2025-09-19_23-11-01.jpg",
      ],
      featured: true,
    },
    // {
    //   id: 2,
    //   title: "Traditional Instruments Workshop",
    //   description: "Hands-on training with traditional Ethiopian instruments including harps, drums, and flutes.",
    //   date: "September 15, 2023",
    //   location: "Chenaniah Training Center",
    //   attendees: "45 Participants",
    //   type: "Workshop",
    //   rating: 4.8,
    //   highlights: ["Traditional Harp Techniques", "Cultural Context Teaching", "Instrument Crafting Demo"],
    //   resources: {
    //     photos: 28,
    //     videos: 3,
    //     recordings: 5,
    //   },
    //   image: "/ethiopian-traditional-harps-and-musical-instrument.jpg",
    //   featured: false,
    // },
    // {
    //   id: 3,
    //   title: "Youth Worship Training",
    //   description:
    //     "Empowering the next generation of worship leaders through biblical foundation and practical skills.",
    //   date: "August 5-6, 2023",
    //   location: "St. Gabriel Church",
    //   attendees: "85 Youth",
    //   type: "Training",
    //   rating: 4.7,
    //   highlights: ["Youth Leadership Development", "Modern Worship Techniques", "Mentorship Program Launch"],
    //   resources: {
    //     photos: 32,
    //     videos: 4,
    //     recordings: 7,
    //   },
    //   image: "/ethiopian-church-congregation-worshiping-with-rais.jpg",
    //   featured: false,
    // },
    // {
    //   id: 4,
    //   title: "Biblical Worship Foundations Seminar",
    //   description:
    //     "Deep dive into the scriptural basis of worship and its practical application in modern church settings.",
    //   date: "June 20, 2023",
    //   location: "Online (Zoom)",
    //   attendees: "150 Online",
    //   type: "Seminar",
    //   rating: 4.6,
    //   highlights: ["Scripture-Based Teaching", "Interactive Q&A Sessions", "Resource Library Access"],
    //   resources: {
    //     photos: 12,
    //     videos: 6,
    //     recordings: 8,
    //   },
    //   image: "/ethiopian-pastor-teaching-biblical-worship-princip.jpg",
    //   featured: false,
    // },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">Past Events</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">
            Celebrating Our Journey Together
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            Relive the powerful moments from our past events and access recordings, photos, and resources from
            conferences and workshops that have shaped our worship community.
          </p>
        </div>

        <div className="space-y-8">
          {pastEvents.map((event) => (
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
                  <div className="lg:col-span-1 relative">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-64 lg:h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-black/70 text-white">Past Event</Badge>
                    </div>
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
                          {event.featured && <Badge className="bg-[#212E3E] text-white">Featured</Badge>}
                          {/* <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-[#E5C985] text-[#E5C985]" />
                            <span className="text-sm font-semibold text-[#212E3E]">{event.rating}</span>
                          </div> */}
                        </div>
                        <h3 className="text-2xl font-bold text-[#212E3E] mb-2">{event.title}</h3>
                        <p className="text-gray-600 mb-6 text-pretty">{event.description}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 text-gray-600">
                          <Calendar className="w-5 h-5 text-[#E5C985]" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600">
                          <MapPin className="w-5 h-5 text-[#E5C985]" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600">
                          <Users className="w-5 h-5 text-[#E5C985]" />
                          <span>{event.attendees}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#212E3E] mb-3">Event Highlights</h4>
                        <ul className="space-y-1">
                          {event.highlights.map((highlight, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-[#E5C985] rounded-full"></div>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-[#212E3E] mb-3">Available Resources</h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-[#E5C985]">{event.resources.photos}</div>
                          <div className="text-sm text-gray-600">Photos</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-[#E5C985]">{event.resources.videos}</div>
                          <div className="text-sm text-gray-600">Videos</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-[#E5C985]">{event.resources.recordings}</div>
                          <div className="text-sm text-gray-600">Recordings</div>
                        </div>
                      </div>
                    </div> */}

                    <div className="flex flex-wrap gap-3">
                      <Button size="sm" className="bg-[#212E3E] hover:bg-[#212E3E]/90 text-white">
                        <Play className="w-4 h-4 mr-2" />
                        Watch Highlights
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white bg-transparent"
                        onClick={() => openGallery(event.photos, event.title)}
                      >
                        View Photos
                      </Button>
                      {/* <Button
                        size="sm"
                        variant="outline"
                        className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white bg-transparent"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Resources
                      </Button> */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white bg-transparent"
          >
            View Complete Event Archive
          </Button>
        </div> */}
      </div>

      {/* Photo Gallery Modal */}
      <PhotoGalleryModal
        isOpen={galleryModal.isOpen}
        onClose={closeGallery}
        photos={galleryModal.photos}
        eventTitle={galleryModal.eventTitle}
      />
    </section>
  )
}
