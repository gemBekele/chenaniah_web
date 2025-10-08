import { Card, CardContent } from "@/components/ui/card"
import { Music, Users, Heart, Award } from "lucide-react"

export function AboutSection() {
  const features = [
    {
      icon: Music,
      title: "Musical Excellence",
      description: "Training worship leaders in both traditional Ethiopian music and contemporary worship styles.",
    },
    {
      icon: Users,
      title: "Community Building",
      description: "Connecting musicians and worship leaders across Ethiopia to share knowledge and experiences.",
    },
    {
      icon: Heart,
      title: "Biblical Foundation",
      description: "Grounding all our training in biblical principles of worship and spiritual growth.",
    },
    {
      icon: Award,
      title: "Cultural Integrity",
      description: "Honoring Ethiopian culture while maintaining biblical principles.",
    },
  ]

  return (
    <section className="py-16 sm:py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Content */}
          <div className="flex flex-col justify-center">
            {/* <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-6">
              Inspired by Chenaniah, the Biblical Worship Leader
            </h2> */}
            <p className="text-base sm:text-lg text-muted-foreground mb-6 text-pretty">
              Named after Chenaniah, the Levite musician from 1 Chronicles 15:22, our ministry is dedicated to equipping
              church musicians, singers, and worship leaders throughout Ethiopia and beyond. We believe in the power of
              worship to transform lives and communities.
            </p>
            {/* <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Through comprehensive training programs, resources, events, and partnerships, we're building a network of
              skilled worship leaders who can guide their congregations in meaningful, biblical worship experiences.
            </p> */}

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card key={index} className="border-primary/20">
                  <CardContent className="p-4">
                    <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-card-foreground mb-2 text-sm sm:text-base">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative h-full">
            <div className="h-full rounded-lg overflow-hidden shadow-2xl">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('/assets/image/photo_3_2025-10-03_16-43-26.jpg')`,
                }}
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary/20 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
