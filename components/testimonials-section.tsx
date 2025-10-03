"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      name: "Pastor Samuel Tadesse",
      role: "Senior Pastor, Bethel Church Addis Ababa",
      content:
        "I’m so glad I came. 🎶 It was actually my first concert, and I feel so blessed and inspired. Thank you again for the invitation. God bless  you and your ministry. I hope we’ll meet soon ✨.Blessings 😊",
      image: "/assets/image/photo_4_2025-09-19_23-11-01.jpg",
    },
    {
      name: "Sister Meron Bekele",
      role: "Worship Leader, Grace Fellowship",
      content: "በነገር ሁሉ እንኳን ጌታ ተገኘላቹ ረዳቹ በእናንተ ስኬት እናንተ ላይ ስላለዉ ፀጋ ጌታን አመሰገንኩ በእዉነት ትላንትን አስታወስኩ 😢ጌታ ይመስገን ስሜቴን መቆጣጠር አቅቶኝ 🥲ነበር ጌታ ይችላል ምንም በሌለበት እሱ ይታመናል 🫢እንኳንም ጌታ አከበራቹ ለምልሙ ብዙ እወዳችዋለሁ።",
      image: "/assets/image/photo_5_2025-09-19_23-11-01.jpg",
    },
  
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4">Testimonials</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Hear from the people who have been part of our ministry.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/20 shadow-xl">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                <Quote className="h-12 w-12 text-primary mx-auto mb-6" />

                <blockquote className="text-xl md:text-2xl text-card-foreground mb-8 text-balance font-light">
                  "{testimonials[currentIndex].content}"
                </blockquote>

                <div className="flex items-center justify-center space-x-4">
                  {/* <div
                    className="w-16 h-16 rounded-full bg-cover bg-center border-2 border-primary"
                    style={{ backgroundImage: `url('${testimonials[currentIndex].image}')` }}
                  /> */}
                  {/* <div className="text-left">
                    <div className="font-semibold text-card-foreground">{testimonials[currentIndex].name}</div>
                    <div className="text-muted-foreground">{testimonials[currentIndex].role}</div>
                  </div> */}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            <Button variant="outline" size="sm" onClick={prevTestimonial} className="rounded-full bg-transparent">
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={nextTestimonial} className="rounded-full bg-transparent">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
