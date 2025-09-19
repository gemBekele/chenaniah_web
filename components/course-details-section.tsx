import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, BookOpen, Award, Calendar, CheckCircle } from "lucide-react"

export function CourseDetailsSection() {
  const courses = [
    {
      id: 1,
      title: "Biblical Foundations of Worship",
      duration: "8 weeks",
      level: "Beginner",
      students: "25 max",
      format: "Online + In-Person",
      description:
        "Explore the scriptural basis of worship, understanding God's heart for worship through Old and New Testament teachings.",
      modules: [
        "Worship in the Old Testament",
        "New Testament Worship Principles",
        "The Heart of a Worshipper",
        "Worship and Prayer Integration",
        "Leading Others in Worship",
        "Cultural Context of Biblical Worship",
        "Modern Application of Ancient Principles",
        "Final Project: Worship Service Design",
      ],
      prerequisites: "Basic Bible knowledge recommended",
      certification: "Certificate of Completion",
      featured: true,
    },
    {
      id: 2,
      title: "Traditional Ethiopian Instruments Mastery",
      duration: "12 weeks",
      level: "Intermediate",
      students: "15 max",
      format: "In-Person Only",
      description:
        "Master traditional Ethiopian instruments including harps, drums, and flutes with cultural and spiritual context.",
      modules: [
        "History of Ethiopian Sacred Music",
        "Harp Techniques and Tuning",
        "Traditional Drum Patterns",
        "Flute and Wind Instruments",
        "Ensemble Playing",
        "Cultural Significance and Meaning",
        "Instrument Maintenance and Care",
        "Performance and Ministry Application",
        "Teaching Others Traditional Techniques",
        "Recording and Documentation",
        "Community Performance Preparation",
        "Final Recital",
      ],
      prerequisites: "Basic musical experience required",
      certification: "Master Craftsman Certificate",
      featured: false,
    },
    {
      id: 3,
      title: "Worship Leadership Development",
      duration: "16 weeks",
      level: "Advanced",
      students: "20 max",
      format: "Hybrid",
      description:
        "Comprehensive training for worship leaders covering theology, practical skills, team management, and spiritual formation.",
      modules: [
        "Theology of Worship Leadership",
        "Team Building and Management",
        "Song Selection and Flow",
        "Vocal Training for Leaders",
        "Instrumental Coordination",
        "Sound and Technical Basics",
        "Pastoral Care in Worship Ministry",
        "Conflict Resolution",
        "Mentoring Next Generation Leaders",
        "Cross-Cultural Worship",
        "Special Services and Seasons",
        "Ministry Sustainability",
        "Leadership Ethics",
        "Community Outreach Through Worship",
        "Capstone Leadership Project",
        "Graduation and Commissioning",
      ],
      prerequisites: "2+ years worship ministry experience",
      certification: "Certified Worship Leader",
      featured: true,
    },
    {
      id: 4,
      title: "Music Theory for Worship Musicians",
      duration: "10 weeks",
      level: "Beginner to Intermediate",
      students: "30 max",
      format: "Online",
      description:
        "Essential music theory concepts specifically applied to worship music and Ethiopian traditional scales.",
      modules: [
        "Basic Music Theory Fundamentals",
        "Ethiopian Musical Scales and Modes",
        "Chord Progressions in Worship",
        "Rhythm and Time Signatures",
        "Harmony and Voice Leading",
        "Transposition and Key Changes",
        "Arranging for Small Ensembles",
        "Reading and Writing Music",
        "Technology Tools for Musicians",
        "Final Theory Examination",
      ],
      prerequisites: "None",
      certification: "Music Theory Certificate",
      featured: false,
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">Course Details</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">
            Comprehensive Training Programs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            Dive deep into our structured courses designed to equip you with both theoretical knowledge and practical
            skills for effective worship ministry.
          </p>
        </div>

        <div className="space-y-8">
          {courses.map((course) => (
            <Card
              key={course.id}
              className={`border-2 transition-all duration-300 hover:shadow-xl ${
                course.featured
                  ? "border-[#E5C985] bg-gradient-to-r from-[#E5C985]/5 to-white"
                  : "border-gray-100 hover:border-[#E5C985]"
              }`}
            >
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-4 mb-2">
                          <Badge
                            variant={course.featured ? "default" : "outline"}
                            className={
                              course.featured ? "bg-[#E5C985] text-[#212E3E]" : "text-[#212E3E] border-[#212E3E]"
                            }
                          >
                            {course.level}
                          </Badge>
                          {course.featured && <Badge className="bg-[#212E3E] text-white">Featured Course</Badge>}
                        </div>
                        <h3 className="text-2xl font-bold text-[#212E3E] mb-2">{course.title}</h3>
                        <p className="text-gray-600 mb-6 text-pretty">{course.description}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 text-gray-600">
                          <Clock className="w-5 h-5 text-[#E5C985]" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600">
                          <Users className="w-5 h-5 text-[#E5C985]" />
                          <span>{course.students}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 text-gray-600">
                          <BookOpen className="w-5 h-5 text-[#E5C985]" />
                          <span>{course.format}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600">
                          <Award className="w-5 h-5 text-[#E5C985]" />
                          <span>{course.certification}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-[#212E3E] mb-3">Prerequisites</h4>
                      <p className="text-gray-600 text-sm">{course.prerequisites}</p>
                    </div>
                  </div>

                  <div>
                    <Card className="border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-[#212E3E] flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-[#E5C985]" />
                          Course Modules
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {course.modules.slice(0, 6).map((module, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-[#E5C985] mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{module}</span>
                          </div>
                        ))}
                        {course.modules.length > 6 && (
                          <div className="text-sm text-[#E5C985] font-semibold">
                            +{course.modules.length - 6} more modules
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="mt-6 space-y-3">
                      <Button className="w-full bg-[#212E3E] hover:bg-[#212E3E]/90 text-white">Enroll in Course</Button>
                      <Button
                        variant="outline"
                        className="w-full border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white bg-transparent"
                      >
                        View Full Curriculum
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white bg-transparent"
          >
            View All Available Courses
          </Button>
        </div>
      </div>
    </section>
  )
}
