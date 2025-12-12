"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  FileText, Loader2, ArrowLeft, Trash2, Calendar, User, Search, Filter, Image as ImageIcon, Plus, X, Send, Sparkles, Clock3, MoreVertical, Paperclip, CheckCircle2
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getApiBaseUrl } from "@/lib/utils"
import { AdminLayout } from "@/components/admin-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
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
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (selectedImages.length + files.length > 3) {
      toast.error('You can only upload up to 3 images')
      return
    }

    const newImages: File[] = []
    const newPreviews: string[] = []

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        return
      }
      newImages.push(file)
      newPreviews.push(URL.createObjectURL(file))
    })

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

  const handleCreateNote = async () => {
    if (!targetSessionId) {
      toast.error("Please select a session")
      return
    }

    if (!newNoteContent.trim() && selectedImages.length === 0) {
      toast.error("Please enter content or select an image")
      return
    }

    setCreating(true)
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
      if (!token) return

      let response
      if (selectedImages.length > 0) {
        const formData = new FormData()
        selectedImages.forEach(image => {
          formData.append('images', image)
        })
        
        formData.append('sessionId', targetSessionId)
        if (newNoteContent.trim()) {
          formData.append('content', newNoteContent)
        }

        response = await fetch(`${API_BASE_URL}/notes/image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
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
        setSelectedImages([])
        setImagePreviews([])
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

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f8f9fa] p-6 font-sans">
        <div className="container mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/admin')} className="rounded-full hover:bg-gray-200">
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-[#1f2d3d] tracking-tight">Notes Management</h1>
                <p className="text-gray-500 mt-1">Review and manage session notes</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[#1f2d3d] hover:bg-[#2a3f54] text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Notes", value: totalNotes, sub: "All time", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Image Notes", value: totalImages, sub: "With attachments", icon: ImageIcon, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Sessions", value: totalSessions, sub: "Active events", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Visible Now", value: filteredNotes.length, sub: "After filters", icon: Filter, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((stat, idx) => (
              <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-5 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-[#1f2d3d] mt-1">{stat.value}</h3>
                    <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search content, student name..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl"
                  />
                </div>
                <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                  <SelectTrigger className="w-full sm:w-[200px] rounded-xl bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Filter by Session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    {sessions.map(session => (
                      <SelectItem key={session.id} value={session.id.toString()}>
                        {session.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={noteType} onValueChange={(v) => setNoteType(v as typeof noteType)}>
                  <SelectTrigger className="w-full sm:w-[150px] rounded-xl bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="text">Text Only</SelectItem>
                    <SelectItem value="image">With Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                 <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as typeof sortOrder)}>
                  <SelectTrigger className="w-full sm:w-[150px] rounded-xl bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Quick Session Chips */}
            {selectedSessionId === "all" && sessions.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {sessions.slice(0, 8).map(session => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id.toString())}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm bg-white hover:border-[#1f2d3d] hover:text-[#1f2d3d] text-gray-600 transition-all whitespace-nowrap"
                  >
                    <Calendar className="h-3 w-3" />
                    {session.name}
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-gray-100 text-gray-600">
                      {session._count?.notes ?? 0}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-[#1f2d3d]">No notes found</h3>
              <p className="text-gray-500 mt-2 max-w-sm text-center">
                Try adjusting your filters or search query, or create a new note to get started.
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="mt-8 bg-[#1f2d3d] text-white rounded-full px-8"
              >
                Create Note
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupNotes(filteredNotes).map((noteGroup, groupIndex) => {
                const firstNote = noteGroup[0]
                const isAuthorAdmin = firstNote.authorType === 'admin'
                
                return (
                  <div 
                    key={`group-${groupIndex}-${firstNote.id}`} 
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Card Header */}
                    <div className="p-5 pb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-gray-100">
                          {firstNote.student?.photoPath ? (
                            <AvatarImage src={`${API_BASE_URL}${firstNote.student.photoPath}`} objectFit="cover" />
                          ) : (
                            <AvatarFallback className="bg-gray-50 text-gray-400">
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-[#1f2d3d] text-sm">
                            {isAuthorAdmin ? 'Administrator' : (firstNote.student?.fullNameEnglish || 'Student')}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <Clock3 className="h-3 w-3" />
                            {format(new Date(firstNote.createdAt), 'MMM d, h:mm a')}
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-400 hover:text-[#1f2d3d]">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => handleDeleteNote(firstNote.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Note
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Session Badge */}
                    {firstNote.session && (
                      <div className="px-5 pb-2">
                        <Badge variant="secondary" className="bg-gray-50 text-gray-600 hover:bg-gray-100 font-normal">
                          <Calendar className="h-3 w-3 mr-1.5 opacity-70" />
                          {firstNote.session.name}
                        </Badge>
                      </div>
                    )}

                    <Separator className="opacity-50" />

                    {/* Content */}
                    <div className="p-5 space-y-4 flex-1">
                      {noteGroup.map((note) => (
                        <div key={note.id} className="space-y-3">
                          {note.content && (
                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                              {note.content}
                            </p>
                          )}
                          
                          {note.type === 'image' && note.imagePath && (
                            <div className="relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group/image">
                              <img 
                                src={`${API_BASE_URL}${note.imagePath}`} 
                                alt="Attachment" 
                                className="w-full h-auto max-h-60 object-contain"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 transition-colors" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Create Note Dialog */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl">
            <DialogHeader className="p-6 pb-4 border-b border-gray-100">
              <DialogTitle className="text-xl font-bold text-[#1f2d3d] flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Create New Note
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Target Session</label>
                <Select value={targetSessionId} onValueChange={setTargetSessionId}>
                  <SelectTrigger className="w-full h-11 rounded-xl bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#1f2d3d]/10">
                    <SelectValue placeholder="Select a session..." />
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Note Content</label>
                <Textarea
                  placeholder="Type your note here..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="min-h-[120px] resize-none rounded-xl bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#1f2d3d]/10 p-4"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Attachments</label>
                  <span className="text-xs text-gray-400">{selectedImages.length}/3 images</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
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
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-xs font-medium">Add Image</span>
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </div>

            <div className="p-6 pt-2 bg-gray-50/50 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-xl h-11 border-gray-200 hover:bg-gray-100 hover:text-[#1f2d3d]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNote}
                disabled={creating}
                className="flex-1 rounded-xl h-11 bg-[#1f2d3d] hover:bg-[#2a3f54] text-white shadow-lg shadow-[#1f2d3d]/20"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Post Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
