"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      content:
        "I'm so glad I came. 🎶 It was actually my first concert, and I feel so blessed and inspired. Thank you again for the invitation. God bless  you and your ministry. I hope we'll meet soon ✨.Blessings 😊",
    },
    {
      content:
        "በነገር ሁሉ እንኳን ጌታ ተገኘላቹ ረዳቹ በእናንተ ስኬት እናንተ ላይ ስላለዉ ፀጋ ጌታን አመሰገንኩ በእዉነት ትላንትን አስታወስኩ 😢ጌታ ይመስገን ስሜቴን መቆጣጠር አቅቶኝ 🥲ነበር ጌታ ይችላል ምንም በሌለበት እሱ ይታመናል 🫢እንኳንም ጌታ አከበራቹ ለምልሙ ብዙ እወዳችዋለሁ።",
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
    <section className="py-24 sm:py-32 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-sm font-medium tracking-wider text-muted-foreground uppercase mb-4">Testimonials</h2>
          <p className="text-3xl sm:text-4xl md:text-5xl font-light text-foreground max-w-3xl mx-auto text-balance leading-tight">
            Hear from our community
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative px-8 sm:px-12 md:px-16">
             <blockquote className="text-lg sm:text-xl md:text-2xl text-foreground/90 text-center font-extralight leading-tight italic">
               <p className="text-balance">"{testimonials[currentIndex].content}"</p>
             </blockquote>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 sm:mt-16">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevTestimonial}
              className="h-10 w-10 rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                   className={`rounded-full transition-all duration-300 cursor-pointer ${
                     index === currentIndex
                       ? "w-8 bg-foreground"
                       : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                   }`}
                   style={{ height: '8px' }}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextTestimonial}
              className="h-10 w-10 rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
