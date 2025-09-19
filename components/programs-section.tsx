import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, ArrowRight } from "lucide-react"

export function ProgramsSection() {
  const programs = [
    {
      title: "Worship Leader Certification",
      description: "Comprehensive 6-month program covering biblical worship, music theory, and leadership skills.",
      duration: "6 months",
      participants: "25 students",
      nextStart: "March 2024",
      image: "/assets/image/photo_7_2025-09-19_23-11-01.jpg",
      badge: "Popular",
      badgeVariant: "default" as const,
    },
    {
      title: "Traditional Music Preservation",
      description: "Learn and preserve Ethiopian traditional worship music and instruments for future generations.",
      duration: "3 months",
      participants: "15 students",
      nextStart: "April 2024",
      image: "/assets/image/photo_8_2025-09-19_23-11-01.jpg",
      badge: "Cultural",
      badgeVariant: "secondary" as const,
    },
    {
      title: "Youth Worship Training",
      description: "Specialized program for young musicians and worship leaders aged 16-25.",
      duration: "4 months",
      participants: "30 students",
      nextStart: "May 2024",
      image: "/assets/image/photo_9_2025-09-19_23-11-01.jpg",
      badge: "Youth Focus",
      badgeVariant: "outline" as const,
    },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Training Programs</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Discover our comprehensive training programs designed to equip worship leaders with the skills and knowledge
            they need to serve their communities effectively.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30"
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <div
                  className="aspect-[4/3] bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{ backgroundImage: `url('${program.image}')` }}
                />
                <Badge variant={program.badgeVariant} className="absolute top-4 left-4">
                  {program.badge}
                </Badge>
              </div>

              <CardHeader>
                <CardTitle className="text-xl text-card-foreground group-hover:text-primary transition-colors">
                  {program.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-pretty">{program.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    Duration: {program.duration}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    Class Size: {program.participants}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    Next Start: {program.nextStart}
                  </div>
                </div>

                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Programs
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
