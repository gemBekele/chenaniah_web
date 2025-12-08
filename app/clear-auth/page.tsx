"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { clearStudentAuth } from "@/lib/auth"

export default function ClearAuthPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear all student auth data
    clearStudentAuth()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Authentication Cleared</CardTitle>
          <CardDescription>
            All student authentication data has been cleared from your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Successfully cleared</span>
          </div>
          <Button 
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


