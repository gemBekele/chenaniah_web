"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Users, Plus, Trash2, Edit, Eye, UserCheck, UserPlus, Loader2, 
  ChevronDown, Bell, ArrowLeft
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getApiBaseUrl } from "@/lib/utils"
import { AdminLayout } from "@/components/admin-layout"

const API_BASE_URL = getApiBaseUrl()

interface Team {
  id: number
  name: string
  description: string | null
  color: string
  memberCount: number
  createdAt: string
}

interface TeamMember {
  id: number
  fullNameEnglish?: string
  fullNameAmharic?: string
  phone: string
  joinReason: string
  joinedAt: string
  membershipId: number
}

interface TeamNotice {
  id: number
  title: string
  content: string
  createdAt: string
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamNotices, setTeamNotices] = useState<TeamNotice[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: "", description: "", color: "#3B82F6" })
  const [creating, setCreating] = useState(false)
  const [newNotice, setNewNotice] = useState({ title: "", content: "" })
  const [addingNotice, setAddingNotice] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchTeams()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams || [])
      }
    } catch (error) {
      console.error("Failed to fetch teams", error)
      toast.error("Failed to load teams")
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamDetails = async (team: Team) => {
    setSelectedTeam(team)
    setLoadingDetails(true)
    try {
      const [membersRes, noticesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/teams/${team.id}/members`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/teams/${team.id}/notices`, { headers: getAuthHeaders() }),
      ])

      if (membersRes.ok) {
        const membersData = await membersRes.json()
        setTeamMembers(membersData.members || [])
      }

      if (noticesRes.ok) {
        const noticesData = await noticesRes.json()
        setTeamNotices(noticesData.notices || [])
      }
    } catch (error) {
      console.error("Failed to fetch team details", error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim()) {
      toast.error("Team name is required")
      return
    }

    setCreating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newTeam),
      })

      if (response.ok) {
        toast.success("Team created successfully")
        setShowCreateModal(false)
        setNewTeam({ name: "", description: "", color: "#3B82F6" })
        fetchTeams()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to create team")
      }
    } catch (error) {
      toast.error("Failed to create team")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteTeam = async (teamId: number, teamName: string) => {
    if (!confirm(`Are you sure you want to delete "${teamName}"? This will also remove all members and notices.`)) return

    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        toast.success("Team deleted")
        if (selectedTeam?.id === teamId) {
          setSelectedTeam(null)
        }
        fetchTeams()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete team")
      }
    } catch (error) {
      toast.error("Failed to delete team")
    }
  }

  const handleAddNotice = async () => {
    if (!selectedTeam) return
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      toast.error("Title and content are required")
      return
    }

    setAddingNotice(true)
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.id}/notices`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newNotice),
      })

      if (response.ok) {
        toast.success("Notice added")
        setNewNotice({ title: "", content: "" })
        fetchTeamDetails(selectedTeam)
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to add notice")
      }
    } catch (error) {
      toast.error("Failed to add notice")
    } finally {
      setAddingNotice(false)
    }
  }

  const handleDeleteNotice = async (noticeId: number) => {
    if (!selectedTeam) return
    if (!confirm("Are you sure you want to delete this notice?")) return

    try {
      const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.id}/notices/${noticeId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        toast.success("Notice deleted")
        fetchTeamDetails(selectedTeam)
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete notice")
      }
    } catch (error) {
      toast.error("Failed to delete notice")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1f2d3d]" />
      </div>
    )
  }

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
                <h1 className="text-3xl font-bold text-[#1f2d3d]">Team Management</h1>
                <p className="text-gray-500">Create and manage teams, members, and notices</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[#1f2d3d] hover:bg-[#2a3f54] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Teams List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-semibold text-[#1f2d3d]">Teams ({teams.length})</h2>
              
              {teams.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No teams yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4"
                  >
                    Create First Team
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => fetchTeamDetails(team)}
                      className={`w-full bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                        selectedTeam?.id === team.id ? 'border-[#1f2d3d] ring-1 ring-[#1f2d3d]' : 'border-gray-200'
                      }`}
                      style={{ borderLeftWidth: '4px', borderLeftColor: team.color }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-[#1f2d3d]">{team.name}</h3>
                          <p className="text-sm text-gray-500">{team.memberCount} members</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTeam(team.id, team.name)
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Team Details */}
            <div className="lg:col-span-2">
              {selectedTeam ? (
                <div className="space-y-6">
                  {/* Team Header */}
                  <div 
                    className="bg-white rounded-xl border border-gray-200 p-6"
                    style={{ borderTopWidth: '4px', borderTopColor: selectedTeam.color }}
                  >
                    <h2 className="text-xl font-bold text-[#1f2d3d] mb-1">{selectedTeam.name}</h2>
                    {selectedTeam.description && (
                      <p className="text-gray-500">{selectedTeam.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {selectedTeam.memberCount} members
                      </span>
                      <span>Created {format(new Date(selectedTeam.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  {loadingDetails ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-[#1f2d3d]" />
                    </div>
                  ) : (
                    <>
                      {/* Members */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-[#1f2d3d] mb-4 flex items-center gap-2">
                          <UserCheck className="h-5 w-5 text-[#e8cb85]" />
                          Members ({teamMembers.length})
                        </h3>
                        
                        {teamMembers.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">No members yet</p>
                        ) : (
                          <div className="space-y-3 max-h-64 overflow-auto">
                            {teamMembers.map((member) => (
                              <div key={member.membershipId} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-[#1f2d3d]">
                                    {member.fullNameEnglish || member.fullNameAmharic || member.phone}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    Joined {format(new Date(member.joinedAt), 'MMM d')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 italic">"{member.joinReason}"</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Notices */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-[#1f2d3d] mb-4 flex items-center gap-2">
                          <Bell className="h-5 w-5 text-[#e8cb85]" />
                          Team Notices ({teamNotices.length})
                        </h3>
                        
                        {/* Add Notice Form */}
                        <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
                          <Input
                            placeholder="Notice title"
                            value={newNotice.title}
                            onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                          />
                          <Textarea
                            placeholder="Notice content..."
                            value={newNotice.content}
                            onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                            rows={3}
                          />
                          <Button
                            onClick={handleAddNotice}
                            disabled={addingNotice}
                            size="sm"
                            className="bg-[#1f2d3d] hover:bg-[#2a3f54] text-white"
                          >
                            {addingNotice ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Plus className="h-4 w-4 mr-2" />
                            )}
                            Add Notice
                          </Button>
                        </div>
                        
                        {teamNotices.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">No notices yet</p>
                        ) : (
                          <div className="space-y-3 max-h-64 overflow-auto">
                            {teamNotices.map((notice) => (
                              <div key={notice.id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-1">
                                  <span className="font-medium text-[#1f2d3d]">{notice.title}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">
                                      {format(new Date(notice.createdAt), 'MMM d')}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteNotice(notice.id)}
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">{notice.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Users className="h-16 w-16 mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-500">Select a team to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Team Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-xl font-bold text-[#1f2d3d]">Create New Team</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
                  <Input
                    placeholder="Enter team name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Textarea
                    placeholder="What is this team about?"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={newTeam.color}
                      onChange={(e) => setNewTeam({ ...newTeam, color: e.target.value })}
                      className="w-12 h-10 rounded border border-gray-200 cursor-pointer"
                    />
                    <span className="text-sm text-gray-500">{newTeam.color}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewTeam({ name: "", description: "", color: "#3B82F6" })
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={creating}
                  className="flex-1 bg-[#1f2d3d] hover:bg-[#2a3f54] text-white"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Create Team
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
