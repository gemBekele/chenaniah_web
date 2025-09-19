import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { EventsHeroSection } from "@/components/events-hero-section"
// import { UpcomingEventsSection } from "@/components/upcoming-events-section"
// import { EventCalendarSection } from "@/components/event-calendar-section"
import { PastEventsSection } from "@/components/past-events-section"

export default function EventsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <EventsHeroSection />
      {/* <UpcomingEventsSection /> */}
      {/* <EventCalendarSection /> */}
      <PastEventsSection />
      <Footer />
    </main>
  )
}
