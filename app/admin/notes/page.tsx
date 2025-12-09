"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  FileText, Loader2, ArrowLeft, Trash2, Calendar, User, Search, Filter, Image as ImageIcon, Plus, X, Send, Sparkles, Clock3
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getApiBaseUrl } from "@/lib/utils"
import { AdminLayout } from "@/components/admin-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const API_BASE_URL = getApiBaseUrl()

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

interface Session {
  id: number
  name: string
  date: string
  _count: {
    notes: number
  }
}

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSessionId, setSelectedSessionId] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [noteType, setNoteType] = useState<"all" | "text" | "image">("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  
  // Create Note State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState("")
  const [targetSessionId, setTargetSessionId] = useState<string>("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  const fetchData = async () => {
    try {
      const [notesRes, sessionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/notes`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/notes/sessions`, { headers: getAuthHeaders() })
      ])

      if (notesRes.ok && sessionsRes.ok) {
        const notesData = await notesRes.json()
        const sessionsData = await sessionsRes.json()
        setNotes(notesData.notes || [])
        setSessions(sessionsData.sessions || [])
      }
    } catch (error) {
      console.error("Failed to fetch notes data", error)
      toast.error("Failed to load notes")
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCreateNote = async () => {
    if (!targetSessionId) {
      toast.error("Please select a session")
      return
    }

    if (!newNoteContent.trim() && !selectedImage) {
      toast.error("Please enter content or select an image")
      return
    }

    setCreating(true)
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
      if (!token) return

      let response
      if (selectedImage) {
        const formData = new FormData()
        formData.append('image', selectedImage)
        formData.append('sessionId', targetSessionId)
        if (newNoteContent.trim()) {
          formData.append('content', newNoteContent)
        }

        response = await fetch(`${API_BASE_URL}/notes/image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }, // No Content-Type for FormData
          body: formData,
        })
      } else {
        response = await fetch(`${API_BASE_URL}/notes`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            content: newNoteContent,
            sessionId: parseInt(targetSessionId),
          }),
        })
      }

      if (response.ok) {
        toast.success("Note created successfully")
        setShowCreateModal(false)
        setNewNoteContent("")
        setTargetSessionId("")
        setSelectedImage(null)
        setImagePreview(null)
        fetchData()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to create note")
      }
    } catch (error) {
      toast.error("Failed to create note")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        toast.success("Note deleted")
        setNotes(notes.filter(n => n.id !== noteId))
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete note")
      }
    } catch (error) {
      toast.error("Failed to delete note")
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSession = selectedSessionId === "all" || note.sessionId.toString() === selectedSessionId
    const matchesSearch = searchQuery.toLowerCase() === "" || 
      note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.student?.fullNameEnglish?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.student?.fullNameAmharic?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = noteType === "all" || note.type === noteType
    
    return matchesSession && matchesSearch && matchesType
  }).sort((a, b) => {
    if (sortOrder === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const totalNotes = notes.length
  const totalImages = notes.filter(n => n.type === "image").length
  const totalSessions = sessions.length

  const renderLoading = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
          <div className="h-14 bg-gray-100" />
          <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-100 rounded" />
            <div className="h-16 bg-gray-100 rounded" />
            <div className="h-10 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f8f9fa] p-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-[#1f2d3d]">Notes Management</h1>
                  <Sparkles className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-gray-500">Review, filter, and create admin notes faster.</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[#1f2d3d] hover:bg-[#2a3f54] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs uppercase text-gray-500 mb-1">Total Notes</p>
              <p className="text-2xl font-bold text-[#1f2d3d]">{totalNotes}</p>
              <p className="text-xs text-gray-500">All time</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs uppercase text-gray-500 mb-1">Image Notes</p>
              <p className="text-2xl font-bold text-[#1f2d3d]">{totalImages}</p>
              <p className="text-xs text-gray-500">With attachments</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs uppercase text-gray-500 mb-1">Sessions</p>
              <p className="text-2xl font-bold text-[#1f2d3d]">{totalSessions}</p>
              <p className="text-xs text-gray-500">Active events</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs uppercase text-gray-500 mb-1">Visible Now</p>
              <p className="text-2xl font-bold text-[#1f2d3d]">{filteredNotes.length}</p>
              <p className="text-xs text-gray-500">After filters</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-3">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search content or student..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                  <SelectTrigger className="w-full sm:w-56">
                    <SelectValue placeholder="Filter by Session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    {sessions.map(session => (
                      <SelectItem key={session.id} value={session.id.toString()}>
                        {session.name} ({format(new Date(session.date), 'MMM d')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={noteType} onValueChange={(v) => setNoteType(v as typeof noteType)}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Note Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="text">Text only</SelectItem>
                    <SelectItem value="image">Has image</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as typeof sortOrder)}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Filter className="h-4 w-4" />
                Showing {filteredNotes.length} of {notes.length}
              </div>
            </div>
            {selectedSessionId === "all" && sessions.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sessions.slice(0, 6).map(session => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id.toString())}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 text-sm bg-gray-50 hover:border-[#1f2d3d] transition"
                  >
                    <Calendar className="h-4 w-4 text-[#1f2d3d]" />
                    <span className="whitespace-nowrap">{session.name}</span>
                    <span className="text-xs text-gray-500">{session._count?.notes ?? 0} notes</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes Grid */}
          {loading ? (
            renderLoading()
          ) : filteredNotes.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-700 font-medium">No notes match your filters.</p>
              <p className="text-gray-500 text-sm mt-2">Try clearing filters or creating a new note.</p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="mt-6 bg-[#1f2d3d] hover:bg-[#2a3f54] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create first note
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <div key={note.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
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
                        <p className="text-sm font-semibold text-[#1f2d3d]">
                          {note.authorType === 'admin' ? 'Admin' : (note.student?.fullNameEnglish || note.student?.fullNameAmharic || 'Student')}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock3 className="h-3 w-3" />
                          {format(new Date(note.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        note.type === 'image' ? 'bg-green-50 text-green-700' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {note.type === 'image' ? 'Image' : 'Text'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    {note.session && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                          <Calendar className="h-3 w-3" />
                          {note.session.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {note.session.date ? format(new Date(note.session.date), 'PPP') : 'Date TBD'}
                        </span>
                      </div>
                    )}

                    {note.type === 'image' && note.imagePath && (
                      <div className="rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                        <img 
                          src={`${API_BASE_URL}${note.imagePath}`} 
                          alt="Note attachment" 
                          className="w-full h-48 object-contain"
                        />
                      </div>
                    )}

                    {note.content && (
                      <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Note Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#1f2d3d]">Create Admin Note</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session *</label>
                  <Select value={targetSessionId} onValueChange={setTargetSessionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map(session => (
                        <SelectItem key={session.id} value={session.id.toString()}>
                          {session.name} ({format(new Date(session.date), 'MMM d')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <Textarea
                    placeholder="Write your note here..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  
                  {imagePreview ? (
                    <div className="relative mt-2">
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
                      className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#1f2d3d] transition-colors flex flex-col items-center gap-2 text-gray-500 mt-1"
                    >
                      <ImageIcon className="h-8 w-8" />
                      <span>Click to upload image</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateNote}
                  disabled={creating}
                  className="flex-1 bg-[#1f2d3d] hover:bg-[#2a3f54] text-white"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Post Note
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
