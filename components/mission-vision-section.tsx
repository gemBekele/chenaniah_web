import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Eye, Heart, Book } from "lucide-react"

export function MissionVisionSection() {
  const values = [
    {
      icon: Book,
      title: "Biblical Foundation",
      description:
        "All our training is rooted in Scripture, ensuring worship leaders understand the theological basis of their ministry.",
    },
    {
      icon: Heart,
      title: "Cultural Sensitivity",
      description:
        "We honor Ethiopian culture while maintaining biblical principles, creating authentic worship culture.",
    },
    {
      icon: Target,
      title: "Excellence in Ministry",
      description: "We strive for the highest standards in musical and spiritual formation for lasting kingdom impact.",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">Our Mission</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">
              Transforming Worship Through Biblical Training
            </h2>
            <p className="text-lg text-gray-600 mb-8 text-pretty leading-relaxed">
              Our mission is to equip worship leaders across Ethiopia with solid biblical foundation, musical
              excellence, and spiritual maturity. We believe that when worship leaders are properly trained, entire
              congregations are transformed, and God's kingdom advances throughout our nation.
            </p>
            <div className="flex items-center space-x-4">
              <Target className="w-8 h-8 text-[#E5C985]" />
              <span className="text-[#212E3E] font-semibold">Equipping leaders for lasting impact</span>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-[#E5C985]/20 to-[#212E3E]/10 rounded-2xl p-0 h-80">
              <img
                src="/assets/image/about.jpg"
                alt="Worship leaders in training"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="lg:order-2">
            <Badge className="mb-4 bg-[#212E3E] text-white hover:bg-[#212E3E]/90">Our Vision</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">
              A Nation Transformed Through Worship
            </h2>
            <p className="text-lg text-gray-600 mb-8 text-pretty leading-relaxed">
              We envision every church in Ethiopia having skilled, biblically-grounded worship leaders who can guide
              their congregations into authentic, Spirit-filled worship. Through our training programs, we aim to see a
              generation of worship leaders who understand both the heart of worship and the excellence it deserves.
            </p>
            <div className="flex items-center space-x-4">
              <Eye className="w-8 h-8 text-[#E5C985]" />
              <span className="text-[#212E3E] font-semibold">Transforming churches across Ethiopia</span>
            </div>
          </div>

          <div className="lg:order-1 relative">
            <div className="bg-gradient-to-br from-[#212E3E]/10 to-[#E5C985]/20 rounded-2xl p-0 h-80">
              <img
                src="/assets/image/photo_2_2025-10-03_16-43-26.jpg"
                alt="Church congregation in worship"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-[#212E3E] mb-4">Our Core Values</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            These principles guide everything we do in our mission to equip worship leaders
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon
            return (
              <Card
                key={index}
                className="border-2 border-gray-100 hover:border-[#E5C985] transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-[#E5C985]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-[#E5C985]" />
                  </div>
                  <CardTitle className="text-xl text-[#212E3E]">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center text-pretty">{value.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
