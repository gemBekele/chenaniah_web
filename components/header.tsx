"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    // { name: "Programs", href: "/programs" },
    { name: "Events", href: "/events" },
    { name: "Schedule", href: "/schedule" },
    { name: "Result", href: "/result" },
    // { name: "Resources", href: "/resources" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-sm shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/assets/logo/logo_full.png" alt="Chenaniah.org Logo" width={120} height={40} className={`h-8 sm:h-10 w-auto transition-all duration-300 ${isScrolled ? "" : "brightness-0 invert"}`} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-[#E5C985] ${
                  isScrolled ? "text-[#212E3E]" : "text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button className="bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E]" onClick={() => window.open("https://t.me/Chenaniah_Screening_Bot", "_blank")}>Join the choir</Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`lg:hidden p-2 ${isScrolled ? "text-[#212E3E]" : "text-white"}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className={`lg:hidden ${isScrolled ? "bg-white" : "bg-white/20 backdrop-blur-sm p-4 rounded-lg"}`}>
            <nav className={`mt-4 pb-4  ${isScrolled ? "border-gray-200" : "border-white/20"}`}>
              <div className="flex flex-col space-y-4 pl-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-base font-medium hover:text-[#E5C985] transition-colors py-2 border-b border-white/20 ${
                      isScrolled ? "text-[#212E3E]" : "text-white"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Button 
                  className="w-fit bg-[#E5C985] hover:bg-[#E5C985]/90 text-[#212E3E] mt-2" 
                  onClick={() => window.open("https://t.me/Chenaniah_Screening_Bot", "_blank")}
                >
                  Join the choir
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
