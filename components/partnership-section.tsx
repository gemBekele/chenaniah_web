import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Globe, Users } from "lucide-react"

export function PartnershipSection() {
  const partnershipTypes = [
    {
      icon: Heart,
      title: "Monthly Supporter",
      description: "Join our community of faithful partners supporting worship ministry in Ethiopia.",
      amount: "of any amount",
      benefits: ["Monthly updates", "Prayer requests", "Impact stories", "Tax receipts"],
    },
    {
      icon: Globe,
      title: "Church Partnership",
      description: "Partner your church with our ministry for mutual growth and support.",
      amount: "Custom",
      benefits: ["Sister church relationships", "Cultural exchange", "Joint worship events", "Mission trips"],
    },
    {
      icon: Users,
      title: "Sponsor our events",
      description: "Directly support our events and programs.",
      amount: "of any amount",
      benefits: ["Student updates", "Direct communication", "Graduation celebration", "Ongoing relationship"],
    },
  ]

  return (
    <section className="py-16 sm:py-20 bg-[#212E3E] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">Partnership Opportunities</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance">Partner With Us in God's Work</h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto text-pretty">
            Join us in equipping worship leaders across Ethiopia. Your partnership creates lasting impact in churches
            and communities throughout the nation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {partnershipTypes.map((partnership, index) => {
            const IconComponent = partnership.icon
            return (
              <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-2 sm:p-3 bg-[#E5C985] rounded-lg mr-3 sm:mr-4">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-[#212E3E]" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg sm:text-xl">{partnership.title}</CardTitle>
                      <div className="text-[#E5C985] font-semibold text-sm sm:text-base">{partnership.amount}</div>
                    </div>
                  </div>
                  <CardDescription className="text-gray-300 text-sm sm:text-base">{partnership.description}</CardDescription>
                </CardHeader>
                {/* <CardContent>
                  <ul className="space-y-2 mb-6">
                    {partnership.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-300">
                        <ArrowRight className="w-4 h-4 mr-2 text-[#E5C985]" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E]">
                    <Handshake className="w-4 h-4 mr-2" />
                    Become a Partner
                  </Button>
                </CardContent> */}
              </Card>
            )
          })}
        </div>

        <div className="text-center bg-white/5 rounded-2xl p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Ready to Make a Difference?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto text-sm sm:text-base">
            Every partnership, no matter the size, helps us train more worship leaders and strengthen churches across
            Ethiopia. Join our mission today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E] w-full sm:w-auto">
              Start Partnership
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#212E3E] bg-transparent w-full sm:w-auto"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
