import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, CheckCircle, Clock, DollarSign } from "lucide-react"

export function AdmissionsSection() {
  const admissionSteps = [
    {
      step: 1,
      title: "Submit Application",
      description: "Complete our online application form with your personal and ministry information.",
      timeline: "15 minutes",
    },
    {
      step: 2,
      title: "Document Review",
      description: "Our team reviews your application and supporting documents within 3-5 business days.",
      timeline: "3-5 days",
    },
    {
      step: 3,
      title: "Interview Process",
      description: "Participate in a brief interview to discuss your goals and program fit.",
      timeline: "30 minutes",
    },
    {
      step: 4,
      title: "Acceptance Decision",
      description: "Receive your acceptance decision and enrollment instructions via email.",
      timeline: "1-2 days",
    },
  ]

  const requirements = [
    "Completed application form",
    "Statement of faith and ministry calling",
    "Two references (pastoral and personal)",
    "Basic musical experience (for instrument courses)",
    "Commitment to complete program requirements",
    "Access to reliable internet (for online components)",
  ]

  const scholarshipInfo = [
    {
      type: "Full Scholarship",
      description: "Complete tuition coverage for exceptional candidates with demonstrated financial need.",
      eligibility: "Income-based qualification required",
      amount: "100% tuition",
    },
    {
      type: "Partial Scholarship",
      description: "Reduced tuition for qualified applicants showing ministry commitment.",
      eligibility: "Ministry involvement verification",
      amount: "25-75% tuition",
    },
    {
      type: "Work-Study Program",
      description: "Earn tuition credits through ministry service and program assistance.",
      eligibility: "Available time commitment",
      amount: "Up to 50% tuition",
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">Admissions</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">
            Join Our Learning Community
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            Begin your journey of growth and service. Our admissions process is designed to ensure the best fit for both
            you and our program community.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Application Process */}
          <div>
            <h3 className="text-2xl font-bold text-[#212E3E] mb-8">Application Process</h3>
            <div className="space-y-6">
              {admissionSteps.map((step) => (
                <Card key={step.step} className="border-l-4 border-l-[#E5C985]">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-[#212E3E] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-[#212E3E]">{step.title}</h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1 text-[#E5C985]" />
                            {step.timeline}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-2xl font-bold text-[#212E3E] mb-8">Admission Requirements</h3>
            <Card className="border-2 border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg text-[#212E3E] flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-[#E5C985]" />
                  Required Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#E5C985] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{requirement}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="mt-8">
              <h4 className="font-semibold text-[#212E3E] mb-4">Important Dates</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="font-medium">Spring 2024 Applications</span>
                  <Badge className="bg-[#E5C985] text-[#212E3E]">Open Now</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="font-medium">Application Deadline</span>
                  <span className="text-gray-600">March 1, 2024</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="font-medium">Program Start Date</span>
                  <span className="text-gray-600">April 15, 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scholarship Information */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-[#212E3E] mb-4">Financial Aid & Scholarships</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We believe financial constraints should not prevent anyone from pursuing their calling in worship
              ministry.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {scholarshipInfo.map((scholarship, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:border-[#E5C985] transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg text-[#212E3E] flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-[#E5C985]" />
                    {scholarship.type}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm">{scholarship.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Coverage:</span>
                      <span className="font-semibold text-[#E5C985]">{scholarship.amount}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Eligibility: </span>
                      <span className="text-gray-600">{scholarship.eligibility}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Application Form */}
        <Card className="border-2 border-[#E5C985] bg-gradient-to-r from-[#E5C985]/5 to-white">
          <CardHeader>
            <CardTitle className="text-2xl text-[#212E3E] text-center">Start Your Application Today</CardTitle>
            <p className="text-center text-gray-600">
              Take the first step towards transforming your worship ministry calling.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" required />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" />
                </div>
              </div>
              <div>
                <Label htmlFor="program">Program of Interest *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="biblical-foundations">Biblical Foundations of Worship</SelectItem>
                    <SelectItem value="traditional-instruments">Traditional Ethiopian Instruments</SelectItem>
                    <SelectItem value="worship-leadership">Worship Leadership Development</SelectItem>
                    <SelectItem value="music-theory">Music Theory for Worship Musicians</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ministry">Current Ministry Involvement</Label>
                <Textarea
                  id="ministry"
                  placeholder="Tell us about your current involvement in worship ministry..."
                  rows={3}
                />
              </div>
              <div className="text-center">
                <Button size="lg" className="bg-[#212E3E] hover:bg-[#212E3E]/90 text-white px-12">
                  Submit Application
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
