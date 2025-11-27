/**
 * Authentication utilities for student portal
 */

const API_BASE_URL = typeof window !== 'undefined' 
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5001/api'
      : 'https://chenaniah.org/api')
  : 'https://chenaniah.org/api'

export function clearStudentAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('student_token')
    localStorage.removeItem('student_role')
    localStorage.removeItem('student_user')
    sessionStorage.removeItem('student_token')
    sessionStorage.removeItem('student_role')
    sessionStorage.removeItem('student_user')
  }
}

export async function validateStudentToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/student/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.success === true && !!data.user
    }
    return false
  } catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}

export function getStudentToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
}







