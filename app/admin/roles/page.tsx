"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Edit2, Trash2, Shield, Check } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import { AdminLayout } from "@/components/admin-layout"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { 
  DollarSign, 
  CheckSquare, 
  Folder, 
  FileText, 
  Users,
  Bell, 
  Calendar, 
  Clock 
} from "lucide-react"

const API_BASE_URL = getApiBaseUrl()

interface Permission {
  id: number
  name: string
  module: string
  action: string
  description: string | null
}

interface Role {
  id: number
  name: string
  description: string | null
  isSystem: boolean
  permissions: Permission[]
  studentsCount: number
  createdAt: string
  updatedAt: string
}

const MODULES = [
  { key: 'payments', label: 'Payments', icon: DollarSign, color: 'bg-green-500' },
  { key: 'attendance', label: 'Attendance', icon: CheckSquare, color: 'bg-blue-500' },
  { key: 'resources', label: 'Resources', icon: Folder, color: 'bg-yellow-500' },
  { key: 'assignments', label: 'Assignments', icon: FileText, color: 'bg-purple-500' },
  { key: 'trainees', label: 'Trainees', icon: Users, color: 'bg-pink-500' },
  { key: 'sections', label: 'Sections', icon: Users, color: 'bg-indigo-500' },
  { key: 'notices', label: 'Notices', icon: Bell, color: 'bg-red-500' },
  { key: 'teams', label: 'Teams', icon: Users, color: 'bg-orange-500' },
  { key: 'notes', label: 'Notes', icon: FileText, color: 'bg-teal-500' },
  { key: 'applications', label: 'Applications', icon: FileText, color: 'bg-cyan-500' },
  { key: 'interview', label: 'Interview', icon: Calendar, color: 'bg-amber-500' },
  { key: 'timeSlots', label: 'Time Slots', icon: Clock, color: 'bg-rose-500' },
]

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: [] as number[]
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  
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
      const [rolesRes, permissionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/roles`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/admin/roles/permissions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ])

      const rolesData = await rolesRes.json()
      const permissionsData = await permissionsRes.json()

      setRoles(rolesData)
      setPermissions(permissionsData.permissions || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) return

    if (!formData.name.trim()) {
      toast.error('Role name is required')
      return
    }

    try {
      const url = editingRole 
        ? `${API_BASE_URL}/admin/roles/${editingRole.id}`
        : `${API_BASE_URL}/admin/roles`
      
      const method = editingRole ? 'PUT' : 'POST'

      const permissionIds = formData.permissionIds

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          permissionIds
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save role')
      }

      toast.success(editingRole ? 'Role updated successfully' : 'Role created successfully')
      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      console.error('Error saving role:', error)
      toast.error(error.message)
    }
  }

  const handleDelete = async () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token || !roleToDelete) return

    try {
      const response = await fetch(`${API_BASE_URL}/admin/roles/${roleToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete role')
      }

      toast.success('Role deleted successfully')
      setIsDeleteDialogOpen(false)
      setRoleToDelete(null)
      loadData()
    } catch (error: any) {
      console.error('Error deleting role:', error)
      toast.error(error.message)
    }
  }

  const openEditDialog = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      description: role.description || '',
      permissionIds: role.permissions.map(p => p.id)
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingRole(null)
    setFormData({
      name: '',
      description: '',
      permissionIds: []
    })
  }

  const togglePermission = (permissionId: number) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId]
    }))
  }

  const getModuleIcon = (moduleKey: string) => {
    const mod = MODULES.find(m => m.key === moduleKey)
    if (!mod) return null
    const Icon = mod.icon
    return <Icon className="h-4 w-4" />
  }

  const getModuleColor = (moduleKey: string) => {
    const mod = MODULES.find(m => m.key === moduleKey)
    return mod?.color || 'bg-gray-500'
  }

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
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Roles & Permissions</h1>
            <p className="text-muted-foreground">Create roles and assign module access to students</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                <DialogDescription>
                  {editingRole ? 'Update the role details and module access' : 'Create a new role with module access permissions'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Payment Manager"
                    disabled={editingRole?.isSystem}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this role"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Permissions</Label>
                  <p className="text-xs text-muted-foreground">Select specific actions this role can perform</p>
                  <div className="grid grid-cols-1 gap-2 mt-2 max-h-72 overflow-y-auto">
                    {permissions.map((perm) => {
                      const moduleMeta = MODULES.find((m) => m.key === perm.module)
                      const Icon = moduleMeta?.icon
                      const isSelected = formData.permissionIds.includes(perm.id)
                      return (
                        <div
                          key={perm.id}
                          onClick={() => !editingRole?.isSystem && togglePermission(perm.id)}
                          className={`
                            flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                            ${isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                            }
                            ${editingRole?.isSystem ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          <Checkbox checked={isSelected} />
                          <div className={`p-2 rounded-md ${moduleMeta?.color || 'bg-gray-500'} text-white`}>
                            {Icon ? <Icon className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{moduleMeta?.label || perm.module}</div>
                            <div className="text-xs text-muted-foreground capitalize">{perm.action}</div>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 ml-auto text-primary" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!formData.name || formData.permissionIds.length === 0}>
                  {editingRole ? 'Update Role' : 'Create Role'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      {role.isSystem && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                          System
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {role.studentsCount > 0 && (
                      <div className="flex items-center text-sm text-muted-foreground mr-2">
                        <Users className="mr-1 h-4 w-4" />
                        {role.studentsCount}
                      </div>
                    )}
                    {!role.isSystem && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(role)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setRoleToDelete(role)
                            setIsDeleteDialogOpen(true)
                          }}
                          disabled={role.studentsCount > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {role.description && (
                  <CardDescription className="mt-1">{role.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.map((perm) => (
                    <span 
                      key={perm.id} 
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white ${getModuleColor(perm.module)}`}
                    >
                      {getModuleIcon(perm.module)}
                      {MODULES.find(m => m.key === perm.module)?.label || perm.module}
                    </span>
                  ))}
                  {role.permissions.length === 0 && (
                    <span className="text-xs text-muted-foreground">No module access</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {roles.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No roles yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first role to start assigning module access to students
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Role
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Role</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the role "{roleToDelete?.name}"? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
