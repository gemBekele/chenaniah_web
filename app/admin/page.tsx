"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLogin from '@/components/admin-login'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Mark component as mounted to prevent hydration mismatches
    setMounted(true)
    
    // Check if user is already authenticated
    if (typeof window !== 'undefined') {
      let token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
      
      // If no full token, try to reconstruct from compressed storage
      if (!token) {
        const compressedToken = localStorage.getItem('admin_token_compressed')
        const header = localStorage.getItem('admin_token_header')
        if (compressedToken && header) {
          token = `${header}.${compressedToken}`
        }
      }
      
      if (token) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    }
    setIsLoading(false)
  }, [])

  const handleLoginSuccess = (token: string) => {
    console.log("Login success, setting token:", token)
    
    // Try to compress the token by storing only the payload and signature parts
    const tryCompressedStorage = () => {
      try {
        // Split JWT into parts and store only the payload and signature
        const parts = token.split('.')
        if (parts.length === 3) {
          const compressedToken = `${parts[1]}.${parts[2]}` // Skip header, keep payload and signature
          localStorage.setItem('admin_token_compressed', compressedToken)
          localStorage.setItem('admin_token_header', parts[0])
          return true
        }
      } catch (error) {
        console.log("Compressed storage failed:", error)
      }
      return false
    }
    
    try {
      localStorage.setItem('admin_token', token)
      setIsAuthenticated(true)
      console.log("Authentication state set to true")
    } catch (error) {
      console.error("Failed to store token in localStorage:", error)
      
      // Try compressed storage
      if (tryCompressedStorage()) {
        setIsAuthenticated(true)
        console.log("Token stored in compressed format")
        return
      }
      
      // Store token in sessionStorage as fallback
      try {
        sessionStorage.setItem('admin_token', token)
        setIsAuthenticated(true)
        console.log("Token stored in sessionStorage instead")
      } catch (sessionError) {
        console.error("Failed to store token in sessionStorage:", sessionError)
        // If all fail, we can still proceed with authentication for this session
        setIsAuthenticated(true)
        console.log("Proceeding without persistent token storage")
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_token_compressed')
    localStorage.removeItem('admin_token_header')
    sessionStorage.removeItem('admin_token')
    setIsAuthenticated(false)
  }

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      router.push('/admin/applications')
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthenticated ? (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg">Redirecting...</p>
          </div>
        </div>
      )}
    </div>
  )
}

