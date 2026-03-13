"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Users, Shield, Search, Check, X, UserCheck, Plus, Minus } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { AdminLayout } from "@/components/admin-layout"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  DollarSign, 
  CheckSquare, 
  Folder, 
  FileText, 
  Users as UsersIcon, 
  Bell, 
  Calendar, 
  Clock,
  ChevronDown
} from "lucide-react"

const API_BASE_URL = getApiBaseUrl()

interface Student {
  id: number
  username: string
  fullNameEnglish: string | null
  fullNameAmharic: string | null
  phone: string
  status: string
}

interface Role {
  id: number
  name: string
  description: string | null
  permissions: { id: number; name: string; module: string; action: string }[]
}

const MODULES = [
  { key: 'payments', label: 'Payments', icon: DollarSign, color: 'bg-green-500' },
  { key: 'attendance', label: 'Attendance', icon: CheckSquare, color: 'bg-blue-500' },
  { key: 'resources', label: 'Resources', icon: Folder, color: 'bg-yellow-500' },
  { key: 'assignments', label: 'Assignments', icon: FileText, color: 'bg-purple-500' },
  { key: 'trainees', label: 'Trainees', icon: UsersIcon, color: 'bg-pink-500' },
  { key: 'sections', label: 'Sections', icon: UsersIcon, color: 'bg-indigo-500' },
  { key: 'notices', label: 'Notices', icon: Bell, color: 'bg-red-500' },
  { key: 'teams', label: 'Teams', icon: UsersIcon, color: 'bg-orange-500' },
  { key: 'notes', label: 'Notes', icon: FileText, color: 'bg-teal-500' },
  { key: 'applications', label: 'Applications', icon: FileText, color: 'bg-cyan-500' },
  { key: 'interview', label: 'Interview', icon: Calendar, color: 'bg-amber-500' },
  { key: 'timeSlots', label: 'Time Slots', icon: Clock, color: 'bg-rose-500' },
]

export default function AdminStudentAccessPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
  const [studentRoles, setStudentRoles] = useState<Role[]>([])
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    // Only allow admins - students with any token should be redirected
    if (!token) {
      router.push('/admin')
      return
    }

    setIsLoading(true)
    try {
      const [studentsRes, rolesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/trainees?status=active`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/admin/roles`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ])

      const studentsData = await studentsRes.json()
      const rolesData = await rolesRes.json()

      setStudents(studentsData.students || [])
      setRoles(rolesData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStudentRoles = async (student: Student) => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) return

    setIsLoadingRoles(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/student-roles/${student.id}/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setStudentRoles(data.roles || [])
      setSelectedRoleIds((data.roles || []).map((r: Role) => r.id))
    } catch (error) {
      console.error('Error loading student roles:', error)
      toast.error('Failed to load student roles')
    } finally {
      setIsLoadingRoles(false)
    }
  }

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student)
    setSearchQuery(student.fullNameEnglish || student.fullNameAmharic || student.username)
    setIsDropdownOpen(false)
    await loadStudentRoles(student)
  }

  const handleAssignRoles = async () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token || !selectedStudent) return

    try {
      const response = await fetch(`${API_BASE_URL}/admin/student-roles/${selectedStudent.id}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleIds: selectedRoleIds })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to assign roles')
      }

      toast.success(`Access updated for ${selectedStudent.fullNameEnglish || selectedStudent.username}`)
      await loadStudentRoles(selectedStudent)
    } catch (error: any) {
      console.error('Error assigning roles:', error)
      toast.error(error.message)
    }
  }

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  const getModuleIcon = (moduleKey: string) => {
    const mod = MODULES.find(m => m.key === moduleKey)
    if (!mod) return null
    const Icon = mod.icon
    return <Icon className="h-3 w-3" />
  }

  const getModuleColor = (moduleKey: string) => {
    const mod = MODULES.find(m => m.key === moduleKey)
    return mod?.color || 'bg-gray-500'
  }

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase()
    if (!query) return false
    return (
      student.fullNameEnglish?.toLowerCase().includes(query) ||
      student.fullNameAmharic?.toLowerCase().includes(query) ||
      student.username.toLowerCase().includes(query) ||
      student.phone.includes(query)
    )
  })

  const displayStudents = searchQuery ? filteredStudents : students.slice(0, 10)

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Student Access</h1>
          <p className="text-muted-foreground">Manage which modules students can access</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Student</CardTitle>
            <CardDescription>Search and select a student to manage their access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, username, or phone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setIsDropdownOpen(true)
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="pl-10"
              />
              {isDropdownOpen && displayStudents.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {displayStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className="px-4 py-3 hover:bg-muted cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">
                          {student.fullNameEnglish || student.fullNameAmharic || student.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{student.username} • {student.phone}
                        </p>
                      </div>
                      {selectedStudent?.id === student.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedStudent && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {selectedStudent.fullNameEnglish || selectedStudent.fullNameAmharic || selectedStudent.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{selectedStudent.username} • {selectedStudent.phone}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setSelectedStudent(null)
                      setStudentRoles([])
                      setSelectedRoleIds([])
                      setSearchQuery('')
                    }}
                  >
                    Clear
                  </Button>
                </div>

                {isLoadingRoles ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label>Current Access</Label>
                    {studentRoles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {studentRoles.map((role) => {
                          const modules = (role.permissions || []).map(p => p.module)
                          return (
                            <div
                              key={role.id}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/50"
                            >
                              <Shield className="h-4 w-4 text-primary" />
                              <span className="font-medium">{role.name}</span>
                              <div className="flex gap-1">
                                {modules.slice(0, 3).map((mod) => (
                                  <span 
                                    key={mod}
                                    className={`px-1.5 py-0.5 rounded text-xs text-white ${getModuleColor(mod)}`}
                                  >
                                    {MODULES.find(m => m.key === mod)?.label || mod}
                                  </span>
                                ))}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={() => toggleRole(role.id)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No access granted yet</p>
                    )}
                  </div>
                )}

                <div className="space-y-3 pt-4 border-t">
                  <Label>Assign New Roles</Label>
                  {roles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No roles available. Create roles first in the Roles page.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {roles.filter(r => !selectedRoleIds.includes(r.id)).map((role) => {
                        const modules = (role.permissions || []).map(p => p.module)
                        return (
                          <div
                            key={role.id}
                            onClick={() => toggleRole(role.id)}
                            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed cursor-pointer hover:border-primary/50 transition-all"
                          >
                            <Plus className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="font-medium">{role.name}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {modules.map((mod) => (
                                  <span 
                                    key={mod}
                                    className={`px-1.5 py-0.5 rounded text-xs text-white ${getModuleColor(mod)}`}
                                  >
                                    {MODULES.find(m => m.key === mod)?.label || mod}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {selectedRoleIds.length > 0 && (
                  <div className="pt-4">
                    <Button onClick={handleAssignRoles} className="w-full">
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes ({selectedRoleIds.length} role{selectedRoleIds.length > 1 ? 's' : ''})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {!selectedStudent && students.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
              <CardDescription>Recently accessed students will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Use the search box above to find and manage a student's access
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
