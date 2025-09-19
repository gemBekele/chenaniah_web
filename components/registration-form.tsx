"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Send, CheckCircle } from "lucide-react"

export function RegistrationForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    church: "",
    position: "",
    program: "",
    experience: "",
    goals: "",
    newsletter: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("[v0] Form submitted:", formData)
    setIsSubmitted(true)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <section className="py-20 bg-gradient-to-b from-[#E5C985]/5 to-white">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center border-2 border-green-200">
            <CardContent className="pt-12 pb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-[#212E3E] mb-4">Registration Submitted!</h3>
              <p className="text-gray-600 mb-6">
                Thank you for your interest in Chenaniah's programs. We'll review your application and contact you
                within 2-3 business days.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white"
              >
                Submit Another Registration
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-[#E5C985]/5 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">Join Our Community</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">Register for Programs</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto text-pretty">
            Take the first step in your worship ministry journey. Fill out the form below to register for our programs
            or express your interest in partnership opportunities.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="text-2xl text-[#212E3E]">Registration Form</CardTitle>
            <CardDescription>
              Please provide your information and program preferences. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                    className="border-gray-300 focus:border-[#E5C985]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                    className="border-gray-300 focus:border-[#E5C985]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="border-gray-300 focus:border-[#E5C985]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="border-gray-300 focus:border-[#E5C985]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="church">Church/Organization</Label>
                  <Input
                    id="church"
                    value={formData.church}
                    onChange={(e) => handleInputChange("church", e.target.value)}
                    className="border-gray-300 focus:border-[#E5C985]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Your Role/Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    placeholder="e.g., Worship Leader, Pastor, Musician"
                    className="border-gray-300 focus:border-[#E5C985]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="program">Program of Interest *</Label>
                <Select onValueChange={(value) => handleInputChange("program", value)} required>
                  <SelectTrigger className="border-gray-300 focus:border-[#E5C985]">
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="biblical-worship">Biblical Worship Foundations</SelectItem>
                    <SelectItem value="harp-techniques">Advanced Harp Techniques</SelectItem>
                    <SelectItem value="worship-leadership">Worship Team Leadership</SelectItem>
                    <SelectItem value="partnership">Partnership Opportunities</SelectItem>
                    <SelectItem value="general-inquiry">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Musical/Ministry Experience</Label>
                <Select onValueChange={(value) => handleInputChange("experience", value)}>
                  <SelectTrigger className="border-gray-300 focus:border-[#E5C985]">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                    <SelectItem value="advanced">Advanced (6+ years)</SelectItem>
                    <SelectItem value="professional">Professional/Full-time ministry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Goals and Expectations</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => handleInputChange("goals", e.target.value)}
                  placeholder="Tell us about your goals for worship ministry and what you hope to achieve through our programs..."
                  className="border-gray-300 focus:border-[#E5C985] min-h-[100px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="newsletter"
                  checked={formData.newsletter}
                  onCheckedChange={(checked) => handleInputChange("newsletter", checked as boolean)}
                />
                <Label htmlFor="newsletter" className="text-sm">
                  Subscribe to our newsletter for updates, resources, and ministry insights
                </Label>
              </div>

              <Button type="submit" size="lg" className="w-full bg-[#212E3E] hover:bg-[#212E3E]/90 text-white">
                <Send className="w-4 h-4 mr-2" />
                Submit Registration
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
