import Link from "next/link"
import Image from "next/image"
import { Facebook, Youtube, Instagram, Mail } from "lucide-react"

// Custom TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

export function Footer() {
  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Resources", href: "/resources" },
  ]

  const programs = [
    { name: "Worship Leader Certification", href: "/programs/certification" },
    { name: "Traditional Music", href: "/programs/traditional" },
    { name: "Youth Training", href: "/programs/youth" },
    { name: "Partnerships", href: "/partnerships" },
  ]

  const socialLinks = [
    { name: "TikTok", href: "https://www.tiktok.com/@chenaniahethiopia?is_from_webapp=1&sender_device=pc", icon: TikTokIcon },
    { name: "Facebook", href: "https://web.facebook.com/chenaniahethiopia/", icon: Facebook },
    { name: "YouTube", href: "https://youtube.com/@chenaniahethiopia?feature=shared", icon: Youtube },
    { name: "Instagram", href: "https://instagram.com/chenaniahethiopia", icon: Instagram },
    { name: "Email", href: "mailto:chenaniahethiopia@gmail.com", icon: Mail },
  ]

  return (
    <footer className="bg-foreground text-white">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/assets/logo/logo_full.png"
                alt="Chenaniah.org Logo"
                width={120}
                height={40}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-white/80 mb-6 text-pretty max-w-md text-sm sm:text-base">
              Equipping church musicians, singers, and worship leaders across Ethiopia and beyond through biblical
              worship training and musical excellence.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3 sm:space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300 ease-out border border-white/20 hover:border-white/40"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white/80 group-hover:text-white transition-colors duration-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-primary mb-4 text-sm sm:text-base">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/80 hover:text-primary transition-colors text-sm sm:text-base">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          {/* <div>
            <h3 className="font-semibold text-primary mb-4">Programs</h3>
            <ul className="space-y-2">
              {programs.map((program) => (
                <li key={program.name}>
                  <Link href={program.href} className="text-white/80 hover:text-primary transition-colors">
                    {program.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-xs sm:text-sm">© {new Date().getFullYear()} Chenaniah.org. All rights reserved.</p>
          <div className="flex space-x-4 sm:space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-white/60 hover:text-primary text-xs sm:text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/60 hover:text-primary text-xs sm:text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
