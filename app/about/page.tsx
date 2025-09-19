import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AboutHeroSection } from "@/components/about-hero-section"
import { MissionVisionSection } from "@/components/mission-vision-section"
import { TeamSection } from "@/components/team-section"
import { PhotoGallery } from "@/components/photo-gallery"
import { ContactSection } from "@/components/contact-section"

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <AboutHeroSection />
      <MissionVisionSection />
      <TeamSection />
      <PhotoGallery />
      <ContactSection />
      <Footer />
    </main>
  )
}
