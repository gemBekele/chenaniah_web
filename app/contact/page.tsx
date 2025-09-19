import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContactSection } from "@/components/contact-section"
import { Badge } from "@/components/ui/badge"

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#212E3E] to-[#212E3E]/90 text-white">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90 text-lg px-6 py-2">Contact Us</Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-balance">
            Let's Connect and
            <span className="block text-[#E5C985]">Serve Together</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto text-pretty">
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
