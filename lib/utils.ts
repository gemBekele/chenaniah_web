import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a hostname is a local IP address
 */
function isLocalIP(hostname: string): boolean {
  // localhost variants
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return true
  }
  
  // Private IP ranges
  // 192.168.x.x
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true
  }
  // 10.x.x.x
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true
  }
  // 172.16.x.x - 172.31.x.x
  if (/^172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true
  }
  
  return false
}

/**
 * Get the API base URL for the current environment
 * Default: https://chenaniah.org/api/v2/api
 * Development: Uses NEXT_PUBLIC_API_URL or detects local development
 * 
 * Note: The backend now supports both /api/v2/* and /api/v2/api/* formats.
 * Nginx rewrites /api/v2/api/* to /api/api/* which the backend handles.
 */
export function getApiBaseUrl(): string {
  // Use environment variable if set (highest priority)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Check if we're running in the browser
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const port = window.location.port
    
    // If accessing via local IP or localhost, use local backend
    if (isLocalIP(hostname)) {
      // Use the same hostname but port 5001 for backend
      // This allows mobile devices to connect to the backend on the same network
      return `http://${hostname}:5001/api`
    }
    
    // Default to production API v2/api for all other cases
    return 'https://chenaniah.org/api/v2/api'
  }
  
  // Server-side: default to production API v2/api
  // Only use localhost if explicitly in development mode AND on localhost
  if (process.env.NODE_ENV === 'development' && process.env.VERCEL !== '1') {
    // Only use localhost in true local development
    return 'http://localhost:5001/api'
  }
  
  // Default fallback: production API v2/api
  return 'https://chenaniah.org/api/v2/api'
}
