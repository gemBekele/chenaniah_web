import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContactSection } from "@/components/contact-section"
import { Badge } from "@/components/ui/badge"

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section 
        className="pt-24 sm:pt-32 pb-16 sm:pb-20 text-white relative"
        style={{
          backgroundImage: `url('/assets/image/photo_1_2025-09-19_23-11-01.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#212E3E]/80 to-[#212E3E]/90"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-4 sm:mb-6 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90 text-base sm:text-lg px-4 sm:px-6 py-2">Contact Us</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 text-balance">
            Let's Connect and
            <span className="block text-[#E5C985]">Serve Together</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto text-pretty px-4">
            We'd love to hear from you. Whether you have questions about our programs, want to partner with us, or need
            more information about our ministry, we're here to help.
          </p>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </main>
  )
}
