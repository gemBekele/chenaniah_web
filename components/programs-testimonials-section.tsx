"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Quote, Play, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

export function ProgramsTestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: "Sarah Tadesse",
      role: "Worship Leader",
      church: "Bethel Church, Addis Ababa",
      program: "Worship Leadership Development",
      rating: 5,
      quote:
        "The Worship Leadership Development program transformed not just my skills, but my entire understanding of what it means to lead people into God's presence. The combination of biblical foundation and practical training was exactly what I needed.",
      image: "/ethiopian-female-musician-with-harp-and-traditiona.jpg",
      videoTestimonial: true,
      completionYear: "2023",
      featured: true,
    },
    {
      id: 2,
      name: "Daniel Bekele",
      role: "Music Director",
      church: "St. Mary's Cathedral",
      program: "Traditional Ethiopian Instruments Mastery",
      rating: 5,
      quote:
        "Learning traditional Ethiopian instruments through Chenaniah opened up a whole new dimension of worship for our congregation. The cultural and spiritual context provided made all the difference in authentic ministry.",
      image: "/ethiopian-pastor-and-worship-leader-with-warm-smil.jpg",
      videoTestimonial: false,
      completionYear: "2023",
      featured: false,
    },
    {
      id: 3,
      name: "Ruth Alemayehu",
      role: "Youth Pastor",
      church: "New Life Fellowship",
      program: "Biblical Foundations of Worship",
      rating: 5,
      quote:
        "As someone new to worship ministry, this program gave me the theological grounding I desperately needed. Now I can teach our youth not just how to worship, but why we worship and what Scripture says about it.",
      image: "/ethiopian-church-congregation-worshiping-with-rais.jpg",
      videoTestimonial: true,
      completionYear: "2024",
      featured: false,
    },
    {
      id: 4,
      name: "Michael Haile",
      role: "Senior Pastor",
      church: "Grace Community Church",
      program: "Music Theory for Worship Musicians",
      rating: 5,
      quote:
        "Even as a pastor, understanding music theory has helped me better communicate with our worship team and make more informed decisions about our worship services. The course was accessible yet thorough.",
      image: "/ethiopian-pastor-teaching-biblical-worship-princip.jpg",
      videoTestimonial: false,
      completionYear: "2023",
      featured: false,
    },
    {
      id: 5,
      name: "Hanna Girma",
      role: "Worship Team Member",
      church: "Evangelical Church",
      program: "Traditional Ethiopian Instruments Mastery",
      rating: 5,
      quote:
        "The harp training I received has not only improved my technical skills but deepened my spiritual connection to worship. Our church now incorporates traditional elements that bring such richness to our services.",
      image: "/ethiopian-traditional-harps-and-musical-instrument.jpg",
      videoTestimonial: true,
      completionYear: "2024",
      featured: true,
    },
  ]

  const stats = [
    { number: "500+", label: "Program Graduates" },
    { number: "95%", label: "Completion Rate" },
    { number: "4.9/5", label: "Average Rating" },
    { number: "150+", label: "Churches Served" },
  ]

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const currentTestimonialData = testimonials[currentTestimonial]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">Student Success Stories</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">
            Transformed Lives, Transformed Ministries
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            Hear from graduates who have experienced growth in their worship ministry through our comprehensive training
            programs.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-[#E5C985] mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Featured Testimonial */}
        <Card className="border-2 border-[#E5C985] bg-gradient-to-r from-[#E5C985]/5 to-white mb-16">
          <CardContent className="p-8">
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-1 text-center">
                <img
                  src={currentTestimonialData.image || "/placeholder.svg"}
                  alt={currentTestimonialData.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold text-[#212E3E] mb-1">{currentTestimonialData.name}</h3>
                <p className="text-gray-600 mb-1">{currentTestimonialData.role}</p>
                <p className="text-sm text-gray-500 mb-3">{currentTestimonialData.church}</p>
                <div className="flex justify-center space-x-1 mb-3">
                  {[...Array(currentTestimonialData.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#E5C985] text-[#E5C985]" />
                  ))}
                </div>
                <Badge className="bg-[#212E3E] text-white text-xs">{currentTestimonialData.program}</Badge>
              </div>
              <div className="lg:col-span-2">
                <Quote className="w-12 h-12 text-[#E5C985] mb-4" />
                <blockquote className="text-lg text-gray-700 mb-6 italic leading-relaxed">
                  "{currentTestimonialData.quote}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">Graduated: {currentTestimonialData.completionYear}</div>
                  <div className="flex space-x-4">
                    {currentTestimonialData.videoTestimonial && (
                      <Button size="sm" className="bg-[#212E3E] hover:bg-[#212E3E]/90 text-white">
                        <Play className="w-4 h-4 mr-2" />
                        Watch Video
                      </Button>
                    )}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={prevTestimonial}
                        className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white bg-transparent"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={nextTestimonial}
                        className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white bg-transparent"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials
            .filter((_, index) => index !== currentTestimonial)
            .slice(0, 6)
            .map((testimonial) => (
              <Card key={testimonial.id} className="border border-gray-200 hover:border-[#E5C985] transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-[#212E3E]">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#E5C985] text-[#E5C985]" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">"{testimonial.quote}"</p>
                  <Badge className="bg-[#E5C985] text-[#212E3E] text-xs">{testimonial.program}</Badge>
                </CardContent>
              </Card>
            ))}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            variant="outline"
            className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white bg-transparent"
          >
            Read More Success Stories
          </Button>
        </div>
      </div>
    </section>
  )
}
