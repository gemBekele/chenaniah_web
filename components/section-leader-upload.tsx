"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, FileText, CheckCircle2, AlertCircle, Trash2 } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { toast } from "sonner"

const API_BASE_URL = getApiBaseUrl()

interface Section {
  id: number
  name: string
  color: string
}

interface SectionLeaderUploadProps {
  section: Section
}

export function SectionLeaderUpload({ section }: SectionLeaderUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [isUploading, setIsUploading] = useState(false)
  const [categories, setCategories] = useState<string[]>(['General', 'Sheet Music', 'Audio', 'Lyrics', 'Video'])
  const [isNewCategory, setIsNewCategory] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/resources/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success && data.categories.length > 0) {
        // Merge with defaults and deduplicate
        const defaults = ['General', 'Sheet Music', 'Audio', 'Lyrics', 'Video']
        const all = Array.from(new Set([...defaults, ...data.categories]))
        setCategories(all)
      }
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      setFile(selectedFile)
      if (!title) setTitle(selectedFile.name.split('.')[0])
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) {
      toast.error('Please select a file and provide a title')
      return
    }

    const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    if (!token) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('files', file)
    formData.append('titles', JSON.stringify([title]))
    formData.append('descriptions', JSON.stringify([description]))
    formData.append('category', category)
    formData.append('sectionId', section.id.toString())
    formData.append('type', 'file')

    try {
      const response = await fetch(`${API_BASE_URL}/admin/resources/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        toast.success('File uploaded successfully')
        setFile(null)
        setTitle('')
        setDescription('')
        setCategory('General')
        // Optionally refresh a list of section resources here
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-100 shadow-sm bg-white overflow-hidden">
        <div 
          className="h-2 w-full" 
          style={{ backgroundColor: section.color }}
        />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-[#1f2d3d]" />
            Upload Section Resource
          </CardTitle>
          <CardDescription>
            Share files specifically with the {section.name} section.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input 
                id="file" 
                type="file" 
                onChange={handleFileChange}
                className="cursor-pointer"
                required
              />
              <p className="text-xs text-gray-400">Max size: 10MB. Supported: PDF, Images, Audio, etc.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Soprano Part - Holy Holy"
                required
              />
            </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={isNewCategory ? "new" : (categories.includes(category) ? category : "new")} 
                  onValueChange={(val) => {
                    if (val === "new") {
                      setIsNewCategory(true)
                      setCategory("")
                    } else {
                      setIsNewCategory(false)
                      setCategory(val)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    <SelectItem value="new" className="font-semibold text-[#e8cb85]">
                      + Create New Category
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {isNewCategory && (
                  <Input
                    placeholder="Enter new category name"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-2 animate-in fade-in slide-in-from-top-1"
                    autoFocus
                    required
                  />
                )}
              </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide some context about this file..."
                className="min-h-[100px]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white"
              disabled={isUploading || !file}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload to {section.name}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
