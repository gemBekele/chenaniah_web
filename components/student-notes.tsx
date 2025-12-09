"use client"

import { useEffect, useState, useRef } from "react"
import { BookOpen, Image, FileText, Send, Trash2, Calendar, User, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getApiBaseUrl } from "@/lib/utils"

const API_BASE_URL = getApiBaseUrl()

interface Session {
  id: number
  name: string
  date: string
  notesCount: number
}

interface Note {
  id: number
  content: string | null
  imagePath: string | null
  type: 'text' | 'image'
  sessionId: number
  authorId: number
  authorType: 'student' | 'admin'
  createdAt: string
  student?: {
    id: number
    fullNameEnglish?: string
    fullNameAmharic?: string
    photoPath?: string
  }
  session?: {
    id: number
    name: string
    date: string
  }
}

export default function StudentNotes() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState("")
  const [noteType, setNoteType] = useState<'text' | 'image'>('text')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showSessionDropdown, setShowSessionDropdown] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    if (selectedSession) {
      fetchNotes(selectedSession.id)
    }
  }, [selectedSession])

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/notes/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
        if (data.sessions && data.sessions.length > 0) {
          setSelectedSession(data.sessions[0])
        }
      }
    } catch (error) {
      console.error("Failed to fetch sessions", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotes = async (sessionId: number) => {
    setLoadingNotes(true)
    try {
      const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/notes/session/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      }
    } catch (error) {
      console.error("Failed to fetch notes", error)
    } finally {
      setLoadingNotes(false)
    }
  }

  const compressImage = async (file: File): Promise<File> => {
    // Import browser-image-compression dynamically
    const imageCompression = (await import('browser-image-compression')).default
    
    const options = {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    }
    
    try {
      const compressedFile = await imageCompression(file, options)
      return compressedFile
    } catch (error) {
      console.error('Image compression failed:', error)
      return file
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Compress if larger than 2MB
    let processedFile = file
    if (file.size > 2 * 1024 * 1024) {
      toast.info('Compressing image...')
      processedFile = await compressImage(file)
      toast.success('Image compressed successfully')
    }

    setSelectedImage(processedFile)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(processedFile)
  }

  const handleSubmitNote = async () => {
    if (!selectedSession) {
      toast.error('Please select a session')
      return
    }

    if (noteType === 'text' && !newNoteContent.trim()) {
      toast.error('Please enter some content')
      return
    }

    if (noteType === 'image' && !selectedImage) {
      toast.error('Please select an image')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
      if (!token) return

      let response
      if (noteType === 'text') {
        response = await fetch(`${API_BASE_URL}/notes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: newNoteContent,
            sessionId: selectedSession.id,
          }),
        })
      } else {
        const formData = new FormData()
        formData.append('image', selectedImage!)
        formData.append('sessionId', selectedSession.id.toString())
        if (newNoteContent.trim()) {
          formData.append('content', newNoteContent)
        }

        response = await fetch(`${API_BASE_URL}/notes/image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        })
      }

      if (response.ok) {
        toast.success('Note added successfully')
        setNewNoteContent("")
        setSelectedImage(null)
        setImagePreview(null)
        fetchNotes(selectedSession.id)
        fetchSessions() // Refresh session counts
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to add note')
      }
    } catch (error) {
      console.error("Failed to submit note", error)
      toast.error('Failed to add note')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        toast.success('Note deleted')
        if (selectedSession) {
          fetchNotes(selectedSession.id)
          fetchSessions()
        }
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete note')
      }
    } catch (error) {
      toast.error('Failed to delete note')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f2d3d]"></div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No sessions available for notes</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#1f2d3d] flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#e8cb85]" />
          Session Notes
        </h3>
      </div>

      {/* Session Selector */}
      <div className="relative">
        <button
          onClick={() => setShowSessionDropdown(!showSessionDropdown)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-left transition-all hover:border-[#1f2d3d]"
        >
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-[#e8cb85]" />
            <div>
              <span className="font-medium text-[#1f2d3d]">
                {selectedSession?.name || 'Select Session'}
              </span>
              {selectedSession && (
                <span className="text-xs text-gray-500 ml-2">
                  ({format(new Date(selectedSession.date), 'MMM d, yyyy')})
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedSession && (
              <span className="bg-[#e8cb85] text-[#1f2d3d] text-xs font-bold px-2 py-0.5 rounded-full">
                {selectedSession.notesCount} notes
              </span>
            )}
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showSessionDropdown ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showSessionDropdown && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  setSelectedSession(session)
                  setShowSessionDropdown(false)
                }}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                  selectedSession?.id === session.id ? 'bg-gray-50' : ''
                }`}
              >
                <div>
                  <span className="font-medium text-[#1f2d3d]">{session.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {format(new Date(session.date), 'MMM d, yyyy')}
                  </span>
                </div>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {session.notesCount}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Note Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        <div className="flex gap-2">
          <Button
            variant={noteType === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setNoteType('text')}
            className={noteType === 'text' ? 'bg-[#1f2d3d] hover:bg-[#2a3f54]' : ''}
          >
            <FileText className="h-4 w-4 mr-1" />
            Text
          </Button>
          <Button
            variant={noteType === 'image' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setNoteType('image')}
            className={noteType === 'image' ? 'bg-[#1f2d3d] hover:bg-[#2a3f54]' : ''}
          >
            <Image className="h-4 w-4 mr-1" />
            Image
          </Button>
        </div>

        {noteType === 'image' && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-48 object-contain rounded-lg bg-gray-100"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedImage(null)
                    setImagePreview(null)
                  }}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#1f2d3d] transition-colors flex flex-col items-center gap-2 text-gray-500"
              >
                <Image className="h-8 w-8" />
                <span>Click to select an image</span>
                <span className="text-xs">Max 2MB (will be compressed automatically)</span>
              </button>
            )}
          </div>
        )}

        <Textarea
          placeholder={noteType === 'text' ? "Write your note..." : "Add a caption (optional)..."}
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          rows={noteType === 'text' ? 3 : 2}
          className="resize-none"
        />

        <Button
          onClick={handleSubmitNote}
          disabled={submitting || (!newNoteContent.trim() && noteType === 'text') || (!selectedImage && noteType === 'image')}
          className="w-full bg-[#1f2d3d] hover:bg-[#2a3f54]"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Posting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Post Note
            </span>
          )}
        </Button>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {loadingNotes ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1f2d3d]"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notes yet for this session</p>
            <p className="text-sm">Be the first to add a note!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-white border border-gray-200 rounded-xl p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {note.student?.photoPath ? (
                      <img
                        src={`${API_BASE_URL}${note.student.photoPath}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-sm text-[#1f2d3d]">
                      {note.authorType === 'admin' ? 'Admin' : (note.student?.fullNameEnglish || note.student?.fullNameAmharic || 'Student')}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {format(new Date(note.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteNote(note.id)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {note.type === 'image' && note.imagePath && (
                <img
                  src={`${API_BASE_URL}${note.imagePath}`}
                  alt="Note"
                  className="w-full rounded-lg mb-3 max-h-64 object-contain bg-gray-100"
                />
              )}

              {note.content && (
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{note.content}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
