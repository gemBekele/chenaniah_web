import Link from "next/link"
import Image from "next/image"
import { Facebook, Youtube, Instagram, Mail, Music } from "lucide-react"

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
    { name: "TikTok", href: "https://www.tiktok.com/@chenaniahethiopia?is_from_webapp=1&sender_device=pc", icon: Music },
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
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4 sm:h-5 sm:w-5" />
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
          <p className="text-white/60 text-xs sm:text-sm">© 2024 Chenaniah.org. All rights reserved.</p>
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
