import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PhotoGallery } from "@/components/photo-gallery"
import { Badge } from "@/components/ui/badge"

export default function GalleryPage() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#212E3E] to-[#212E3E]/90 text-white">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90 text-lg px-6 py-2">
            Photo Gallery
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-balance">
            Capturing Moments of
            <span className="block text-[#E5C985]">Worship & Ministry</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto text-pretty">
            Explore our collection of photos showcasing the heart of our ministry - from training sessions and worship
            services to community events and the beautiful instruments that make it all possible.
          </p>
        </div>
      </section>

      <PhotoGallery />
      <Footer />
    </main>
  )
}
