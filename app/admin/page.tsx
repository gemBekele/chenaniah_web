"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLogin from '@/components/admin-login'

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isStudent, setIsStudent] = useState(false)
  const router = useRouter()

  // Check authentication after component mounts (client-side only)
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    // Use requestAnimationFrame to ensure this runs after React hydration
    const rafId = requestAnimationFrame(() => {
      // Check for admin token first
      let token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
      let studentFlag = false
      
      // If no admin token, check for student token
      if (!token) {
        token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
        studentFlag = !!token
      }
      
      // If no full token, try to reconstruct from compressed storage
      if (!token) {
        const compressedToken = localStorage.getItem('admin_token_compressed')
        const header = localStorage.getItem('admin_token_header')
        if (compressedToken && header) {
          token = `${header}.${compressedToken}`
        }
      }
      
      setIsAuthenticated(!!token)
      setIsStudent(studentFlag)
      setIsLoading(false)
      setMounted(true)
    })
    
    return () => cancelAnimationFrame(rafId)
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
    localStorage.removeItem('student_token')
    sessionStorage.removeItem('student_token')
    localStorage.removeItem('student_role')
    sessionStorage.removeItem('student_role')
    localStorage.removeItem('student_user')
    sessionStorage.removeItem('student_user')
    localStorage.removeItem('student_permissions')
    sessionStorage.removeItem('student_permissions')
    setIsAuthenticated(false)
  }

  // Load student permissions on mount
  useEffect(() => {
    const loadStudentPermissions = async () => {
      const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
      if (!token) return

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/student/roles/my-roles`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          // Extract all permissions from roles
          const permissions = new Set<string>()
          data.roles?.forEach((role: any) => {
            role.permissions?.forEach((perm: string) => permissions.add(perm))
          })
          const permsArray = Array.from(permissions)
          localStorage.setItem('student_permissions', JSON.stringify(permsArray))
          sessionStorage.setItem('student_permissions', JSON.stringify(permsArray))

          if (data.ledSection) {
            localStorage.setItem('led_section', JSON.stringify(data.ledSection))
            sessionStorage.setItem('led_section', JSON.stringify(data.ledSection))
          } else {
            localStorage.removeItem('led_section')
            sessionStorage.removeItem('led_section')
          }
        }
      } catch (error) {
        console.error('Error loading student permissions:', error)
      }
    }

    // Only load permissions if we have a student token (not admin)
    const adminToken = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!adminToken) {
      loadStudentPermissions()
    }
  }, [])

  // Permission-to-route mapping (same order as sidebar navItems)
  const permissionRouteMap: Record<string, string> = {
    interview: '/admin/interview',
    trainees: '/admin/trainees',
    sections: '/admin/sections',
    assignments: '/admin/assignments',
    payments: '/admin/payments',
    attendance: '/admin/attendance',
    resources: '/admin/resources',
    notes: '/admin/notes',
    notices: '/admin/notices',
    teams: '/admin/teams',
    applications: '/admin/applications',
    prayer: '/admin/prayer',
  }

  useEffect(() => {
    if (mounted && isAuthenticated && typeof window !== 'undefined') {
      if (!isStudent) {
        // Admin users go to applications
        router.push('/admin/applications')
      } else {
        // Student users: redirect to their first permitted module
        setTimeout(() => {
          try {
            const perms = localStorage.getItem('student_permissions') || sessionStorage.getItem('student_permissions')
            if (perms) {
              const permissions: string[] = JSON.parse(perms)
              // Find first permitted route
              for (const [perm, route] of Object.entries(permissionRouteMap)) {
                if (permissions.includes(perm)) {
                  router.push(route)
                  return
                }
              }
            }
          } catch (e) {
            console.error('Error parsing student permissions:', e)
          }
          // Fallback if no permissions found
          router.push('/admin/applications')
        }, 500) // Small delay to allow permissions to load
      }
    }
  }, [mounted, isAuthenticated, isStudent, router])

  // Show loading state until mounted to prevent hydration mismatch
  // Always render the same structure on server and initial client render
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

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

