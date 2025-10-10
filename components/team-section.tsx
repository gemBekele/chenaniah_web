"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Linkedin, Music } from "lucide-react"

export function TeamSection() {
  const teamMembers = [
    {
      name: "Illasha Fekadu",
      role: "Founder & Director",
      bio: "Founder",
      image: "/assets/leaders/illasha.jpg",
      specialties: ["Singer", "Musician", "Church Planting"],
    },
    {
      name: "Zeritu Kebede",
      role: "Leader",
      bio: "Singer, song writer, mother, disciple. Lives to love God and those he deid to save.",
      image: "/assets/leaders/zeritu.jpg",
      specialties: ["Harp Performance", "Music Theory", "Vocal Training"],
    },
    {
      name: "Kaleab Yinebeb",
      role: "Leader",
      bio: "Musician",
      image: "/assets/leaders/bereket.jpg",
      specialties: ["Leadership", "Ministry"],
    },
    {
      name: "Bereket Demeke",
      role: "Leader",
      bio: "Musician, guitarist, born again. Passionate about worship, music and the Lord.",
      image: "/assets/leaders/natnael.jpg",
      specialties: ["Leadership", "Ministry"],
    },
    {
      name: "Amanuel Wolde",
      role: "Leader",
      bio: "Musician.",
      image: "/assets/leaders/amanuel.jpg",
      specialties: ["Leadership", "Ministry"],
    },
    {
      name: "Abel Gashaw",
      role: "Leader",
      bio: "photographer",
      image: "/assets/leaders/abel.jpg",
      specialties: ["Leadership", "Ministry"],
    },
    {
      name: "Abigail Kassa",
      role: "Leader",
      bio: "Social media manager, content creator, event organizer",
      image: "/assets/leaders/abigia.jpg",
      specialties: ["Leadership", "Ministry"],
    },
    {
      name: "Ermias Menberu",
      role: "Leader",
      bio: "Dedicated to empowering young talent through innovative event organizing and digital solutions.",
      image: "/assets/leaders/ermias.JPG",
      specialties: ["Leadership", "Ministry"],
    },
    
  ]

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[#212E3E] mb-4 text-balance">
            Meet the Leaders Behind the Mission
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="border-2 border-gray-100 hover:border-[#E5C985] transition-all duration-300 hover:shadow-xl group"
            >
              <CardHeader className="text-center pb-2">
                <div className="relative mb-3">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-3 border-[#E5C985]/20 group-hover:border-[#E5C985] transition-all duration-300"
                  />
                </div>
                <CardTitle className="text-lg font-bold text-[#212E3E] mb-1">{member.name}</CardTitle>
                {/* <p className="text-lg font-semibold text-[#E5C985] mb-4">{member.role}</p> */}
              </CardHeader>
              <CardContent className="text-center pt-0 pb-4">
                <div className="mb-2">
                  <p className="text-sm text-gray-700 italic leading-relaxed">
                    {member.bio}
                  </p>
                  {/* <div className="flex flex-wrap justify-center gap-2">
                    {member.specialties.map((specialty, specialtyIndex) => (
                      <Badge 
                        key={specialtyIndex} 
                        variant="secondary" 
                        className="bg-[#E5C985]/10 text-[#212E3E] border-[#E5C985]/30 hover:bg-[#E5C985]/20 transition-colors"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center bg-[#212E3E] rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-3">Join Our Mission</h3>
          <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
            We're always looking for passionate individuals to join our team and help expand our impact across Ethiopia.
          </p>
          <Button size="lg" className="bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E]" onClick={() => window.open("https://t.me/Chenaniah_Screening_Bot", "_blank")}>
            Join us!
          </Button>
        </div>
      </div>
    </section>
  )
}
