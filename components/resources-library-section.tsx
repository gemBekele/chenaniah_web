import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Music, Video, FileText, Download, Eye } from "lucide-react"

export function ResourcesLibrarySection() {
  const resourceCategories = [
    {
      id: "study-guides",
      title: "Biblical Study Guides",
      description: "Comprehensive guides covering worship theology, biblical foundations, and spiritual formation.",
      icon: BookOpen,
      count: "25+ Guides",
      color: "bg-blue-500",
      resources: [
        { title: "Foundations of Biblical Worship", type: "PDF", size: "2.5 MB" },
        { title: "The Heart of a Worship Leader", type: "PDF", size: "1.8 MB" },
        { title: "Psalms and Worship Study", type: "PDF", size: "3.2 MB" },
      ],
    },
    {
      id: "sheet-music",
      title: "Sheet Music & Arrangements",
      description: "Traditional Ethiopian worship songs and contemporary arrangements for various instruments.",
      icon: Music,
      count: "100+ Songs",
      color: "bg-purple-500",
      resources: [
        { title: "Traditional Harp Arrangements", type: "PDF", size: "5.1 MB" },
        { title: "Contemporary Worship Collection", type: "PDF", size: "4.3 MB" },
        { title: "Ethiopian Hymns Compilation", type: "PDF", size: "6.8 MB" },
      ],
    },
    {
      id: "video-lessons",
      title: "Video Training Lessons",
      description: "Step-by-step video tutorials covering instrument techniques and worship leading skills.",
      icon: Video,
      count: "30+ Videos",
      color: "bg-green-500",
      resources: [
        { title: "Harp Basics for Beginners", type: "MP4", size: "125 MB" },
        { title: "Advanced Worship Leading", type: "MP4", size: "98 MB" },
        { title: "Team Coordination Techniques", type: "MP4", size: "87 MB" },
      ],
    },
    {
      id: "training-materials",
      title: "Training Materials",
      description: "Curriculum outlines, lesson plans, and assessment tools for worship leader training programs.",
      icon: FileText,
      count: "15+ Materials",
      color: "bg-orange-500",
      resources: [
        { title: "Worship Leader Curriculum", type: "PDF", size: "4.7 MB" },
        { title: "Assessment Guidelines", type: "PDF", size: "1.2 MB" },
        { title: "Training Schedule Template", type: "DOCX", size: "0.8 MB" },
      ],
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">Resource Library</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">
            Everything You Need for Ministry
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            Our comprehensive resource library provides worship leaders with the tools, materials, and guidance needed
            to excel in their ministry calling.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {resourceCategories.map((category, index) => {
            const IconComponent = category.icon
            return (
              <Card
                key={category.id}
                className="border-2 border-gray-100 hover:border-[#E5C985] transition-all duration-300 hover:shadow-xl"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 ${category.color} rounded-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-[#212E3E]">{category.title}</CardTitle>
                        <Badge variant="outline" className="text-[#E5C985] border-[#E5C985] mt-1">
                          {category.count}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-gray-600 mb-6">{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {category.resources.map((resource, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-[#E5C985]" />
                          <div>
                            <div className="font-medium text-[#212E3E] text-sm">{resource.title}</div>
                            <div className="text-xs text-gray-500">
                              {resource.type} • {resource.size}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white bg-transparent"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" className="bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E]">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-[#212E3E] hover:bg-[#212E3E]/90 text-white">
                    View All {category.title}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center bg-[#212E3E] rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Need another Resource? We can help you!</h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            you can request for any resource you need. our team will work on it and get it to you.
          </p>
          <Button size="lg" className="bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E]">
            Request Resource
          </Button>
        </div>
      </div>
    </section>
  )
}
