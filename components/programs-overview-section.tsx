import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Music, Users, Heart, Clock, Star } from "lucide-react"

export function ProgramsOverviewSection() {
  const programs = [
    {
      id: "biblical-foundations",
      title: "Biblical Worship Foundations",
      description:
        "Comprehensive study of worship from a biblical perspective, covering theology, history, and practical application.",
      duration: "8 weeks",
      level: "Beginner",
      format: "Online & In-Person",
      price: "Free",
      features: [
        "Scripture-based curriculum",
        "Historical worship study",
        "Practical application",
        "Certificate of completion",
      ],
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      id: "harp-mastery",
      title: "Advanced Harp Techniques",
      description:
        "Master traditional and contemporary harp playing techniques with focus on worship leading and performance.",
      duration: "12 weeks",
      level: "Intermediate",
      format: "In-Person",
      price: "$150",
      features: [
        "One-on-one instruction",
        "Traditional techniques",
        "Contemporary styles",
        "Performance opportunities",
      ],
      icon: Music,
      color: "bg-purple-500",
    },
    {
      id: "team-leadership",
      title: "Worship Team Leadership",
      description:
        "Develop skills for leading worship teams, managing dynamics, and creating effective worship experiences.",
      duration: "6 weeks",
      level: "Advanced",
      format: "Hybrid",
      price: "$100",
      features: ["Leadership principles", "Team dynamics", "Conflict resolution", "Worship planning"],
      icon: Users,
      color: "bg-green-500",
    },
    {
      id: "spiritual-formation",
      title: "Spiritual Formation for Worship Leaders",
      description: "Focus on personal spiritual growth and character development essential for worship ministry.",
      duration: "10 weeks",
      level: "All Levels",
      format: "Online",
      price: "Free",
      features: ["Personal devotion", "Character development", "Ministry ethics", "Spiritual disciplines"],
      icon: Heart,
      color: "bg-red-500",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">Our Programs</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">Choose Your Learning Path</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            Our carefully designed programs cater to different skill levels and ministry needs, ensuring every worship
            leader finds the right training for their journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {programs.map((program, index) => {
            const IconComponent = program.icon
            return (
              <Card
                key={program.id}
                className="border-2 border-gray-100 hover:border-[#E5C985] transition-all duration-300 hover:shadow-xl"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 ${program.color} rounded-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <Badge variant="outline" className="text-[#212E3E] border-[#212E3E] mb-2">
                          {program.level}
                        </Badge>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {program.duration}
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            {program.format}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#E5C985]">{program.price}</div>
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-[#212E3E]">{program.title}</CardTitle>
                  <CardDescription className="text-gray-600 text-lg">{program.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {program.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-[#E5C985] rounded-full mr-3"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-4">
                    <Button className="flex-1 bg-[#212E3E] hover:bg-[#212E3E]/90 text-white">Learn More</Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white bg-transparent"
                    >
                      Enroll Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center bg-[#212E3E] rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Not Sure Which Program is Right for You?</h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Our admissions team can help you choose the perfect program based on your experience level, goals, and
            ministry context.
          </p>
          <Button size="lg" className="bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E]">
            Schedule a Consultation
          </Button>
        </div>
      </div>
    </section>
  )
}
