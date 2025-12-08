"use client"

import { Construction, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface ComingSoonProps {
  title?: string
  message?: string
  showHomeButton?: boolean
}

export function ComingSoon({ 
  title = "Coming Soon", 
  message = "This feature is currently under development. Stay tuned!",
  showHomeButton = true 
}: ComingSoonProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <Construction className="h-16 w-16 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>

            {showHomeButton && (
              <Link href="/dashboard">
                <Button className="w-full" size="lg">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


