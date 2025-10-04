import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Chenaniah.org - Ethiopian Worship & Music Ministry",
  description:
    "Equipping church musicians, singers, and worship leaders in Ethiopia and beyond through training, resources, events, and partnerships.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        {/* Only load Analytics on Vercel deployments */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  )
}
