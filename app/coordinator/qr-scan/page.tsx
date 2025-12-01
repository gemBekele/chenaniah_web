"use client"

import { useEffect, useState, useRef } from "react"
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
  Loader2,
  LogOut,
  Shield,
  QrCode,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  RefreshCw,
  Camera,
  Calendar,
  Users,
  Plus,
} from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import {
  initOfflineStorage,
  saveOfflineRecord,
  getOfflineRecords,
  markRecordAsSynced,
  getOfflineRecordCount,
} from "@/lib/offline-storage"

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
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newSessionName, setNewSessionName] = useState("")
  const [newSessionDate, setNewSessionDate] = useState("")
  const [newSessionLocation, setNewSessionLocation] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<any>(null)

  const getToken = () => {
    return localStorage.getItem("coordinator_token") || sessionStorage.getItem("coordinator_token")
  }

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/coordinator")
      return
    }

    // Initialize offline storage
    initOfflineStorage().then(() => {
      updateOfflineCount()
      loadSessions()
    })

    // Monitor online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [router])

  const updateOfflineCount = async () => {
    const count = await getOfflineRecordCount()
    setOfflineCount(count)
  }

  const loadSessions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/sessions`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      if (data.success) {
        setSessions(data.sessions.filter((s: Session) => s.status === "active"))
        if (data.sessions.length > 0 && !currentSession) {
          setCurrentSession(data.sessions[0])
          loadAttendance(data.sessions[0].id)
        }
      }
    } catch (error) {
      console.error("Error loading sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAttendance = async (sessionId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      if (data.success) {
        setAttendanceRecords(data.session.attendanceRecords || [])
      }
    } catch (error) {
      console.error("Error loading attendance:", error)
    }
  }

  const handleQRScan = async (qrCode: string) => {
    if (!currentSession) {
      alert("Please select a session first")
      return
    }

    try {
      if (isOnline) {
        // Try to record online first
        const response = await fetch(`${API_BASE_URL}/attendance/scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            sessionId: currentSession.id,
            qrCode,
            isOffline: false,
          }),
        })

        const data = await response.json()
        if (data.success) {
          setLastScanned(data.attendance.student.fullNameEnglish || data.attendance.student.username)
          loadAttendance(currentSession.id)
        } else {
          throw new Error(data.error || "Failed to record attendance")
        }
      } else {
        // Save offline
        await saveOfflineRecord({
          sessionId: currentSession.id,
          qrCode,
          scannedAt: new Date().toISOString(),
        })
        setOfflineCount(await getOfflineRecordCount())
        setLastScanned("Saved offline")
      }
    } catch (error: any) {
      // If online fails, save offline
      if (isOnline) {
        try {
          await saveOfflineRecord({
            sessionId: currentSession.id,
            qrCode,
            scannedAt: new Date().toISOString(),
          })
          setOfflineCount(await getOfflineRecordCount())
          setLastScanned("Saved offline (sync failed)")
        } catch (offlineError) {
          alert("Failed to save attendance record")
        }
      } else {
        alert("Failed to save attendance record")
      }
    }
  }

  const startScanning = async () => {
    if (!currentSession) {
      alert("Please select a session first")
      return
    }

    try {
      // Request camera permissions explicitly (for mobile browsers)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        })
        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach(track => track.stop())
      } catch (permError: any) {
        console.error("Camera permission error:", permError)
        if (permError.name === "NotAllowedError" || permError.name === "PermissionDeniedError") {
          alert("Camera permission denied. Please allow camera access in your browser settings and try again.")
          return
        } else if (permError.name === "NotFoundError" || permError.name === "DevicesNotFoundError") {
          alert("No camera found. Please ensure your device has a camera.")
          return
        } else if (permError.name === "NotReadableError" || permError.name === "TrackStartError") {
          alert("Camera is already in use by another application. Please close other apps using the camera.")
          return
        }
        // Continue to try anyway for other errors
      }

      // Dynamic import to avoid SSR issues
      const { Html5Qrcode } = await import("html5-qrcode")
      const html5QrCode = new Html5Qrcode("qr-reader")

      // Try back camera first (environment)
      let cameraConfig: { facingMode: "environment" | "user" } = { facingMode: "environment" }
      let qrboxSize = { width: 250, height: 250 }

      // Adjust QR box size for mobile
      if (window.innerWidth < 768) {
        qrboxSize = { width: Math.min(250, window.innerWidth - 40), height: Math.min(250, window.innerWidth - 40) }
      }

      try {
        await html5QrCode.start(
          cameraConfig,
          {
            fps: 10,
            qrbox: qrboxSize,
            aspectRatio: 1.0,
            disableFlip: false,
          },
          (decodedText) => {
            handleQRScan(decodedText)
            html5QrCode.stop()
            setIsScanning(false)
          },
          (errorMessage) => {
            // Ignore scanning errors (these are normal during scanning)
          }
        )

        scannerRef.current = html5QrCode
        setIsScanning(true)
      } catch (startError: any) {
        // If back camera fails, try front camera
        if (startError.message?.includes("environment") || startError.message?.includes("back")) {
          console.log("Back camera failed, trying front camera...")
          cameraConfig = { facingMode: "user" }
          
          await html5QrCode.start(
            cameraConfig,
            {
              fps: 10,
              qrbox: qrboxSize,
              aspectRatio: 1.0,
              disableFlip: false,
            },
            (decodedText) => {
              handleQRScan(decodedText)
              html5QrCode.stop()
              setIsScanning(false)
            },
            (errorMessage) => {
              // Ignore scanning errors
            }
          )

          scannerRef.current = html5QrCode
          setIsScanning(true)
        } else {
          throw startError
        }
      }
    } catch (error: any) {
      console.error("Error starting scanner:", error)
      
      let errorMessage = "Failed to start camera. "
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage = "Camera permission denied. Please allow camera access in your browser settings."
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage = "No camera found on this device."
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage = "Camera is already in use. Please close other apps using the camera."
      } else if (error.message?.includes("HTTPS") || error.message?.includes("secure context")) {
        errorMessage = "Camera requires HTTPS. Please use a secure connection (https://) or localhost."
      } else {
        errorMessage += "Please check permissions and try again."
      }
      
      alert(errorMessage)
    }
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(console.error)
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const syncOfflineRecords = async () => {
    setIsSyncing(true)
    try {
      const offlineRecords = await getOfflineRecords()
      if (offlineRecords.length === 0) {
        alert("No offline records to sync")
        return
      }

      const response = await fetch(`${API_BASE_URL}/attendance/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          records: offlineRecords.map((r) => ({
            sessionId: r.sessionId,
            qrCode: r.qrCode,
            scannedAt: r.scannedAt,
          })),
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Mark records as synced
        for (const record of offlineRecords) {
          if (record.id) {
            await markRecordAsSynced(record.id)
          }
        }
        setOfflineCount(0)
        if (currentSession) {
          loadAttendance(currentSession.id)
        }
        alert(`Synced ${data.success} records successfully`)
      } else {
        alert(`Failed to sync: ${data.error}`)
      }
    } catch (error) {
      console.error("Error syncing:", error)
      alert("Failed to sync offline records")
    } finally {
      setIsSyncing(false)
    }
  }

  const createSession = async () => {
    if (!newSessionName || !newSessionDate) {
      alert("Please fill in session name and date")
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
      } else {
        alert(`Failed to create session: ${data.error}`)
      }
    } catch (error) {
      console.error("Error creating session:", error)
      alert("Failed to create session")
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/40">
        <div className="container mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">QR Code Attendance</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </>
                )}
              </Badge>
              {offlineCount > 0 && (
                <Badge variant="outline">
                  {offlineCount} pending
                </Badge>
              )}
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Session Selection & Stats */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Select Session
                </h2>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      New
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Session</DialogTitle>
                      <DialogDescription>
                        Create a new attendance session for scanning QR codes.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="session-name">Session Name *</Label>
                        <Input
                          id="session-name"
                          placeholder="e.g., Morning Session, Evening Class"
                          value={newSessionName}
                          onChange={(e) => setNewSessionName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="session-date">Date & Time *</Label>
                        <Input
                          id="session-date"
                          type="datetime-local"
                          value={newSessionDate}
                          onChange={(e) => setNewSessionDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="session-location">Location (Optional)</Label>
                        <Input
                          id="session-location"
                          placeholder="e.g., Main Hall, Room 101"
                          value={newSessionLocation}
                          onChange={(e) => setNewSessionLocation(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateDialog(false)}
                        disabled={isCreatingSession}
                      >
                        Cancel
                      </Button>
                      <Button onClick={createSession} disabled={isCreatingSession}>
                        {isCreatingSession ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Session"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No sessions yet</p>
                    <p className="text-xs mt-1">Click "New" to create one</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <Button
                      key={session.id}
                      variant={currentSession?.id === session.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => {
                        setCurrentSession(session)
                        loadAttendance(session.id)
                      }}
                    >
                      {session.name}
                    </Button>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Statistics
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Scanned:</span>
                  <span className="font-semibold">{attendanceRecords.length}</span>
                </div>
                {offlineCount > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Pending Sync:</span>
                    <span className="font-semibold">{offlineCount}</span>
                  </div>
                )}
              </div>
            </Card>

            {offlineCount > 0 && isOnline && (
              <Card className="p-6">
                <Button
                  onClick={syncOfflineRecords}
                  disabled={isSyncing}
                  className="w-full"
                  variant="outline"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Offline Records
                    </>
                  )}
                </Button>
              </Card>
            )}
          </div>

          {/* Center Column - QR Scanner */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code Scanner
              </h2>
              {!currentSession ? (
                <div className="text-center py-12 text-muted-foreground">
                  Please select a session to start scanning
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    id="qr-reader"
                    className="w-full aspect-square bg-black rounded-lg overflow-hidden"
                  ></div>
                  {!isScanning ? (
                    <>
                      <Button
                        onClick={startScanning}
                        className="w-full"
                        size="lg"
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        Start Scanning
                      </Button>
                      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                        <p className="font-medium mb-1">📱 Mobile Tips:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Allow camera access when prompted</li>
                          <li>If denied, check browser settings</li>
                          <li>Ensure no other app is using the camera</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <Button
                      onClick={stopScanning}
                      variant="destructive"
                      className="w-full"
                      size="lg"
                    >
                      Stop Scanning
                    </Button>
                  )}
                  {lastScanned && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                      <CheckCircle className="h-4 w-4 inline mr-2" />
                      Last scanned: {lastScanned}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Recent Scans */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Scans</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {attendanceRecords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No scans yet
                  </div>
                ) : (
                  attendanceRecords.slice(0, 10).map((record) => (
                    <div
                      key={record.id}
                      className="p-3 bg-muted/30 rounded-md flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {record.student.fullNameEnglish || record.student.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.scannedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
