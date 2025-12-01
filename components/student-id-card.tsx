"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2, User, Printer, QrCode, Phone } from "lucide-react"
import { toPng } from "html-to-image"
import { getApiBaseUrl } from "@/lib/utils"

const API_BASE_URL = getApiBaseUrl()

interface StudentIDCardProps {
  user: {
    id: number
    fullNameEnglish?: string
    fullNameAmharic?: string
    phone: string
    username: string
    photoPath?: string
  }
  qrCodeImage: string | null
  onDownload?: () => void
}

export default function StudentIDCard({ user, qrCodeImage, onDownload }: StudentIDCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  // Convert images to Data URLs to avoid CORS issues during download
  useEffect(() => {
    const convertToDataUrl = async (url: string): Promise<string | null> => {
      try {
        const response = await fetch(url)
        const blob = await response.blob()
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
      } catch (error) {
        console.error("Error converting image to data URL:", error)
        return null
      }
    }

    if (user.photoPath) {
      const photoUrl = `${API_BASE_URL}/${user.photoPath}`
      convertToDataUrl(photoUrl).then(setPhotoDataUrl)
    }

    if (qrCodeImage) {
      // If it's already a data URL, use it directly
      if (qrCodeImage.startsWith('data:')) {
        setQrDataUrl(qrCodeImage)
      } else {
        convertToDataUrl(qrCodeImage).then(setQrDataUrl)
      }
    }
  }, [user.photoPath, qrCodeImage])

  const handleDownload = async () => {
    if (!cardRef.current) return

    setIsDownloading(true)
    
    try {
      // Wait a bit to ensure rendering is complete
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Use html-to-image which handles modern CSS better
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        cacheBust: true,
      })

      // Convert data URL to blob and download
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `chenaniah-id-${user.username}-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      if (onDownload) {
        onDownload()
      }
    } catch (error: any) {
      console.error("Error downloading ID card:", error)
      alert(`Failed to download ID card: ${error.message || error.toString()}`)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* ID Card Preview */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          data-card-ref="true"
          className="relative bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
          style={{ 
            width: "2.125in",
            height: "3.375in",
            minWidth: "240px",
            minHeight: "380px",
            aspectRatio: "2.125 / 3.375"
          }} 
        >
          {/* Decorative Top Bar */}
          <div className="h-2 w-full bg-[#E5C985] shrink-0"></div>

          {/* Header with Logo */}
          <div className="px-4 pt-4 pb-1 text-center shrink-0 flex flex-col items-center">
            <div className="w-20 h-auto mb-1">
               <img src="/assets/logo/logo_full.png" alt="Chenaniah Logo" className="w-full h-auto object-contain" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-4 flex flex-col items-center justify-start gap-2 overflow-hidden">
            {/* Photo */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#E5C985] p-1 bg-white shadow-sm shrink-0 mt-1">
              <div className="w-full h-full rounded-full overflow-hidden relative">
                {photoDataUrl ? (
                  <img
                    src={photoDataUrl}
                    alt={user.fullNameEnglish || user.username}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full bg-[#F3F4F6] flex items-center justify-center">
                    <User className="h-12 w-12 text-[#9CA3AF]" />
                  </div>
                )}
              </div>
            </div>

            {/* Student Info */}
            <div className="text-center w-full space-y-1.5">
              <div>
                <h3 className="text-[#212E3E] font-bold text-xl leading-tight capitalize">
                  {user.fullNameEnglish || user.username}
                </h3>
                {user.fullNameAmharic && (
                  <p className="text-[#6B7280] text-sm font-medium mt-0.5">
                    {user.fullNameAmharic}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[#E5C985] text-xs font-semibold tracking-wide pt-0.5">
                <Phone className="w-3 h-3 fill-current" />
                <p>{user.phone}</p>
              </div>
            </div>
          </div>

          {/* Footer with QR Code */}
          <div className="mt-auto pb-3 px-4 flex flex-col items-center gap-2 shrink-0 bg-gradient-to-t from-[#F9FAFB] to-transparent w-full pt-2">
            {/* QR Code */}
            <div className="w-24 h-24 bg-white p-1.5 rounded-lg shadow-sm border border-[#E5E7EB]">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-full h-full"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-full h-full bg-[#F3F4F6] flex items-center justify-center rounded">
                  <QrCode className="h-10 w-10 text-[#9CA3AF]" />
                </div>
              )}
            </div>

            <p className="text-[8px] text-[#212E3E] font-medium tracking-widest uppercase border-t border-[#E5C985] pt-1 px-6">Choir Membership Card</p>
          </div>
          
          {/* Decorative Bottom Bar */}
          <div className="h-1.5 w-full bg-[#212E3E] shrink-0"></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        <Button
          onClick={handleDownload}
          disabled={isDownloading || !qrCodeImage || !photoDataUrl}
          className="bg-[#212E3E] hover:bg-[#212E3E]/90 text-white w-full max-w-[200px]"
          size="lg"
          title={!photoDataUrl ? "Please upload a profile photo to download your ID card" : "Download ID Card"}
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-5 w-5 mr-2" />
              Download ID Card
            </>
          )}
        </Button>
      </div>
      
      {!photoDataUrl && (
        <p className="text-xs text-red-500 text-center font-medium">
          * You must upload a profile photo to download your ID card
        </p>
      )}
      {!qrCodeImage && (
        <p className="text-xs text-center text-[#6B7280] mt-2">
          Please wait for QR code to load before downloading
        </p>
      )}
    </div>
  )
}

