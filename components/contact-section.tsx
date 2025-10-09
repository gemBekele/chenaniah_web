"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react"

export function ContactSection() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Contact form submitted:", formData)
    setIsSubmitted(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const contactInfo = [
    // {
    //   icon: MapPin,
    //   title: "Visit Us",
    //   details: ["Addis Ababa, Ethiopia", "Bole Sub-City", "Woreda 03, House No. 123"],
    // },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+2519 9888 2041"],
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["info@chenaniah.org", "Illasha@chenaniah.org"],
    },
    // {
    //   icon: Clock,
    //   title: "Office Hours",
    //   details: ["Monday - Friday: 9:00 AM - 5:00 PM", "Saturday: 9:00 AM - 1:00 PM", "Sunday: Closed"],
    // },
  ]

  if (isSubmitted) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center border-2 border-green-200">
            <CardContent className="pt-12 pb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-[#212E3E] mb-4">Message Sent Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Thank you for reaching out to us. We'll get back to you within 24 hours.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white"
              >
                Send Another Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">Get In Touch</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">Contact Us</h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            We'd love to hear from you. Whether you have questions about our programs, want to partner with us, or need
            more information, we're here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Contact Information */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#212E3E] mb-6 sm:mb-8">How to Reach Us</h3>
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon
                return (
                  <Card
                    key={index}
                    className="border-2 border-gray-100 hover:border-[#E5C985] transition-all duration-300"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="p-2 sm:p-3 bg-[#E5C985]/10 rounded-lg flex-shrink-0">
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5C985]" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#212E3E] mb-2 text-sm sm:text-base">{info.title}</h4>
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-gray-600 text-md italic sm:text-sm">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-[#212E3E] rounded-2xl text-white">
              <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Need Immediate Assistance?</h4>
              <p className="text-gray-300 mb-4 text-sm sm:text-base">
                For urgent matters or immediate support, please call us during business hours.
              </p>
              <Button className="bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E] w-full sm:w-auto" onClick={() => window.open("tel:+251912345678", "_blank")}>
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="pt-0 sm:pt-15">
            <Card className="border-2 border-gray-100">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl text-[#212E3E]">Send Us a Message</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        className="border-gray-300 focus:border-[#E5C985]"
                      />
                    </div>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="border-gray-300 focus:border-[#E5C985] text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm sm:text-base">Subject *</Label>
                      <Select onValueChange={(value) => handleInputChange("subject", value)} required>
                        <SelectTrigger className="border-gray-300 focus:border-[#E5C985] text-sm sm:text-base">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="programs">Program Information</SelectItem>
                          <SelectItem value="partnership">Partnership Opportunities</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="media">Media & Press</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm sm:text-base">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Please provide details about your inquiry..."
                      required
                      className="border-gray-300 focus:border-[#E5C985] min-h-[120px] text-sm sm:text-base"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-[#212E3E] hover:bg-[#212E3E]/90 text-white">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        {/* <div className="bg-gray-100 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-[#212E3E] mb-4">Find Us on the Map</h3>
          <p className="text-gray-600 mb-6">
            Located in the heart of Addis Ababa, we're easily accessible by public transportation.
          </p>
          <div className="bg-white rounded-lg p-8 h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-[#E5C985] mx-auto mb-4" />
              <p className="text-gray-600">Interactive map coming soon</p>
              <p className="text-sm text-gray-500">Addis Ababa, Ethiopia</p>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  )
}
