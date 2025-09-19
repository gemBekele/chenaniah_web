import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ResourcesHeroSection } from "@/components/resources-hero-section"
import { ResourcesLibrarySection } from "@/components/resources-library-section"
// import { DownloadsSection } from "@/components/downloads-section"

export default function ResourcesPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <ResourcesHeroSection />
      <ResourcesLibrarySection />
      {/* <DownloadsSection /> */}
      <Footer />
    </main>
  )
}
