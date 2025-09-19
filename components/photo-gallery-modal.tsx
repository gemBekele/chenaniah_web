"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface PhotoGalleryModalProps {
  isOpen: boolean
  onClose: () => void
  photos: string[]
  eventTitle: string
}

export function PhotoGalleryModal({ isOpen, onClose, photos, eventTitle }: PhotoGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!isOpen) return null

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const goToPhoto = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-xl font-semibold">{eventTitle} - Photos</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Photo */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-4">
          <img
            src={photos[currentIndex]}
            alt={`${eventTitle} photo ${currentIndex + 1}`}
            className="w-full h-[60vh] object-contain"
          />
          
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="sm"
            onClick={prevPhoto}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextPhoto}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Photo Counter */}
        <div className="text-center text-white mb-4">
          {currentIndex + 1} of {photos.length}
        </div>

        {/* Thumbnail Grid */}
        <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-32 overflow-y-auto">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => goToPhoto(index)}
              className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                index === currentIndex ? "border-[#E5C985]" : "border-transparent hover:border-white/50"
              }`}
            >
              <img
                src={photo}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
