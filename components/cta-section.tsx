"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-foreground via-foreground/95 to-foreground/90 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full bg-repeat"
          style={{
            backgroundImage: `url('/assets/image/photo_3_2025-09-19_23-11-01.jpg')`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* CTA Content */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-balance">
              Ready to Join Our Worship Ministry?
            </h2>
            <p className="text-lg text-white/90 mb-8 text-pretty">
              Join hundreds of musicians and worship leaders who have already serving with us.
              Start your journey with Chenaniah.org today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => window.open("https://t.me/Chenaniah_Screening_Bot", "_blank")}>
                Join the choir!
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-foreground bg-transparent"
              >
                Schedule a Call
              </Button> */}
            </div>
          </div>

          {/* Contact Info */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Get in Touch</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-white/90">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>info@chenaniah.org</span>
                </div>

                <div className="flex items-center space-x-3 text-white/90">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>+2519 9888 2041</span>
                </div>

                <div className="flex items-center space-x-3 text-white/90">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Addis Ababa, Ethiopia</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-white/80 text-sm text-pretty">
                  Follow us on social media for updates on events, training programs, and inspiring worship content.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
