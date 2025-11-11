"use client"


import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/assets/image/photo_1_2025-09-19_23-11-01.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4  text-center max-w-4xl">
        {/* Logo */}
        {/* <div className="mb-8">
          <Image
            src="/assets/logo/Asset 2@4x.png"
            alt="Chenaniah.org Logo"
            width={200}
            height={67}
            className="h-16 w-auto mx-auto brightness-0 invert"
          />
        </div> */}

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 text-balance">
          Empowering worship leaders and musicians
          <span className="text-primary block mt-2">to grow in faith and musical excellence.</span>
        </h1>

        <p className="text-base sm:text-lg md:text-md text-white/90 mb-8 max-w-2xl mx-auto text-pretty px-4">
          We are dedicated to raising a generation of church musicians, singers, and worship leaders, grounded in biblical worship and committed to musical excellence.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto" onClick={() => window.open("https://t.me/Chenaniah_Screening_Bot", "_blank")}>
            Join the choir
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-foreground bg-transparent w-full sm:w-auto"
            onClick={() => window.open("https://youtube.com/shorts/03v5s5SfO7A?si=pDbY4FTuK-yaO7d_", "_blank")}
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Our Story
          </Button>
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/20">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-white/80">Musicians Trained</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50+</div>
            <div className="text-white/80">Churches Served</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">10+</div>
            <div className="text-white/80">Years of Ministry</div>
          </div> */}
        {/* </div> */}
      </div>
    </section>
  )
}
