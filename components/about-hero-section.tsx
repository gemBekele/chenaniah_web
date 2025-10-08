import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"

export function AboutHeroSection() {
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
      
      {/* Background pattern
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border border-[#E5C985] rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 border border-[#E5C985] rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-[#E5C985] rounded-full"></div>
      </div> */}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* <Badge className="mb-6 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90 text-lg px-6 py-2">
            About Chenaniah
          </Badge> */}

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 text-balance">
            Equipping Worship Leaders
            <span className="block text-[#E5C985]">Across Ethiopia</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto text-pretty leading-relaxed px-4">
            Since our founding, we have been dedicated to training worship leaders through biblical education, musical
            excellence, and spiritual formation, impacting churches throughout Ethiopia and beyond.
          </p>

          {/* <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button size="lg" className="bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E] text-lg px-8 py-4">
              Our Impact
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#212E3E] text-lg px-8 py-4 bg-transparent"
            >
              Meet Our Team
            </Button>
          </div> */}

          <div className="animate-bounce">
            <ArrowDown className="w-8 h-8 mx-auto text-[#E5C985]" />
          </div>
        </div>
      </div>
    </section>
  )
}
