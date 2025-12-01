"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, FileText, CheckCircle2, AlertCircle, FileCheck, Edit, User, Phone, Mail, Image } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { toast } from "sonner"

const API_BASE_URL = getApiBaseUrl()

interface StudentUser {
  id: number
  fullNameAmharic?: string
  fullNameEnglish?: string
  phone: string
  username: string
  profileComplete: boolean
  hasIdDocument?: boolean
  hasRecommendationLetter?: boolean
  hasEssay?: boolean
  hasPortrait?: boolean
  photoPath?: string
}

interface ProfileCompletionFormProps {
  user: StudentUser
  onUpdate: () => void
}

export default function ProfileCompletionForm({ user, onUpdate }: ProfileCompletionFormProps) {
  const [idFile, setIdFile] = useState<File | null>(null)
  const [recommendationFile, setRecommendationFile] = useState<File | null>(null)
  const [portraitFile, setPortraitFile] = useState<File | null>(null)
  const [essay, setEssay] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{
    id: boolean
    recommendation: boolean
    portrait: boolean
    essay: boolean
  }>({
    id: false,
    recommendation: false,
    portrait: false,
    essay: false,
  })

  const handleFileChange = (type: 'id' | 'recommendation' | 'portrait', file: File | null) => {
    if (file) {
      // Validate file type
      if (type === 'portrait') {
        // Portrait must be an image
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
        if (!allowedTypes.includes(file.type)) {
          toast.error('Portrait must be an image file (JPG, PNG)')
          return
        }
      } else {
        // ID and recommendation can be PDF or image
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
        if (!allowedTypes.includes(file.type)) {
          toast.error('Please upload a PDF or image file (JPG, PNG)')
          return
        }
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
    }

    if (type === 'id') {
      setIdFile(file)
    } else if (type === 'recommendation') {
      setRecommendationFile(file)
    } else if (type === 'portrait') {
      setPortraitFile(file)
    }
  }

  const uploadFile = async (type: 'id' | 'recommendation' | 'portrait', file: File) => {
    const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    if (!token) {
      toast.error('Please login again')
      return false
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    try {
      setUploadProgress(prev => ({ ...prev, [type]: true }))
      const response = await fetch(`${API_BASE_URL}/student/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        const messages: { [key: string]: string } = {
          'id': 'ID document',
          'recommendation': 'Recommendation letter',
          'portrait': 'Portrait photo'
        }
        toast.success(`${messages[type]} uploaded successfully`)
        return true
      } else {
        toast.error(data.error || 'Upload failed')
        return false
      }
    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Failed to upload file')
      return false
    } finally {
      setUploadProgress(prev => ({ ...prev, [type]: false }))
    }
  }

  const submitEssay = async () => {
    if (!essay.trim()) {
      toast.error('Please write your essay')
      return
    }

    const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
    if (!token) {
      toast.error('Please login again')
      return
    }

    try {
      setUploadProgress(prev => ({ ...prev, essay: true }))
      const response = await fetch(`${API_BASE_URL}/student/submit-essay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ essay }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Essay submitted successfully')
        setEssay("")
        onUpdate()
      } else {
        toast.error(data.error || 'Submission failed')
      }
    } catch (err) {
      console.error('Essay submission error:', err)
      toast.error('Failed to submit essay')
    } finally {
      setUploadProgress(prev => ({ ...prev, essay: false }))
    }
  }

  const handleSubmit = async () => {
    setIsUploading(true)

    try {
      const uploads = []
      if (idFile) {
        uploads.push(uploadFile('id', idFile))
      }
      if (recommendationFile) {
        uploads.push(uploadFile('recommendation', recommendationFile))
      }
      if (portraitFile) {
        uploads.push(uploadFile('portrait', portraitFile))
      }

      await Promise.all(uploads)
      setIdFile(null)
      setRecommendationFile(null)
      setPortraitFile(null)
      onUpdate()
    } catch (err) {
      console.error('Error uploading files:', err)
    } finally {
      setIsUploading(false)
    }
  }

  // If profile is complete and not editing, show user details
  if (user.profileComplete && !isEditing) {
    return (
      <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-[#1f2d3d] text-white p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <CheckCircle2 className="h-6 w-6 text-[#e8cb85]" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Profile Complete</CardTitle>
                <CardDescription className="text-white/70 text-base">
                  Your profile has been successfully completed.
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#e8cb85]/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-[#e8cb85]" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">
                    Full Name (English)
                  </Label>
                  <p className="font-medium text-[#1f2d3d]">{user.fullNameEnglish || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#e8cb85]/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-[#e8cb85]" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">
                    Full Name (Amharic)
                  </Label>
                  <p className="font-medium text-[#1f2d3d]">{user.fullNameAmharic || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#e8cb85]/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-[#e8cb85]" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">
                    Phone Number
                  </Label>
                  <p className="font-medium text-[#1f2d3d]">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#e8cb85]/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-[#e8cb85]" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">
                    Username
                  </Label>
                  <p className="font-medium text-[#1f2d3d]">{user.username}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${user.hasIdDocument ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.hasIdDocument ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    <FileText className={`h-5 w-5 ${user.hasIdDocument ? 'text-emerald-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">
                      ID Document
                    </Label>
                    <div className="flex items-center gap-2">
                      {user.hasIdDocument ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700">Uploaded</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-700">Missing</span>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 ml-2 text-red-700 font-semibold hover:text-red-800"
                            onClick={() => setIsEditing(true)}
                          >
                            Upload
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-4 border rounded-xl ${user.hasRecommendationLetter ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.hasRecommendationLetter ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    <FileText className={`h-5 w-5 ${user.hasRecommendationLetter ? 'text-emerald-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">
                      Recommendation Letter
                    </Label>
                    <div className="flex items-center gap-2">
                      {user.hasRecommendationLetter ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700">Uploaded</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-700">Missing</span>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 ml-2 text-red-700 font-semibold hover:text-red-800"
                            onClick={() => setIsEditing(true)}
                          >
                            Upload
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-4 border rounded-xl ${user.hasPortrait ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.hasPortrait ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    <Image className={`h-5 w-5 ${user.hasPortrait ? 'text-emerald-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">
                      Portrait Photo
                    </Label>
                    <div className="flex items-center gap-2">
                      {user.hasPortrait ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700">Uploaded</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-700">Missing</span>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 ml-2 text-red-700 font-semibold hover:text-red-800"
                            onClick={() => setIsEditing(true)}
                          >
                            Upload
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-4 border rounded-xl ${user.hasEssay ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.hasEssay ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    <FileText className={`h-5 w-5 ${user.hasEssay ? 'text-emerald-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">
                      Personal Essay
                    </Label>
                    <div className="flex items-center gap-2">
                      {user.hasEssay ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700">Submitted</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-700">Missing</span>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 ml-2 text-red-700 font-semibold hover:text-red-800"
                            onClick={() => setIsEditing(true)}
                          >
                            Submit
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
      <CardHeader className="bg-[#1f2d3d] text-white p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <FileCheck className="h-6 w-6 text-[#e8cb85]" />
          </div>
          <CardTitle className="text-xl font-bold">
            {isEditing ? "Edit Your Profile" : "Complete Your Profile"}
          </CardTitle>
        </div>
        <CardDescription className="text-white/70 text-base">
          {isEditing 
            ? "Update your documents and essay information."
            : "Upload the required documents and submit your essay to complete your registration."
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-8 space-y-8">
        {/* ID Document Upload */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="idDocument" className="text-base font-semibold text-[#1f2d3d]">
              ID Document <span className="text-destructive">*</span>
            </Label>
            {user.hasIdDocument && (
              <span className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Uploaded
              </span>
            )}
          </div>
          
          <div className={`
            relative border-2 border-dashed rounded-xl p-6 transition-all duration-200
            ${user.hasIdDocument 
              ? 'border-emerald-200 bg-emerald-50/30' 
              : 'border-gray-200 hover:border-[#e8cb85] hover:bg-gray-50'
            }
          `}>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id="idDocument"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('id', e.target.files?.[0] || null)}
                  className="hidden"
                  disabled={isUploading || uploadProgress.id || (user.hasIdDocument && !isEditing)}
                />
                {!user.hasIdDocument || isEditing ? (
                  <label 
                    htmlFor="idDocument" 
                    className="flex flex-col items-center justify-center cursor-pointer py-4"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-[#1f2d3d]">
                      {idFile ? idFile.name : "Click to upload ID Document"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, JPG or PNG (max 5MB)
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1f2d3d]">Document Uploaded</p>
                      <p className="text-xs text-gray-500">Your ID has been submitted successfully.</p>
                    </div>
                  </div>
                )}
              </div>
              
              {idFile && (!user.hasIdDocument || isEditing) && (
                <Button
                  onClick={() => uploadFile('id', idFile).then(() => onUpdate())}
                  disabled={uploadProgress.id}
                  className="bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white shadow-sm"
                >
                  {uploadProgress.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Upload"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Recommendation Letter Upload */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="recommendationLetter" className="text-base font-semibold text-[#1f2d3d]">
              Church Recommendation <span className="text-destructive">*</span>
            </Label>
            {user.hasRecommendationLetter && (
              <span className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Uploaded
              </span>
            )}
          </div>
          
          <div className={`
            relative border-2 border-dashed rounded-xl p-6 transition-all duration-200
            ${user.hasRecommendationLetter 
              ? 'border-emerald-200 bg-emerald-50/30' 
              : 'border-gray-200 hover:border-[#e8cb85] hover:bg-gray-50'
            }
          `}>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id="recommendationLetter"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('recommendation', e.target.files?.[0] || null)}
                  className="hidden"
                  disabled={isUploading || uploadProgress.recommendation || (user.hasRecommendationLetter && !isEditing)}
                />
                {!user.hasRecommendationLetter || isEditing ? (
                  <label 
                    htmlFor="recommendationLetter" 
                    className="flex flex-col items-center justify-center cursor-pointer py-4"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-[#1f2d3d]">
                      {recommendationFile ? recommendationFile.name : "Click to upload Recommendation Letter"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, JPG or PNG (max 5MB)
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1f2d3d]">Document Uploaded</p>
                      <p className="text-xs text-gray-500">Your recommendation letter has been submitted.</p>
                    </div>
                  </div>
                )}
              </div>
              
              {recommendationFile && (!user.hasRecommendationLetter || isEditing) && (
                <Button
                  onClick={() => uploadFile('recommendation', recommendationFile).then(() => onUpdate())}
                  disabled={uploadProgress.recommendation}
                  className="bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white shadow-sm"
                >
                  {uploadProgress.recommendation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Upload"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Portrait Photo Upload */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="portrait" className="text-base font-semibold text-[#1f2d3d]">
              Portrait Photo <span className="text-destructive">*</span>
            </Label>
            {user.hasPortrait && (
              <span className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Uploaded
              </span>
            )}
          </div>
          
          <div className={`
            relative border-2 border-dashed rounded-xl p-6 transition-all duration-200
            ${user.hasPortrait 
              ? 'border-emerald-200 bg-emerald-50/30' 
              : 'border-gray-200 hover:border-[#e8cb85] hover:bg-gray-50'
            }
          `}>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id="portrait"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('portrait', e.target.files?.[0] || null)}
                  className="hidden"
                  disabled={isUploading || uploadProgress.portrait || (user.hasPortrait && !isEditing)}
                />
                {!user.hasPortrait || isEditing ? (
                  <label 
                    htmlFor="portrait" 
                    className="flex flex-col items-center justify-center cursor-pointer py-4"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-[#1f2d3d]">
                      {portraitFile ? portraitFile.name : "Click to upload Portrait Photo"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      JPG or PNG (max 5MB)
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center gap-3">
                    {user.photoPath && (
                      <img 
                        src={`${API_BASE_URL}/${user.photoPath}`}
                        alt="Portrait"
                        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-200"
                      />
                    )}
                    <div>
                      <p className="font-medium text-[#1f2d3d]">Portrait Uploaded</p>
                      <p className="text-xs text-gray-500">Your portrait photo has been submitted.</p>
                    </div>
                  </div>
                )}
              </div>
              
              {portraitFile && (!user.hasPortrait || isEditing) && (
                <Button
                  onClick={() => uploadFile('portrait', portraitFile).then(() => onUpdate())}
                  disabled={uploadProgress.portrait}
                  className="bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white shadow-sm"
                >
                  {uploadProgress.portrait ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Upload"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Essay */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="essay" className="text-base font-semibold text-[#1f2d3d]">
              Personal Essay <span className="text-destructive">*</span>
            </Label>
            {user.hasEssay && (
              <span className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Submitted
              </span>
            )}
          </div>
          
          {user.hasEssay && !isEditing ? (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1f2d3d]">Essay Submitted</h4>
                <p className="text-sm text-gray-500">Your essay regarding your expectations from Chenaniah has been received.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                id="essay"
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Write about your expectations from Chenaniah Music Ministry..."
                className="min-h-[200px] bg-gray-50 border-gray-200 focus:border-[#e8cb85] focus:ring-[#e8cb85]/20 rounded-xl resize-y p-4 text-[#1f2d3d] placeholder:text-gray-400"
                disabled={isUploading || uploadProgress.essay || (user.hasEssay && !isEditing)}
              />
              <div className="flex justify-end">
                <Button
                  onClick={submitEssay}
                  disabled={uploadProgress.essay || !essay.trim()}
                  className="bg-[#1f2d3d] hover:bg-[#1f2d3d]/90 text-white rounded-xl px-8 shadow-sm"
                >
                  {uploadProgress.essay ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Essay
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              onClick={() => {
                setIsEditing(false)
                setIdFile(null)
                setRecommendationFile(null)
                setPortraitFile(null)
                setEssay("")
              }}
              variant="outline"
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


