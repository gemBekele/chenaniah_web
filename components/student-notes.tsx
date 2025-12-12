"use client"

import { useEffect, useState, useRef } from "react"
import { BookOpen, Image, FileText, Send, Trash2, Calendar, User, ChevronDown, XCircle, X, Loader2, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getApiBaseUrl } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

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
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [viewingImage, setViewingImage] = useState<string | null>(null)
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
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check limit
    if (selectedImages.length + files.length > 3) {
      toast.error('You can only upload up to 3 images')
      return
    }

    const newImages: File[] = []
    const newPreviews: string[] = []

    for (const file of files) {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        continue
      }

      // Compress if larger than 2MB
      let processedFile = file
      if (file.size > 2 * 1024 * 1024) {
        try {
          processedFile = await compressImage(file)
        } catch (err) {
          console.error('Compression failed', err)
        }
      }
      
      newImages.push(processedFile)
      newPreviews.push(URL.createObjectURL(processedFile))
    }

    setSelectedImages([...selectedImages, ...newImages])
    setImagePreviews([...imagePreviews, ...newPreviews])
  }

  const removeImage = (index: number) => {
    const newImages = [...selectedImages]
    const newPreviews = [...imagePreviews]
    
    URL.revokeObjectURL(newPreviews[index])
    
    newImages.splice(index, 1)
    newPreviews.splice(index, 1)
    
    setSelectedImages(newImages)
    setImagePreviews(newPreviews)
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

    if (noteType === 'image' && selectedImages.length === 0) {
      toast.error('Please select at least one image')
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
        selectedImages.forEach(image => {
          formData.append('images', image)
        })
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
        setSelectedImages([])
        setImagePreviews([])
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

  // Group notes by same author and timestamp (within 1 minute)
  const groupNotes = (notes: Note[]) => {
    const groups: Note[][] = []
    const TIME_WINDOW_MS = 60 * 1000 // 1 minute

    notes.forEach((note) => {
      const noteTime = new Date(note.createdAt).getTime()
      const authorId = note.authorId
      const authorType = note.authorType

      // Find existing group with same author and timestamp within window
      let foundGroup = false
      for (const group of groups) {
        const groupTime = new Date(group[0].createdAt).getTime()
        const groupAuthorId = group[0].authorId
        const groupAuthorType = group[0].authorType

        if (
          groupAuthorId === authorId &&
          groupAuthorType === authorType &&
          Math.abs(noteTime - groupTime) <= TIME_WINDOW_MS
        ) {
          group.push(note)
          foundGroup = true
          break
        }
      }

      if (!foundGroup) {
        groups.push([note])
      }
    })

    return groups
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#1f2d3d]" />
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">No sessions available for notes</p>
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
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-left transition-all hover:border-[#1f2d3d] shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#e8cb85]/10 rounded-lg">
              <Calendar className="h-5 w-5 text-[#e8cb85]" />
            </div>
            <div>
              <span className="font-bold text-[#1f2d3d] block">
                {selectedSession?.name || 'Select Session'}
              </span>
              {selectedSession && (
                <span className="text-xs text-gray-500">
                  {format(new Date(selectedSession.date), 'EEEE, MMMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedSession && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                {selectedSession.notesCount} notes
              </Badge>
            )}
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showSessionDropdown ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showSessionDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowSessionDropdown(false)} />
            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-auto animate-in fade-in zoom-in-95 duration-200">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    setSelectedSession(session)
                    setShowSessionDropdown(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                    selectedSession?.id === session.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="text-left">
                    <span className="font-medium text-[#1f2d3d] block">{session.name}</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(session.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-gray-500 border-gray-200">
                    {session.notesCount}
                  </Badge>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Note Section */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-2">
            <Button
              variant={noteType === 'text' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setNoteType('text')}
              className={`rounded-full ${noteType === 'text' ? 'bg-[#1f2d3d] hover:bg-[#2a3f54]' : 'text-gray-500 hover:text-[#1f2d3d] hover:bg-gray-100'}`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Text Note
            </Button>
            <Button
              variant={noteType === 'image' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setNoteType('image')}
              className={`rounded-full ${noteType === 'image' ? 'bg-[#1f2d3d] hover:bg-[#2a3f54]' : 'text-gray-500 hover:text-[#1f2d3d] hover:bg-gray-100'}`}
            >
              <Image className="h-4 w-4 mr-2" />
              Image Note
            </Button>
          </div>

          {noteType === 'image' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {selectedImages.length < 3 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-[#1f2d3d] hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#1f2d3d]"
                  >
                    <Image className="h-6 w-6" />
                    <span className="text-xs font-medium">Add Image</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 text-center">Max 3 images (2MB each)</p>
            </div>
          )}

          <div className="relative">
            <Textarea
              placeholder={noteType === 'text' ? "Write your note here..." : "Add a caption (optional)..."}
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows={noteType === 'text' ? 3 : 2}
              className="resize-none bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl pr-12"
            />
            <Button
              size="icon"
              onClick={handleSubmitNote}
              disabled={submitting || (!newNoteContent.trim() && noteType === 'text') || (selectedImages.length === 0 && noteType === 'image')}
              className="absolute bottom-2 right-2 h-8 w-8 bg-[#1f2d3d] hover:bg-[#2a3f54] rounded-lg shadow-sm"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        {loadingNotes ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
            <p className="text-sm text-gray-400">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Sparkles className="h-8 w-8 mx-auto mb-3 text-amber-400" />
            <p className="font-medium text-[#1f2d3d]">No notes yet</p>
            <p className="text-sm mt-1">Be the first to add a note for this session!</p>
          </div>
        ) : (
          groupNotes(notes).map((noteGroup, groupIndex) => {
            const firstNote = noteGroup[0]
            const isAuthorAdmin = firstNote.authorType === 'admin'
            
            return (
              <div
                key={`group-${groupIndex}-${firstNote.id}`}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-gray-100">
                      {firstNote.student?.photoPath ? (
                        <AvatarImage src={`${API_BASE_URL}${firstNote.student.photoPath}`} className="object-cover" />
                      ) : (
                        <AvatarFallback className="bg-gray-50 text-gray-400">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <span className="font-bold text-sm text-[#1f2d3d] block">
                        {isAuthorAdmin ? 'Administrator' : (firstNote.student?.fullNameEnglish || firstNote.student?.fullNameAmharic || 'Student')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(firstNote.createdAt), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pl-12">
                  {noteGroup.map((note) => (
                    <div key={note.id} className="space-y-3 group/note">
                      {note.type === 'image' && note.imagePath && (
                        <div 
                          className="cursor-pointer relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group/image"
                          onClick={() => setViewingImage(`${API_BASE_URL}${note.imagePath}`)}
                        >
                          <img
                            src={`${API_BASE_URL}${note.imagePath}`}
                            alt="Note"
                            className="w-full h-auto max-h-80 object-contain"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                            <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm">
                              Click to expand
                            </div>
                          </div>
                        </div>
                      )}

                      {note.content && (
                        <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                      )}

                      <div className="flex justify-end opacity-0 group-hover/note:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="h-7 px-2 text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 mr-1.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center p-4">
            <img
              src={viewingImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
              onClick={() => setViewingImage(null)}
            >
              <XCircle className="h-8 w-8" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
