"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Bell, Calendar, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { getApiBaseUrl } from "@/lib/utils"

const API_BASE_URL = getApiBaseUrl()

// Define Notice type
export interface Notice {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'urgent'
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentNotice, setCurrentNotice] = useState<Notice | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Notice>>({
    title: '',
    content: '',
    type: 'info',
    active: true
  })

  // Fetch notices from API
  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_BASE_URL}/notices/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setNotices(data.notices || [])
      }
    } catch (error) {
      console.error("Failed to fetch notices", error)
      toast.error("Failed to load notices")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotices()
  }, [])

  const handleOpenDialog = (notice?: Notice) => {
    if (notice) {
      setCurrentNotice(notice)
      setFormData(notice)
    } else {
      setCurrentNotice(null)
      setFormData({
        title: '',
        content: '',
        type: 'info',
        active: true
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Please fill in all required fields")
      return
    }

    setSaving(true)
    const token = localStorage.getItem('admin_token')

    try {
      if (currentNotice) {
        // Update existing
        const response = await fetch(`${API_BASE_URL}/notices/${currentNotice.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        })
        if (response.ok) {
          toast.success("Notice updated successfully")
          fetchNotices()
        } else {
          toast.error("Failed to update notice")
        }
      } else {
        // Create new
        const response = await fetch(`${API_BASE_URL}/notices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        })
        if (response.ok) {
          toast.success("Notice created successfully")
          fetchNotices()
        } else {
          toast.error("Failed to create notice")
        }
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving notice", error)
      toast.error("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      const token = localStorage.getItem('admin_token')
      try {
        const response = await fetch(`${API_BASE_URL}/notices/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          toast.success("Notice deleted")
          fetchNotices()
        } else {
          toast.error("Failed to delete notice")
        }
      } catch (error) {
        console.error("Error deleting notice", error)
        toast.error("An error occurred")
      }
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1f2d3d]">Notice Board</h1>
            <p className="text-gray-500 mt-1">Manage announcements for students</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-[#1f2d3d] text-white hover:bg-[#1f2d3d]/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Notice
          </Button>
        </div>

        <div className="grid gap-6">
          {notices.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No notices yet</h3>
                <p className="text-gray-500 mb-4">Create your first notice to display on the student dashboard.</p>
                <Button variant="outline" onClick={() => handleOpenDialog()}>
                  Create Notice
                </Button>
              </CardContent>
            </Card>
          ) : (
            notices.map((notice) => (
              <Card key={notice.id} className="overflow-hidden transition-all hover:shadow-md">
                <div className={`h-1 w-full ${
                  notice.type === 'urgent' ? 'bg-red-500' : 
                  notice.type === 'warning' ? 'bg-yellow-500' : 
                  notice.type === 'success' ? 'bg-green-500' : 
                  'bg-blue-500'
                }`} />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(notice.type)} uppercase tracking-wide`}>
                          {notice.type}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(notice.createdAt), 'PPP')}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-[#1f2d3d] mb-2">{notice.title}</h3>
                      <p className="text-gray-600 whitespace-pre-wrap">{notice.content}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(notice)}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(notice.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{currentNotice ? 'Edit Notice' : 'Create New Notice'}</DialogTitle>
              <DialogDescription>
                This notice will be visible to all students on their dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Upcoming Rehearsal Schedule"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info (Blue)</SelectItem>
                    <SelectItem value="urgent">Urgent (Red)</SelectItem>
                    <SelectItem value="warning">Warning (Yellow)</SelectItem>
                    <SelectItem value="success">Success (Green)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the details of the notice..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} className="bg-[#1f2d3d] text-white">
                {currentNotice ? 'Update Notice' : 'Post Notice'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
