import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the API base URL for the current environment
 * Production: https://chenaniah.com/api
 * Development: Uses NEXT_PUBLIC_API_URL or falls back to localhost
 */
export function getApiBaseUrl(): string {
  // Use environment variable if set (highest priority)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Check if we're running in the browser
  if (typeof window !== 'undefined') {
    // If on production domain, use production API
    if (window.location.hostname === 'chenaniah.com' || window.location.hostname === 'www.chenaniah.com') {
      return 'https://chenaniah.com/api'
    }
    // For local development in browser
    return 'http://localhost:5001/api'
  }
  
  // Server-side: check NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    return 'https://chenaniah.com/api'
  }
  
  // Development fallback
  return 'http://localhost:5001/api'
}
