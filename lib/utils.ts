import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the API base URL for the current environment
 * Default: https://chenaniah.org/api
 * Development: Uses NEXT_PUBLIC_API_URL or localhost only if explicitly set
 */
export function getApiBaseUrl(): string {
  // Use environment variable if set (highest priority)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Check if we're running in the browser
  if (typeof window !== 'undefined') {
    // Only use localhost if explicitly running on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5001/api'
    }
    // Default to production API for all other cases
    return 'https://chenaniah.org/api'
  }
  
  // Server-side: default to production API
  // Only use localhost if explicitly in development mode AND on localhost
  if (process.env.NODE_ENV === 'development' && process.env.VERCEL !== '1') {
    // Only use localhost in true local development
    return 'http://localhost:5001/api'
  }
  
  // Default fallback: production API
  return 'https://chenaniah.org/api'
}
