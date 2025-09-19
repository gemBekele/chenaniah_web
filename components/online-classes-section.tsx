import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, BookOpen, Video } from "lucide-react"

export function OnlineClassesSection() {
  const classes = [
    {
      title: "Biblical Worship Foundations",
      description: "Learn the theological foundations of worship through Scripture study and practical application.",
      duration: "8 weeks",
      students: "150+",
      level: "Beginner",
      features: ["Live sessions", "Recorded lessons", "Study materials", "Certificate"],
    },
    {
      title: "Advanced Harp Techniques",
      description: "Master advanced playing techniques and worship leading skills on the harp.",
      duration: "12 weeks",
      students: "75+",
      level: "Advanced",
      features: ["One-on-one mentoring", "Performance opportunities", "Sheet music library"],
    },
    {
      title: "Worship Team Leadership",
      description: "Develop leadership skills for guiding worship teams and congregational worship.",
      duration: "6 weeks",
      students: "200+",
      level: "Intermediate",
      features: ["Leadership training", "Team dynamics", "Conflict resolution"],
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#E5C985]/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">Online Learning</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">
            Transform Your Worship Ministry Online
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            Join thousands of worship leaders worldwide in our comprehensive online courses designed to deepen your
            biblical understanding and enhance your musical skills.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {classes.map((course, index) => (
            <Card
              key={index}
              className="border-2 border-gray-100 hover:border-[#E5C985] transition-all duration-300 hover:shadow-xl"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-[#212E3E] border-[#212E3E]">
                    {course.level}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {course.students}
                  </div>
                </div>
                <CardTitle className="text-xl text-[#212E3E]">{course.title}</CardTitle>
                <CardDescription className="text-gray-600">{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4 text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  {course.duration}
                </div>
                <ul className="space-y-2 mb-6">
                  {course.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 mr-2 text-[#E5C985]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-[#212E3E] hover:bg-[#212E3E]/90 text-white">
                  <Video className="w-4 h-4 mr-2" />
                  Enroll Now
                </Button>
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
            View All Courses
          </Button>
        </div>
      </div>
    </section>
  )
}
