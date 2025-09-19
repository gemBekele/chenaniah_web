import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProgramsHeroSection } from "@/components/programs-hero-section"
import { ProgramsOverviewSection } from "@/components/programs-overview-section"
import { CourseDetailsSection } from "@/components/course-details-section"
import { AdmissionsSection } from "@/components/admissions-section"
import { ProgramsTestimonialsSection } from "@/components/programs-testimonials-section"

export default function ProgramsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <ProgramsHeroSection />
      <ProgramsOverviewSection />
      <CourseDetailsSection />
      <AdmissionsSection />
      <ProgramsTestimonialsSection />
      <Footer />
    </main>
  )
}
