"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Download, ExternalLink } from "lucide-react"

interface PDFViewerProps {
  url: string
  title?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PDFViewer({ url, title, open, onOpenChange }: PDFViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleDownload = async () => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = title || 'document.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Download error:', err)
      // Fallback to direct download
      const link = document.createElement('a')
      link.href = url
      link.download = title || 'document.pdf'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleIframeLoad = () => {
    setLoading(false)
    setError(false)
  }

  const handleIframeError = () => {
    setLoading(false)
    setError(true)
  }

  // Reset states when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setLoading(true)
      setError(false)
    }
    onOpenChange(newOpen)
  }

  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 overflow-hidden bg-black/90 border-none">
        <div className="relative w-full h-full flex flex-col">
          {/* Toolbar */}
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-end gap-2 p-2 bg-gradient-to-b from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              className="gap-2 bg-white/90 hover:bg-white text-black border-none"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(url, '_blank')}
              className="gap-2 bg-white/90 hover:bg-white text-black border-none"
            >
              <ExternalLink className="h-4 w-4" />
              Open New Tab
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenChange(false)}
              className="bg-white/90 hover:bg-white text-black border-none"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 relative w-full h-full bg-white flex items-center justify-center overflow-hidden">
            {loading && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-muted-foreground">Loading Document...</div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 gap-4">
                <div className="text-muted-foreground text-center">
                  <p className="mb-2">Unable to display document.</p>
                  <Button
                    variant="outline"
                    onClick={() => window.open(url, '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            )}
            
            {isImage ? (
              <img
                src={url}
                alt={title || 'Document'}
                className="max-w-full max-h-full object-contain"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false)
                  setError(true)
                }}
                style={{ display: error ? 'none' : 'block' }}
              />
            ) : (
              <iframe
                src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title={title || 'Document'}
                style={{ display: error ? 'none' : 'block' }}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}






