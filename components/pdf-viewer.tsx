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

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = title || 'document.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>{title || 'PDF Viewer'}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(url, '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-muted-foreground">Loading PDF...</div>
            </div>
          )}
          <iframe
            src={url}
            className="w-full h-full border-0"
            onLoad={() => setLoading(false)}
            title={title || 'PDF Document'}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}


