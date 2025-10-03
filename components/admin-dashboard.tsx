"use client"

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  Church,
  LogOut,
  Download,
  Search
} from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface Submission {
  id: number
  user_id: number
  name: string
  address: string
  phone: string
  church: string
  telegram_username: string
  audio_file_path: string
  audio_file_size: number
  audio_duration: number
  submitted_at: string
  status: 'pending' | 'approved' | 'rejected'
  reviewer_comments: string | null
  reviewed_at: string | null
  reviewed_by: string | null
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
}

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<string>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [comments, setComments] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [playingAudio, setPlayingAudio] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const getToken = () => localStorage.getItem('admin_token')

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchSubmissions = async (status?: string) => {
    setIsLoading(true)
    try {
      const url = status && status !== 'all' 
        ? `${API_BASE_URL}/submissions?status=${status}` 
        : `${API_BASE_URL}/submissions`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setSubmissions(data.submissions)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchSubmissions()
  }, [])

  useEffect(() => {
    const statusFilter = selectedTab === 'all' ? undefined : selectedTab
    fetchSubmissions(statusFilter)
  }, [selectedTab])

  const handleStatusUpdate = async (submissionId: number, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          status: newStatus,
          comments: comments
        })
      })

      const data = await response.json()
      if (data.success) {
        // Refresh data
        fetchStats()
        fetchSubmissions(selectedTab === 'all' ? undefined : selectedTab)
        setSelectedSubmission(null)
        setComments('')
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const toggleAudio = async (submissionId: number, audioPath: string) => {
    console.log('toggleAudio called:', { submissionId, audioPath, API_BASE_URL })
    
    if (playingAudio === submissionId) {
      audioRef.current?.pause()
      setPlayingAudio(null)
    } else {
      if (audioRef.current) {
        try {
          const audioUrl = `${API_BASE_URL}/audio/${audioPath}`
          console.log('Fetching audio from:', audioUrl)
          
          // Fetch audio with authentication
          const response = await fetch(audioUrl, {
            headers: {
              'Authorization': `Bearer ${getToken()}`
            }
          })
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          // Create blob URL for the audio
          const audioBlob = await response.blob()
          const blobUrl = URL.createObjectURL(audioBlob)
          
          console.log('Setting audio src to blob URL:', blobUrl)
          audioRef.current.src = blobUrl
          audioRef.current.load()
          
          audioRef.current.play()
            .then(() => {
              console.log('Audio playback started successfully')
              setPlayingAudio(submissionId)
            })
            .catch((error) => {
              console.error('Audio playback failed:', error)
              setPlayingAudio(null)
            })
        } catch (error) {
          console.error('Error fetching audio:', error)
          setPlayingAudio(null)
        }
      } else {
        console.error('Audio element not found')
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    }
    const variant = variants[status] || variants.pending
    const Icon = variant.icon
    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredSubmissions = submissions.filter(sub => 
    sub.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.phone?.includes(searchQuery) ||
    sub.church?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Screening Dashboard</h1>
              <p className="text-sm text-gray-500">Chenaniah Worship Ministry</p>
            </div>
            <Button onClick={onLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <User className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, phone, or church..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs and Submissions */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Applications</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">No applications found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredSubmissions.map((submission) => (
                  <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left: Applicant Info */}
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold">{submission.name}</h3>
                              <p className="text-sm text-gray-500">
                                Applied: {formatDate(submission.submitted_at)}
                              </p>
                            </div>
                            {getStatusBadge(submission.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{submission.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{submission.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Church className="h-4 w-4 text-gray-400" />
                              <span>{submission.church}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-gray-400" />
                              <span>@{submission.telegram_username || 'N/A'}</span>
                            </div>
                          </div>

                          {submission.reviewer_comments && (
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm font-medium text-gray-700">Review Comments:</p>
                              <p className="text-sm text-gray-600 mt-1">{submission.reviewer_comments}</p>
                              {submission.reviewed_by && (
                                <p className="text-xs text-gray-500 mt-2">
                                  By {submission.reviewed_by} on {submission.reviewed_at && formatDate(submission.reviewed_at)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right: Audio Player & Actions */}
                        <div className="lg:w-80 space-y-4">
                          {/* Audio Player */}
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Worship Sample</p>
                            <div className="flex items-center gap-3">
                              <Button
                                onClick={() => toggleAudio(submission.id, submission.audio_file_path || submission.audio_drive_link || '')}
                                size="lg"
                                className="flex-shrink-0"
                                disabled={!submission.audio_file_path && !submission.audio_drive_link}
                              >
                                {playingAudio === submission.id ? (
                                  <Pause className="h-5 w-5" />
                                ) : (
                                  <Play className="h-5 w-5" />
                                )}
                              </Button>
                              <div className="flex-1">
                                <p className="text-xs text-gray-600">
                                  {formatFileSize(submission.audio_file_size)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Click to {playingAudio === submission.id ? 'pause' : 'play'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {submission.status === 'pending' && (
                            <div className="space-y-2">
                              <Button
                                onClick={() => setSelectedSubmission(submission)}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => setSelectedSubmission(submission)}
                                className="w-full bg-red-600 hover:bg-red-700"
                                variant="destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Review Application</CardTitle>
              <CardDescription>
                {selectedSubmission.name} - {selectedSubmission.church}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="comments">Comments (optional)</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any comments about this application..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleStatusUpdate(selectedSubmission.id, 'approved')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleStatusUpdate(selectedSubmission.id, 'rejected')}
                  className="flex-1"
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
              <Button
                onClick={() => {
                  setSelectedSubmission(null)
                  setComments('')
                }}
                className="w-full"
                variant="outline"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingAudio(null)}
        onError={(e) => {
          console.error('Audio element error:', e)
          setPlayingAudio(null)
        }}
        onLoadStart={() => console.log('Audio loading started')}
        onCanPlay={() => console.log('Audio can play')}
        onLoadedData={() => console.log('Audio data loaded')}
      />
    </div>
  )
}

