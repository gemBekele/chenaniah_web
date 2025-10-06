"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, UserIcon } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://15.204.227.47:5000/api"

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      console.log("data", data)

      if (data.success && data.token) {
        console.log("Login successful, calling onLoginSuccess with token:", data.token)
        onLoginSuccess(data.token)
      } else {
        console.log("Login failed, data:", data)
        setError(data.error || "Invalid credentials")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Failed to connect to server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Chenaniah Worship</h1>
          <p className="text-muted-foreground">Ministry Screening Portal</p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/5">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
            <CardDescription className="text-center text-base">
              Sign in to access the screening dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="pl-10 h-11 bg-input border-border/50 focus:border-primary transition-colors"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 h-11 bg-input border-border/50 focus:border-primary transition-colors"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              {error && (
                <div className="bg-error-light border border-error/20 text-error p-3.5 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-300">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-11 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold shadow-sm transition-all duration-200 hover:shadow-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">Secure access for authorized personnel only</p>
      </div>
    </div>
  )
}
