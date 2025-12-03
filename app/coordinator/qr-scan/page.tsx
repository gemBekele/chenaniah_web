"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Loader2,
  LogOut,
  Shield,
  Wifi,
  WifiOff,
  CheckCircle,
  Camera,
  Calendar,
  Plus,
  History,
  Settings,
  X,
  Zap,
} from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import {
  initOfflineStorage,
  saveOfflineRecord,
  getOfflineRecords,
  markRecordAsSynced,
  getOfflineRecordCount,
} from "@/lib/offline-storage"
import { toast } from "sonner"

const API_BASE_URL = getApiBaseUrl()

interface Session {
  id: number
  name: string
  date: string
  location?: string
  status: string
}

interface AttendanceRecord {
  id: number
  student: {
    id: number
    fullNameEnglish?: string
    fullNameAmharic?: string
    username: string
  }
  scannedAt: string
  isOffline?: boolean
}

export default function QRScanPage() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [offlineCount, setOfflineCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastScanned, setLastScanned] = useState<{ name: string; time: string } | null>(null)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newSessionName, setNewSessionName] = useState("")
  const [newSessionDate, setNewSessionDate] = useState("")
  const [newSessionLocation, setNewSessionLocation] = useState("")
  const scannerRef = useRef<any>(null)
  const lastScanRef = useRef<{ code: string; timestamp: number } | null>(null)
  const handleQRScanRef = useRef<((qrCode: string) => void) | null>(null)
  const scannerHealthCheckRef = useRef<NodeJS.Timeout | null>(null)
  const isScanningRef = useRef(false)
  const isRestartingRef = useRef(false)
  const wasScanningBeforeUnmountRef = useRef(false)
  const restartAttemptedRef = useRef(false)
  const startScanningRef = useRef<(() => Promise<void>) | null>(null)
  const loadSessionsRef = useRef<(() => Promise<void>) | null>(null)
  const syncOfflineRecordsRef = useRef<(() => Promise<void>) | null>(null)
  const updateOfflineCountRef = useRef<(() => Promise<void>) | null>(null)
  const [scanFeedback, setScanFeedback] = useState<"success" | "error" | null>(null)
  const [scanMessage, setScanMessage] = useState("")

  const getToken = useCallback(() => {
    return localStorage.getItem("coordinator_token") || sessionStorage.getItem("coordinator_token")
  }, [])

  const updateOfflineCount = useCallback(async () => {
    const count = await getOfflineRecordCount()
    setOfflineCount(count)
  }, [])

  const loadAttendance = useCallback(async (sessionId: number) => {
    console.log("[Load Attendance] ========== LOAD ATTENDANCE ==========")
    console.log("[Load Attendance] Session ID:", sessionId)
    console.log("[Load Attendance] Scanner state - isScanning:", isScanningRef.current, "scannerRef exists:", !!scannerRef.current)
    
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        console.log("[Load Attendance] Scanner state before load:", state)
      } catch (e) {
        console.log("[Load Attendance] Could not get scanner state:", e)
      }
    }
    
    try {
      console.log("[Load Attendance] Fetching attendance records...")
      const response = await fetch(`${API_BASE_URL}/attendance/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      if (data.success) {
        const records = data.session.attendanceRecords || []
        console.log("[Load Attendance] Loaded", records.length, "attendance records")
        console.log("[Load Attendance] Setting attendance records state...")
        setAttendanceRecords(records)
        
        console.log("[Load Attendance] Scanner state after setState - isScanning:", isScanningRef.current)
        if (scannerRef.current) {
          try {
            const state = scannerRef.current.getState()
            console.log("[Load Attendance] Scanner state after setState:", state)
          } catch (e) {
            console.log("[Load Attendance] Could not get scanner state:", e)
          }
        }
      } else {
        console.warn("[Load Attendance] API response was not successful:", data)
      }
    } catch (error) {
      console.error("[Load Attendance] ✗ Error loading attendance:", error)
    }
    console.log("[Load Attendance] ========== LOAD ATTENDANCE COMPLETE ==========")
  }, [getToken])

  const loadSessions = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/sessions`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      if (data.success) {
        const activeSessions = data.sessions.filter((s: Session) => s.status === "active")
        setSessions(activeSessions)
        if (activeSessions.length > 0 && !currentSession) {
          setCurrentSession(activeSessions[0])
          loadAttendance(activeSessions[0].id)
        }
      }
    } catch (error) {
      console.error("Error loading sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }, [getToken, currentSession, loadAttendance])

  // Sync logic
  const syncOfflineRecords = useCallback(async () => {
    console.log("[Sync] ========== SYNC OFFLINE RECORDS ==========")
    console.log("[Sync] isSyncing:", isSyncing, "isOnline:", isOnline)
    console.log("[Sync] Scanner state - isScanning:", isScanningRef.current, "scannerRef exists:", !!scannerRef.current)
    
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        console.log("[Sync] Scanner state before sync:", state)
      } catch (e) {
        console.log("[Sync] Could not get scanner state:", e)
      }
    }
    
    if (isSyncing || !isOnline) {
      console.log("[Sync] Skipping sync - isSyncing:", isSyncing, "isOnline:", isOnline)
      return
    }

    console.log("[Sync] Getting offline records...")
    const records = await getOfflineRecords()
    console.log("[Sync] Found", records.length, "offline records")
    if (records.length === 0) {
      console.log("[Sync] No records to sync, returning")
      return
    }

    console.log("[Sync] Setting isSyncing to true")
    setIsSyncing(true)
    try {
      console.log("[Sync] Sending sync request to API...")
      const response = await fetch(`${API_BASE_URL}/attendance/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          records: records.map((r) => ({
            sessionId: r.sessionId,
            qrCode: r.qrCode,
            scannedAt: r.scannedAt,
          })),
        }),
      })

      console.log("[Sync] API response status:", response.status)
      const data = await response.json()
      console.log("[Sync] API response data:", data)
      
      if (data.success) {
        console.log("[Sync] Marking records as synced...")
        for (const record of records) {
          if (record.id) await markRecordAsSynced(record.id)
        }
        console.log("[Sync] Updating offline count...")
        await updateOfflineCount()
        
        console.log("[Sync] Scanner state before loadAttendance - isScanning:", isScanningRef.current)
        if (scannerRef.current) {
          try {
            const state = scannerRef.current.getState()
            console.log("[Sync] Scanner state before loadAttendance:", state)
          } catch (e) {
            console.log("[Sync] Could not get scanner state:", e)
          }
        }
        
        if (currentSession) {
          console.log("[Sync] Loading attendance for session:", currentSession.id)
          loadAttendance(currentSession.id)
        }
        
        console.log("[Sync] Scanner state after loadAttendance - isScanning:", isScanningRef.current)
        if (scannerRef.current) {
          try {
            const state = scannerRef.current.getState()
            console.log("[Sync] Scanner state after loadAttendance:", state)
          } catch (e) {
            console.log("[Sync] Could not get scanner state:", e)
          }
        }
        
        if (data.successCount > 0) {
          console.log("[Sync] Successfully synced", data.successCount, "records")
        }
      } else {
        console.warn("[Sync] Sync was not successful:", data)
      }
    } catch (error) {
      console.error("[Sync] ✗ Sync error:", error)
    } finally {
      console.log("[Sync] Setting isSyncing to false")
      setIsSyncing(false)
      console.log("[Sync] Scanner state after sync - isScanning:", isScanningRef.current)
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState()
          console.log("[Sync] Scanner state after sync:", state)
        } catch (e) {
          console.log("[Sync] Could not get scanner state:", e)
        }
      }
      console.log("[Sync] ========== SYNC COMPLETE ==========")
    }
  }, [isSyncing, isOnline, getToken, updateOfflineCount, currentSession, loadAttendance])

  // Initial setup
  useEffect(() => {
    console.log("[Init] ========== INITIAL SETUP ==========")
    const token = getToken()
    if (!token) {
      console.log("[Init] No token found, redirecting to coordinator login")
      router.push("/coordinator")
      return
    }

    console.log("[Init] Initializing offline storage...")
    initOfflineStorage().then(() => {
      console.log("[Init] Offline storage initialized")
      console.log("[Init] Updating offline count...")
      if (updateOfflineCountRef.current) {
        updateOfflineCountRef.current()
      }
      console.log("[Init] Loading sessions...")
      if (loadSessionsRef.current) {
        loadSessionsRef.current()
      }
    })

    const handleOnline = () => {
      console.log("[Init] Network came online")
      setIsOnline(true)
      if (syncOfflineRecordsRef.current) {
        syncOfflineRecordsRef.current()
      }
    }
    const handleOffline = () => {
      console.log("[Init] Network went offline")
      setIsOnline(false)
    }

    console.log("[Init] Adding online/offline event listeners")
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    const initialOnline = navigator.onLine
    console.log("[Init] Initial online status:", initialOnline)
    setIsOnline(initialOnline)

    // Periodic sync attempt if online
    console.log("[Init] Setting up periodic sync (every 30s)")
    const syncInterval = setInterval(() => {
      if (navigator.onLine && syncOfflineRecordsRef.current) {
        console.log("[Init] Periodic sync triggered")
        syncOfflineRecordsRef.current()
      }
    }, 30000)

    return () => {
      console.log("[Init] Cleaning up initial setup...")
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(syncInterval)
      console.log("[Init] Initial setup cleanup complete")
      // Only stop scanner on actual unmount, not on re-renders
      // The scanner ref will persist across re-renders
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, getToken]) // Only depend on router and getToken - use refs for other functions

  // Cleanup scanner only on unmount
  useEffect(() => {
    console.log("[Effect] Component mounted, cleanup function registered")
    console.log("[Effect] wasScanningBeforeUnmountRef:", wasScanningBeforeUnmountRef.current)
    console.log("[Effect] currentSession:", currentSession?.id)
    console.log("[Effect] isScanning state:", isScanning)
    console.log("[Effect] isScanningRef:", isScanningRef.current)
    console.log("[Effect] scannerRef exists:", !!scannerRef.current)
    // Note: Restart logic is handled in a separate effect after refs are set
    
    return () => {
      console.log("[Effect] Component unmounting, cleaning up scanner...")
      // Remember if we were scanning BEFORE checking state
      const wasScanning = isScanningRef.current && !!scannerRef.current
      wasScanningBeforeUnmountRef.current = wasScanning
      console.log("[Effect] Remembering scanning state:", wasScanningBeforeUnmountRef.current)
      console.log("[Effect] isScanningRef:", isScanningRef.current, "scannerRef exists:", !!scannerRef.current)
      
      // Stop health check
      if (scannerHealthCheckRef.current) {
        console.log("[Effect] Stopping health check on unmount")
        clearInterval(scannerHealthCheckRef.current)
        scannerHealthCheckRef.current = null
      }
      
      // Stop and clear scanner, but keep isScanningRef true if we were scanning
      // This way we know to restart on remount
      if (scannerRef.current) {
        console.log("[Effect] Stopping scanner on unmount")
        try {
          scannerRef.current.stop().catch(() => {})
          console.log("[Effect] Scanner stopped on unmount")
        } catch (e) {
          console.warn("[Effect] Error stopping scanner on unmount:", e)
          // Ignore errors during cleanup
        }
        scannerRef.current = null
      }
      
      // Keep isScanningRef as true if we were scanning - we'll use it to restart
      // Only set to false if we explicitly stopped scanning
      if (!wasScanning) {
        isScanningRef.current = false
      }
      
      console.log("[Effect] Cleanup complete - isScanningRef:", isScanningRef.current)
    }
  }, []) // Empty deps - only run on actual mount/unmount, not on state changes

  const handleQRScan = useCallback((qrCode: string) => {
    console.log("[QR Scan] handleQRScan called with QR code:", qrCode)
    console.log("[QR Scan] Current session:", currentSession?.id, currentSession?.name)
    console.log("[QR Scan] Scanner state - isScanning:", isScanningRef.current, "scannerRef exists:", !!scannerRef.current)
    
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        console.log("[QR Scan] Scanner state value:", state, "(1=NOT_STARTED, 2=SCANNING, 3=PAUSED)")
      } catch (e) {
        console.log("[QR Scan] Could not get scanner state:", e)
      }
    }
    
    if (!currentSession) {
      console.warn("[QR Scan] No session selected!")
      setScanFeedback("error")
      setScanMessage("No session selected")
      setTimeout(() => setScanFeedback(null), 2000)
      return
    }

    console.log("[QR Scan] Showing feedback and saving record...")
    // Show feedback immediately
    setScanFeedback("success")
    setScanMessage("Scanned!")
    setLastScanned({
      name: isOnline ? "Verifying..." : "Recorded (Offline)",
      time: new Date().toLocaleTimeString(),
    })

    // Do all async work in the background without awaiting
    // This prevents blocking or interfering with the scanner
    console.log("[QR Scan] Starting async save operation...")
    saveOfflineRecord({
      sessionId: currentSession.id,
      qrCode,
      scannedAt: new Date().toISOString(),
    }).then(() => {
      console.log("[QR Scan] Save completed successfully")
      // Update offline count after save completes
      updateOfflineCount()
      
      // Trigger background sync after a longer delay
      if (navigator.onLine) {
        console.log("[QR Scan] Scheduling sync in 3 seconds...")
        setTimeout(() => {
          console.log("[QR Scan] Starting sync operation...")
          syncOfflineRecords()
        }, 3000)
      } else {
        console.log("[QR Scan] Offline - skipping sync")
      }
    }).catch((error) => {
      console.error("[QR Scan] Save error:", error)
      setScanFeedback("error")
      setScanMessage("Save failed")
    })

    // Clear feedback after delay
    setTimeout(() => {
      console.log("[QR Scan] Clearing feedback")
      setScanFeedback(null)
    }, 1500)
  }, [currentSession, updateOfflineCount, syncOfflineRecords])

  // Keep ref in sync with latest handler
  useEffect(() => {
    console.log("[Effect] Updating handleQRScanRef with latest handler")
    handleQRScanRef.current = handleQRScan
    console.log("[Effect] handleQRScanRef updated, current exists:", !!handleQRScanRef.current)
  }, [handleQRScan])

  // Update last scanned name when attendance records change
  useEffect(() => {
    if (lastScanned?.name === "Verifying..." && attendanceRecords.length > 0) {
      // Find the most recent record
      // We assume records are sorted by date desc, but let's be safe and find the max
      const latestRecord = attendanceRecords.reduce((prev, current) => {
        return (new Date(prev.scannedAt) > new Date(current.scannedAt)) ? prev : current
      })
      
      // Check if this record is recent (within last 30 seconds)
      const recordTime = new Date(latestRecord.scannedAt).getTime()
      const now = Date.now()
      if (now - recordTime < 30000) { 
         setLastScanned(prev => prev ? ({
           ...prev,
           name: latestRecord.student.fullNameEnglish || latestRecord.student.username || "Unknown"
         }) : null)
      }
    }
  }, [attendanceRecords, lastScanned])

  const startScanning = async () => {
    console.log("[Start Scan] ========== START SCANNING ==========")
    console.log("[Start Scan] Current session:", currentSession?.id, currentSession?.name)
    console.log("[Start Scan] isScanningRef:", isScanningRef.current)
    console.log("[Start Scan] scannerRef exists:", !!scannerRef.current)
    
    if (!currentSession) {
      console.error("[Start Scan] No session selected!")
      toast.error("Please select a session first")
      return
    }

    // If scanner is already running and actually exists, don't restart
    if (isScanningRef.current && scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        console.log("[Start Scan] Scanner already running with state:", state)
        if (state === 2) { // SCANNING
          console.log("[Start Scan] Scanner is already SCANNING, skipping start")
          return
        }
      } catch (e) {
        console.log("[Start Scan] Error checking scanner state, continuing:", e)
        // Continue to start scanner - might be in bad state
      }
    }
    
    // If isScanningRef is true but scannerRef is null, we're in a bad state (remount scenario)
    // Reset isScanningRef and continue to start
    if (isScanningRef.current && !scannerRef.current) {
      console.log("[Start Scan] isScanningRef is true but scannerRef is null - resetting and restarting")
      isScanningRef.current = false
    }

    // Clean up any existing scanner first
    if (scannerRef.current) {
      console.log("[Start Scan] Cleaning up existing scanner...")
      try {
        await scannerRef.current.stop()
        console.log("[Start Scan] Existing scanner stopped successfully")
      } catch (e) {
        console.warn("[Start Scan] Error stopping existing scanner:", e)
        // Ignore
      }
      scannerRef.current = null
    }
    
    // Clear the scanner container to ensure clean start
    const container = document.getElementById("qr-reader")
    if (container) {
      console.log("[Start Scan] Clearing container HTML, current innerHTML length:", container.innerHTML.length)
      container.innerHTML = ""
      console.log("[Start Scan] Container cleared")
    } else {
      console.error("[Start Scan] Container element 'qr-reader' not found!")
    }

    try {
      console.log("[Start Scan] Importing html5-qrcode...")
      const { Html5Qrcode } = await import("html5-qrcode")
      console.log("[Start Scan] Creating new Html5Qrcode instance...")
      const html5QrCode = new Html5Qrcode("qr-reader")

      const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 }
      console.log("[Start Scan] Config:", config)
      
      // Use ref-based callback to avoid stale closures
      let scanCount = 0
      const onScanSuccess = (decodedText: string) => {
        scanCount++
        console.log(`[Scan Success #${scanCount}] QR code detected:`, decodedText)
        console.log(`[Scan Success #${scanCount}] handleQRScanRef exists:`, !!handleQRScanRef.current)
        console.log(`[Scan Success #${scanCount}] scannerRef exists:`, !!scannerRef.current)
        
        // Debounce: Ignore if same code scanned within 2 seconds
        const now = Date.now()
        if (lastScanRef.current && 
            lastScanRef.current.code === decodedText && 
            now - lastScanRef.current.timestamp < 2000) {
          console.log(`[Scan Success #${scanCount}] Duplicate scan ignored (within 2s)`)
          return
        }
        
        console.log(`[Scan Success #${scanCount}] Processing new scan...`)
        lastScanRef.current = { code: decodedText, timestamp: now }
        // Use ref to always call the latest handler
        if (handleQRScanRef.current) {
          console.log(`[Scan Success #${scanCount}] Calling handleQRScanRef...`)
          try {
            handleQRScanRef.current(decodedText)
            console.log(`[Scan Success #${scanCount}] handleQRScanRef called successfully`)
          } catch (error) {
            console.error(`[Scan Success #${scanCount}] Error in handleQRScanRef:`, error)
          }
        } else {
          console.warn(`[Scan Success #${scanCount}] handleQRScanRef.current is null!`)
        }
      }
      
      let frameErrorCount = 0
      const onScanError = (errorMessage: string) => {
        frameErrorCount++
        // Log frame errors occasionally (not every frame)
        if (frameErrorCount % 100 === 0) { // Log every 100th error
          console.debug(`[Start Scan] Frame error #${frameErrorCount} (sampled):`, errorMessage)
        }
      }
      
      // Prefer environment camera
      try {
        console.log("[Start Scan] Attempting to start with environment camera...")
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          onScanError
        )
        console.log("[Start Scan] ✓ Scanner started successfully with environment camera")
        scannerRef.current = html5QrCode
        isScanningRef.current = true
        wasScanningBeforeUnmountRef.current = true
        restartAttemptedRef.current = false // Reset restart flag on successful start
        setIsScanning(true)
        
        // Verify state after start
        try {
          const state = scannerRef.current.getState()
          console.log("[Start Scan] Scanner state after start:", state)
        } catch (e) {
          console.warn("[Start Scan] Could not verify state:", e)
        }
        
        // Start health check
        console.log("[Start Scan] Starting health check...")
        startHealthCheck()
      } catch (err) {
        console.warn("[Start Scan] Environment camera failed, trying user camera:", err)
        // Fallback to user camera
        await html5QrCode.start(
          { facingMode: "user" },
          config,
          onScanSuccess,
          onScanError
        )
        console.log("[Start Scan] ✓ Scanner started successfully with user camera")
        scannerRef.current = html5QrCode
        isScanningRef.current = true
        wasScanningBeforeUnmountRef.current = true
        restartAttemptedRef.current = false // Reset restart flag on successful start
        setIsScanning(true)
        
        // Verify state after start
        try {
          const state = scannerRef.current.getState()
          console.log("[Start Scan] Scanner state after start:", state)
        } catch (e) {
          console.warn("[Start Scan] Could not verify state:", e)
        }
        
        // Start health check
        console.log("[Start Scan] Starting health check...")
        startHealthCheck()
      }
    } catch (error) {
      console.error("[Start Scan] ✗ FATAL ERROR starting scanner:", error)
      toast.error("Failed to start camera")
      isScanningRef.current = false
      setIsScanning(false)
    }
    console.log("[Start Scan] ========== START SCANNING COMPLETE ==========")
  }

  // Keep function refs updated
  useEffect(() => {
    startScanningRef.current = startScanning
    loadSessionsRef.current = loadSessions
    syncOfflineRecordsRef.current = syncOfflineRecords
    updateOfflineCountRef.current = updateOfflineCount
    console.log("[Effect] Function refs updated")
  }, [startScanning, loadSessions, syncOfflineRecords, updateOfflineCount])
  
  // Handle restart after refs are set
  useEffect(() => {
    // If we were scanning before unmount and have a session, restart scanning
    // This runs after refs are set, so startScanningRef should be available
    if (wasScanningBeforeUnmountRef.current && 
        currentSession && 
        !scannerRef.current && 
        startScanningRef.current &&
        !restartAttemptedRef.current) {
      console.log("[Effect] Restart effect - Was scanning before unmount but scanner is lost, restarting scanner...")
      console.log("[Effect] Restart conditions:", {
        wasScanning: wasScanningBeforeUnmountRef.current,
        hasSession: !!currentSession,
        scannerExists: !!scannerRef.current,
        hasStartFn: !!startScanningRef.current,
        isScanningRef: isScanningRef.current,
        alreadyAttempted: restartAttemptedRef.current
      })
      
      restartAttemptedRef.current = true
      
      // Use requestAnimationFrame to ensure DOM is ready, then small delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          // Double-check conditions before restarting
          if (startScanningRef.current && currentSession && !scannerRef.current) {
            console.log("[Effect] Restart effect - Executing restart...")
            // Reset isScanningRef to false so startScanning can proceed
            isScanningRef.current = false
            wasScanningBeforeUnmountRef.current = false // Clear flag so we don't restart again
            startScanningRef.current()
          } else {
            console.log("[Effect] Restart effect - Restart conditions no longer met, skipping restart:", {
              hasStartFn: !!startScanningRef.current,
              hasSession: !!currentSession,
              scannerExists: !!scannerRef.current
            })
            restartAttemptedRef.current = false // Allow retry if conditions change
          }
        }, 200)
      })
    }
  }, [currentSession, startScanning]) // Run when currentSession or startScanning changes (which updates the ref)

  // Health check - restart scanner if it stops unexpectedly
  const startHealthCheck = () => {
    console.log("[Health Check] Starting health check interval...")
    // Clear any existing health check
    if (scannerHealthCheckRef.current) {
      console.log("[Health Check] Clearing existing health check interval")
      clearInterval(scannerHealthCheckRef.current)
    }
    
    let checkCount = 0
    scannerHealthCheckRef.current = setInterval(() => {
      checkCount++
      if (checkCount % 10 === 0) { // Log every 10th check (every 10 seconds)
        console.log("[Health Check] Health check running (check #" + checkCount + ")")
      }
      
      // Skip if intentionally stopped or already restarting
      if (!isScanningRef.current || isRestartingRef.current) {
        if (!isScanningRef.current && scannerHealthCheckRef.current) {
          // Scanner was intentionally stopped - clear the interval
          console.log("[Health Check] Scanner intentionally stopped, clearing health check")
          clearInterval(scannerHealthCheckRef.current)
          scannerHealthCheckRef.current = null
        } else if (isRestartingRef.current) {
          if (checkCount % 10 === 0) {
            console.log("[Health Check] Scanner is restarting, skipping check")
          }
        }
        return
      }
      
      // Check if scanner is still running
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState()
          // State: 1 = NOT_STARTED, 2 = SCANNING, 3 = PAUSED
          if (state !== 2) {
            console.warn("[Health Check] ⚠️ Scanner stopped unexpectedly! State:", state, "(expected 2=SCANNING)")
            console.warn("[Health Check] Triggering restart...")
            // Scanner stopped - restart it
            restartScanner()
          } else {
            if (checkCount % 30 === 0) { // Log every 30 seconds that scanner is healthy
              console.log("[Health Check] ✓ Scanner healthy (state: 2=SCANNING)")
              // Also check if we can access the video element to confirm it's active
              try {
                const container = document.getElementById("qr-reader")
                if (container) {
                  const video = container.querySelector("video")
                  if (video) {
                    console.log("[Health Check] Video element found, readyState:", video.readyState, "paused:", video.paused)
                  } else {
                    console.warn("[Health Check] No video element found in container!")
                  }
                }
              } catch (e) {
                console.warn("[Health Check] Error checking video element:", e)
              }
            }
          }
        } catch (e) {
          console.error("[Health Check] ✗ Error checking scanner state:", e)
          console.error("[Health Check] Triggering restart...")
          restartScanner()
        }
      } else if (isScanningRef.current && !isRestartingRef.current) {
        // Scanner ref is null but should be scanning
        console.error("[Health Check] ✗ Scanner ref is null but should be scanning!")
        console.error("[Health Check] Triggering restart...")
        restartScanner()
      }
    }, 1000) // Check every second
    console.log("[Health Check] Health check interval started")
  }

  const restartScanner = async () => {
    console.log("[Restart Scanner] ========== RESTART SCANNER ==========")
    console.log("[Restart Scanner] isRestartingRef:", isRestartingRef.current)
    console.log("[Restart Scanner] isScanningRef:", isScanningRef.current)
    console.log("[Restart Scanner] currentSession:", currentSession?.id)
    
    // Prevent multiple simultaneous restart attempts
    if (isRestartingRef.current) {
      console.warn("[Restart Scanner] Already restarting, skipping...")
      return
    }
    if (!currentSession || !isScanningRef.current) {
      console.warn("[Restart Scanner] Cannot restart - no session or not scanning:", {
        hasSession: !!currentSession,
        isScanning: isScanningRef.current
      })
      return
    }
    
    console.log("[Restart Scanner] Setting isRestartingRef to true")
    isRestartingRef.current = true
    
    // Clean up old scanner
    if (scannerRef.current) {
      console.log("[Restart Scanner] Stopping old scanner...")
      try {
        const oldState = scannerRef.current.getState()
        console.log("[Restart Scanner] Old scanner state before stop:", oldState)
        await scannerRef.current.stop()
        console.log("[Restart Scanner] Old scanner stopped successfully")
      } catch (e) {
        console.warn("[Restart Scanner] Error stopping old scanner:", e)
        // Ignore
      }
      scannerRef.current = null
    } else {
      console.log("[Restart Scanner] No old scanner to stop")
    }
    
    // Clear the scanner container to ensure clean restart
    const container = document.getElementById("qr-reader")
    if (container) {
      console.log("[Restart Scanner] Clearing container, current innerHTML length:", container.innerHTML.length)
      container.innerHTML = ""
      console.log("[Restart Scanner] Container cleared")
    } else {
      console.error("[Restart Scanner] Container element 'qr-reader' not found!")
    }
    
    // Small delay before restarting
    console.log("[Restart Scanner] Waiting 300ms before restart...")
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Check if we should still be scanning
    if (!isScanningRef.current) {
      console.log("[Restart Scanner] Scanning was stopped, aborting restart")
      isRestartingRef.current = false
      return
    }
    
    try {
      console.log("[Restart Scanner] Importing html5-qrcode...")
      const { Html5Qrcode } = await import("html5-qrcode")
      console.log("[Restart Scanner] Creating new Html5Qrcode instance...")
      const html5QrCode = new Html5Qrcode("qr-reader")
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 }
      
      let restartScanCount = 0
      const onScanSuccess = (decodedText: string) => {
        restartScanCount++
        console.log(`[Restart Scanner] QR code detected after restart #${restartScanCount}:`, decodedText)
        const now = Date.now()
        if (lastScanRef.current && 
            lastScanRef.current.code === decodedText && 
            now - lastScanRef.current.timestamp < 2000) {
          console.log(`[Restart Scanner] Duplicate scan ignored`)
          return
        }
        lastScanRef.current = { code: decodedText, timestamp: now }
        if (handleQRScanRef.current) {
          console.log(`[Restart Scanner] Calling handleQRScanRef...`)
          handleQRScanRef.current(decodedText)
        } else {
          console.warn(`[Restart Scanner] handleQRScanRef.current is null!`)
        }
      }
      
      let restartFrameErrorCount = 0
      const onScanError = (errorMessage: string) => {
        restartFrameErrorCount++
        // Log every 100th error to confirm frames are being processed
        if (restartFrameErrorCount % 100 === 0) {
          console.debug(`[Restart Scanner] Frame error #${restartFrameErrorCount} (sampled):`, errorMessage)
        }
      }
      
      try {
        console.log("[Restart Scanner] Attempting to start with environment camera...")
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          onScanError
        )
        console.log("[Restart Scanner] ✓ Restarted successfully with environment camera")
        scannerRef.current = html5QrCode
        
        // Verify state
        try {
          const state = scannerRef.current.getState()
          console.log("[Restart Scanner] Scanner state after restart:", state)
        } catch (e) {
          console.warn("[Restart Scanner] Could not verify state:", e)
        }
      } catch (err) {
        console.warn("[Restart Scanner] Environment camera failed, trying user camera:", err)
        await html5QrCode.start(
          { facingMode: "user" },
          config,
          onScanSuccess,
          onScanError
        )
        console.log("[Restart Scanner] ✓ Restarted successfully with user camera")
        scannerRef.current = html5QrCode
        
        // Verify state
        try {
          const state = scannerRef.current.getState()
          console.log("[Restart Scanner] Scanner state after restart:", state)
        } catch (e) {
          console.warn("[Restart Scanner] Could not verify state:", e)
        }
      }
    } catch (error) {
      console.error("[Restart Scanner] ✗ FATAL ERROR restarting scanner:", error)
      isScanningRef.current = false
      setIsScanning(false)
    } finally {
      console.log("[Restart Scanner] Setting isRestartingRef to false")
      isRestartingRef.current = false
      console.log("[Restart Scanner] ========== RESTART COMPLETE ==========")
    }
  }

  const stopScanning = async () => {
    console.log("[Stop Scan] ========== STOP SCANNING ==========")
    console.log("[Stop Scan] isScanningRef:", isScanningRef.current)
    console.log("[Stop Scan] scannerRef exists:", !!scannerRef.current)
    
    // Stop health check
    if (scannerHealthCheckRef.current) {
      console.log("[Stop Scan] Stopping health check interval...")
      clearInterval(scannerHealthCheckRef.current)
      scannerHealthCheckRef.current = null
      console.log("[Stop Scan] Health check stopped")
    }
    
    console.log("[Stop Scan] Setting isScanningRef to false")
    isScanningRef.current = false
    wasScanningBeforeUnmountRef.current = false
    restartAttemptedRef.current = false
    console.log("[Stop Scan] Cleared wasScanningBeforeUnmountRef and restartAttemptedRef")
    
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        console.log("[Stop Scan] Scanner state before stop:", state)
        if (state === 2 || state === 3) { // SCANNING or PAUSED
          console.log("[Stop Scan] Stopping scanner...")
          await scannerRef.current.stop()
          console.log("[Stop Scan] Scanner stopped successfully")
        } else {
          console.log("[Stop Scan] Scanner not in SCANNING/PAUSED state, skipping stop")
        }
      } catch (e) {
        console.warn("[Stop Scan] Error stopping scanner:", e)
        // Scanner already stopped
      }
      scannerRef.current = null
      console.log("[Stop Scan] scannerRef cleared")
    } else {
      console.log("[Stop Scan] No scanner to stop")
    }
    
    // Clear the container
    const container = document.getElementById("qr-reader")
    if (container) {
      console.log("[Stop Scan] Clearing container, innerHTML length:", container.innerHTML.length)
      container.innerHTML = ""
      console.log("[Stop Scan] Container cleared")
    } else {
      console.warn("[Stop Scan] Container element 'qr-reader' not found")
    }
    
    setIsScanning(false)
    console.log("[Stop Scan] ========== STOP SCANNING COMPLETE ==========")
  }

  const createSession = async () => {
    if (!newSessionName || !newSessionDate) {
      toast.error("Please fill in session name and date")
      return
    }

    setIsCreatingSession(true)
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: newSessionName,
          date: new Date(newSessionDate).toISOString(),
          location: newSessionLocation || undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setShowCreateDialog(false)
        setNewSessionName("")
        setNewSessionDate("")
        setNewSessionLocation("")
        await loadSessions()
        if (data.session) {
          setCurrentSession(data.session)
          loadAttendance(data.session.id)
        }
        toast.success("Session created")
      } else {
        toast.error(data.error || "Failed to create session")
      }
    } catch (error) {
      toast.error("Failed to create session")
    } finally {
      setIsCreatingSession(false)
    }
  }

  const handleLogout = () => {
    stopScanning()
    localStorage.removeItem("coordinator_token")
    localStorage.removeItem("coordinator_role")
    sessionStorage.removeItem("coordinator_token")
    router.push("/coordinator")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="bg-card border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 overflow-hidden">
          <Shield className="h-5 w-5 text-primary shrink-0" />
          <div className="flex flex-col overflow-hidden">
            <h1 className="font-bold text-sm truncate">
              {currentSession ? currentSession.name : "Select Session"}
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
               <span className={isOnline ? "text-green-500" : "text-amber-500"}>
                 {isOnline ? "Online" : "Offline"}
               </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0 gap-2">
                <Calendar className="h-4 w-4" />
                Sessions
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Settings & Sessions</SheetTitle>
                <SheetDescription>Manage sessions and account</SheetDescription>
              </SheetHeader>
              
              <div className="py-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Sessions</h3>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" /> New
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Session</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input 
                              value={newSessionName} 
                              onChange={e => setNewSessionName(e.target.value)} 
                              placeholder="e.g. Morning Prayer"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input 
                              type="datetime-local"
                              value={newSessionDate} 
                              onChange={e => setNewSessionDate(e.target.value)} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Location</Label>
                            <Input 
                              value={newSessionLocation} 
                              onChange={e => setNewSessionLocation(e.target.value)} 
                              placeholder="Optional"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={createSession} disabled={isCreatingSession}>
                            {isCreatingSession ? "Creating..." : "Create"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {sessions.map(session => (
                      <Button
                        key={session.id}
                        variant={currentSession?.id === session.id ? "secondary" : "ghost"}
                        className="w-full justify-start text-left font-normal"
                        onClick={() => {
                          setCurrentSession(session)
                          loadAttendance(session.id)
                        }}
                      >
                        <div className="truncate">
                          <div className="font-medium">{session.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(session.date).toLocaleDateString()}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={handleLogout} variant="destructive" className="w-full">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content - Scanner */}
      <div className="flex-1 flex flex-col relative bg-black">
        {/* Camera Viewport */}
        <div id="qr-reader" className="w-full h-full absolute inset-0 bg-black" />
        
        {/* Overlay UI */}
        <div className="relative z-10 flex-1 flex flex-col justify-between p-6 pointer-events-none">
           {/* Top Overlay Status */}
           <div className="flex justify-center pointer-events-auto">
              {scanFeedback && (
                <div className={`
                  px-6 py-3 rounded-full font-bold text-white shadow-lg animate-in fade-in zoom-in duration-200
                  ${scanFeedback === 'success' ? 'bg-green-500' : 'bg-red-500'}
                `}>
                  <div className="flex items-center gap-2">
                    {scanFeedback === 'success' ? <CheckCircle className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    {scanMessage}
                  </div>
                </div>
              )}
           </div>

           {/* Bottom Controls */}
           <div className="space-y-4 pointer-events-auto">
              {/* Last Scanned Info */}
              {lastScanned && !scanFeedback && (
                <div className="bg-background/90 backdrop-blur border rounded-lg p-3 shadow-lg animate-in slide-in-from-bottom-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Last Scanned</p>
                      <p className="font-medium text-sm">{lastScanned.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{lastScanned.time}</span>
                  </div>
                </div>
              )}

              {/* Scan Toggle Button */}
              {!isScanning ? (
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg shadow-xl" 
                  onClick={startScanning}
                >
                  <Camera className="h-6 w-6 mr-2" />
                  Tap to Scan
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  variant="destructive" 
                  className="w-full h-14 text-lg shadow-xl" 
                  onClick={stopScanning}
                >
                  <Zap className="h-6 w-6 mr-2 fill-current" />
                  Stop Scanning
                </Button>
              )}
           </div>
        </div>
      </div>

      {/* Bottom Sheet for Recent Scans */}
      <Sheet>
        <SheetTrigger asChild>
          <div className="bg-card border-t p-3 flex items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-1 bg-muted rounded-full" />
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <History className="h-4 w-4" />
                View Recent Scans ({attendanceRecords.length})
                {offlineCount > 0 && (
                  <span className="text-amber-600 ml-1">
                    • {offlineCount} Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Recent Scans</SheetTitle>
            <SheetDescription>
              Attendance for {currentSession?.name}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-2 overflow-y-auto h-full pb-20">
            {attendanceRecords.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No scans recorded yet
              </div>
            ) : (
              attendanceRecords.map((record, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium">
                      {record.student.fullNameEnglish || record.student.username || "Unknown Student"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.scannedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant={record.isOffline ? "outline" : "secondary"}>
                    {record.isOffline ? "Pending" : "Synced"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
