import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
// import { OnlineClassesSection } from "@/components/online-classes-section"
// import { ProgramsSection } from "@/components/programs-section"
import { PartnershipSection } from "@/components/partnership-section"
import { TestimonialsSection } from "@/components/testimonials-section"
// import { RegistrationForm } from "@/components/registration-form"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <AboutSection />
      {/* <OnlineClassesSection /> */}
      {/* <ProgramsSection /> */}
      <PartnershipSection />
      <TestimonialsSection />
      {/* <RegistrationForm /> */}
      <CTASection />
      <Footer />
    </main>
  )
}
