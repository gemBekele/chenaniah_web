"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react"

export function PhotoGallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [currentCategory, setCurrentCategory] = useState("all")

  const categories = [
    { id: "all", name: "All Photos" },
    { id: "training", name: "Training Sessions" },
    { id: "worship", name: "Worship Services" },
    { id: "community", name: "Community Events" },
  ]

  const galleryItems = [
    {
      id: 1,
      src: "/assets/image/photo_1_2025-09-19_23-11-01.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 2,
      src: "/assets/image/photo_2_2025-09-19_23-11-01.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 3,
      src: "/assets/image/photo_3_2025-09-19_23-11-01.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 4,
      src: "/assets/image/photo_4_2025-09-19_23-11-01.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 5,
      src: "/assets/image/photo_5_2025-09-19_23-11-01.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 6,
      src: "/assets/image/photo_6_2025-09-19_23-11-01.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 7,
      src: "/assets/image/photo_7_2025-09-19_23-11-01.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 8,
      src: "/assets/image/photo_8_2025-09-19_23-11-01.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 9,
      src: "/assets/image/photo_9_2025-09-19_23-11-01.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 10,
      src: "/assets/image/photo_10_2025-09-19_23-11-01.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 11,
      src: "/assets/image/photo_11_2025-09-19_23-11-01.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 12,
      src: "/assets/image/photo_12_2025-09-19_23-11-01.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 13,
      src: "/assets/image/photo_13_2025-09-19_23-11-01.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 14,
      src: "/assets/image/photo_14_2025-09-19_23-11-01.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 15,
      src: "/assets/image/photo_15_2025-09-19_23-11-01.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 16,
      src: "/assets/image/photo_1_2025-10-03_16-43-26.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 17,
      src: "/assets/image/photo_2_2025-10-03_16-43-26.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 18,
      src: "/assets/image/photo_3_2025-10-03_16-43-26.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 19,
      src: "/assets/image/photo_5_2025-10-03_16-43-26.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 20,
      src: "/assets/image/photo_6_2025-10-03_16-43-26.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
    {
      id: 21,
      src: "/assets/image/photo_7_2025-10-03_16-43-26.jpg",
      alt: "Worship service",
      category: "worship",
      title: "Sunday Worship Service",
      description: "Congregation engaged in heartfelt worship",
    },
  ]

  const filteredItems =
    currentCategory === "all" ? galleryItems : galleryItems.filter((item) => item.category === currentCategory)

  const openLightbox = (index: number) => {
    setSelectedImage(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredItems.length)
    }
  }

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? filteredItems.length - 1 : selectedImage - 1)
    }
  }

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">Photo Gallery</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">Moments from Our Ministry</h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            Explore photos from our worship services, capturing moments of heartfelt worship and spiritual connection.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={currentCategory === category.id ? "default" : "outline"}
              onClick={() => setCurrentCategory(category.id)}
              className={`text-xs sm:text-sm ${
                currentCategory === category.id
                  ? "bg-[#212E3E] hover:bg-[#212E3E]/90 text-white"
                  : "border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white"
              }`}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {filteredItems.map((item, index) => (
            <Card
              key={item.id}
              className="group cursor-pointer border-2 border-gray-100 hover:border-[#E5C985] transition-all duration-300 hover:shadow-xl overflow-hidden"
              onClick={() => openLightbox(index)}
            >
              <CardContent className="p-0 relative">
                <div className="relative overflow-hidden">
                  <img
                    src={item.src || "/placeholder.svg"}
                    alt={item.alt}
                    className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                {/* <div className="p-4">
                  <h3 className="font-semibold text-[#212E3E] mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div> */}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage !== null && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="relative max-w-4xl max-h-full">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:bg-white/20 z-10"
                onClick={closeLightbox}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 sm:left-4 text-white hover:bg-white/20"
                onClick={prevImage}
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-4 text-white hover:bg-white/20"
                onClick={nextImage}
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </Button>

              <img
                src={filteredItems[selectedImage].src || "/placeholder.svg"}
                alt={filteredItems[selectedImage].alt}
                className="max-w-full max-h-full object-contain"
              />

              <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 text-white">
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{filteredItems[selectedImage].title}</h3>
                <p className="text-gray-300 text-sm sm:text-base">{filteredItems[selectedImage].description}</p>
              </div>
            </div>
          </div>
        )}

        {/* <div className="text-center">
          <Button
            size="lg"
            variant="outline"
            className="border-[#212E3E] text-[#212E3E] hover:bg-[#212E3E] hover:text-white bg-transparent"
          >
            View More Photos
          </Button>
        </div> */}
      </div>
    </section>
  )
}
