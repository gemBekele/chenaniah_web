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
      bio: "Singer, Musician, Song Writer, born again.",
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
      bio: "A dedicated leader contributing to the mission of Chenaniah.",
      image: "/placeholder.svg",
      specialties: ["Leadership", "Ministry"],
    },
    {
      name: "Bereket Demeke",
      role: "Leader",
      bio: "Musician, guitarist, born again. Passionate about worship, music and the Lord.",
      image: "/assets/leaders/bereket.jpg",
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
      bio: "A dedicated leader contributing to the mission of Chenaniah.",
      image: "/placeholder.svg",
      specialties: ["Leadership", "Ministry"],
    },
    {
      name: "Abigiya Elias",
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
    {
      name:"Natnael",
      role:"Leader",
      bio:"Musician",
      image:"/placeholder.svg",
      specialties:["Leadership","Ministry"],
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          {/* <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">Our Team</Badge> */}
          <h2 className="text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">
            Meet the Leaders Behind the Mission
          </h2>
          {/* <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            Our dedicated team brings together decades of ministry experience, musical expertise, and passionate
            commitment to equipping worship leaders across Ethiopia.
          </p> */}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="border-2 border-gray-100 hover:border-[#E5C985] transition-all duration-300 hover:shadow-xl group"
            >
              <CardHeader className="text-center">
                <div className="relative mb-4">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-[#E5C985]/20 group-hover:border-[#E5C985] transition-all duration-300"
                  />
                </div>
                <CardTitle className="text-xl text-[#212E3E]">{member.name}</CardTitle>
                {/* <Badge variant="outline" className="text-[#E5C985] border-[#E5C985] text-center">
                  {member.role}
                </Badge> */}
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
                {/* <div className="space-y-2 mb-4">
                  {member.specialties.map((specialty, idx) => (
                    <div key={idx} className="flex items-center justify-center text-xs text-gray-500">
                      <Music className="w-3 h-3 mr-1 text-[#E5C985]" />
                      {specialty}
                    </div>
                  ))}
                </div> */}
                {/* <div className="flex justify-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white bg-transparent"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white bg-transparent"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                </div> */}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center bg-[#212E3E] rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Join Our Mission</h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
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
