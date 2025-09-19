import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Star, Users } from "lucide-react"

export function DownloadsSection() {
  const popularDownloads = [
    {
      title: "Worship Leader's Quick Reference Guide",
      description: "Essential tips and biblical principles for effective worship leading in one convenient guide.",
      downloads: "2,500+",
      rating: 4.9,
      size: "1.2 MB",
      type: "PDF",
      featured: true,
    },
    {
      title: "Ethiopian Traditional Hymns Collection",
      description: "Beautiful collection of traditional Ethiopian worship songs with modern arrangements.",
      downloads: "1,800+",
      rating: 4.8,
      size: "8.5 MB",
      type: "PDF",
      featured: true,
    },
    {
      title: "Harp Tuning and Maintenance Guide",
      description: "Complete guide to keeping your harp in perfect condition with step-by-step instructions.",
      downloads: "1,200+",
      rating: 4.7,
      size: "3.1 MB",
      type: "PDF",
      featured: false,
    },
    {
      title: "Biblical Worship Foundations Course Outline",
      description: "Comprehensive curriculum outline for teaching biblical worship principles in your church.",
      downloads: "950+",
      rating: 4.9,
      size: "2.8 MB",
      type: "PDF",
      featured: false,
    },
    {
      title: "Worship Team Coordination Checklist",
      description: "Practical checklist for organizing and coordinating effective worship team practices.",
      downloads: "1,500+",
      rating: 4.6,
      size: "0.8 MB",
      type: "PDF",
      featured: false,
    },
    {
      title: "Prayer and Worship Integration Guide",
      description: "Learn how to seamlessly integrate prayer and worship for more meaningful services.",
      downloads: "800+",
      rating: 4.8,
      size: "1.9 MB",
      type: "PDF",
      featured: false,
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">Free Downloads</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">Most Popular Resources</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            Start with these highly-rated resources that have helped thousands of worship leaders grow in their ministry
            calling.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {popularDownloads.map((download, index) => (
            <Card
              key={index}
              className={`border-2 transition-all duration-300 hover:shadow-xl ${
                download.featured
                  ? "border-[#E5C985] bg-gradient-to-br from-[#E5C985]/5 to-white"
                  : "border-gray-100 hover:border-[#E5C985]"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    {download.featured && <Badge className="bg-[#E5C985] text-[#212E3E] mb-2">Most Popular</Badge>}
                    <CardTitle className="text-lg text-[#212E3E] mb-2">{download.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-gray-600 mb-4">{download.description}</CardDescription>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      {download.rating}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {download.downloads}
                    </div>
                  </div>
                  <div className="text-[#E5C985] font-medium">
                    {download.type} • {download.size}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className={`w-full ${
                    download.featured
                      ? "bg-[#212E3E] hover:bg-[#212E3E]/90 text-white"
                      : "bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E]"
                  }`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Free Download
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
            View All Downloads
          </Button>
        </div>
      </div>
    </section>
  )
}
