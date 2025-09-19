import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
import { BookOpen, Download, Music, Video } from "lucide-react"

export function ResourcesHeroSection() {
  const resourceStats = [
    { icon: BookOpen, value: "50+", label: "Study Guides" },
    { icon: Music, value: "100+", label: "Sheet Music" },
    { icon: Video, value: "25+", label: "Video Lessons" },
    { icon: Download, value: "1000+", label: "Downloads" },
  ]

  return (
    <section className="relative py-32 bg-gradient-to-br from-[#212E3E] via-[#212E3E] to-[#212E3E]/90 text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/assets/image/photo_4_2025-09-19_23-11-01.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-[#212E3E]/80" />
      </div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border border-[#E5C985] rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 border border-[#E5C985] rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-[#E5C985] rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge className="mb-6 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90 text-lg px-6 py-2">
            Resources & Materials
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-balance">
            Equip Your Ministry
            <span className="block text-[#E5C985]">With Quality Resources</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto text-pretty leading-relaxed">
            Access our comprehensive library of worship resources. 
          </p>

          {/* <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E] text-lg px-8 py-4">
              Browse Resources
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#212E3E] text-lg px-8 py-4 bg-transparent"
            >
              Free Downloads
            </Button>
          </div> */}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8">
          {resourceStats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#E5C985]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-8 h-8 text-[#E5C985]" />
                </div>
                <div className="text-3xl font-bold text-[#E5C985] mb-2">{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
