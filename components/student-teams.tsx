"use client"

import { useEffect, useState } from "react"
import { Users, UserPlus, LogOut, Bell, ChevronRight, Calendar, MessageCircle } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getApiBaseUrl } from "@/lib/utils"

const API_BASE_URL = getApiBaseUrl()

interface Team {
  id: number
  name: string
  description: string | null
  color: string
  memberCount: number
  joinReason?: string
  joinedAt?: string
}

interface TeamNotice {
  id: number
  teamId: number
  title: string
  content: string
  createdAt: string
}

export default function StudentTeams() {
  const [allTeams, setAllTeams] = useState<Team[]>([])
  const [myTeams, setMyTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [teamNotices, setTeamNotices] = useState<TeamNotice[]>([])
  const [loadingNotices, setLoadingNotices] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [teamToJoin, setTeamToJoin] = useState<Team | null>(null)
  const [joinReason, setJoinReason] = useState("")
  const [joining, setJoining] = useState(false)
  const [view, setView] = useState<'browse' | 'my-teams'>('my-teams')

  useEffect(() => {
    fetchAllTeams()
    fetchMyTeams()
  }, [])

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamNotices(selectedTeam.id)
    }
  }, [selectedTeam])

  const fetchAllTeams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`)
      if (response.ok) {
        const data = await response.json()
        setAllTeams(data.teams || [])
      }
    } catch (error) {
      console.error("Failed to fetch teams", error)
    }
  }

  const fetchMyTeams = async () => {
    try {
      const token = localStorage.getItem('studentToken')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/teams/my/memberships`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setMyTeams(data.teams || [])
      }
    } catch (error) {
      console.error("Failed to fetch my teams", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamNotices = async (teamId: number) => {
    setLoadingNotices(true)
    try {
      const token = localStorage.getItem('studentToken')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/notices`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setTeamNotices(data.notices || [])
      }
    } catch (error) {
      console.error("Failed to fetch team notices", error)
    } finally {
      setLoadingNotices(false)
    }
  }

  const handleJoinTeam = async () => {
    if (!teamToJoin) return
    if (!joinReason.trim()) {
      toast.error('Please explain why you want to join this team')
      return
    }

    setJoining(true)
    try {
      const token = localStorage.getItem('studentToken')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/teams/${teamToJoin.id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ joinReason }),
      })

      if (response.ok) {
        toast.success(`Joined ${teamToJoin.name}!`)
        setShowJoinModal(false)
        setJoinReason("")
        setTeamToJoin(null)
        fetchMyTeams()
        fetchAllTeams()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to join team')
      }
    } catch (error) {
      toast.error('Failed to join team')
    } finally {
      setJoining(false)
    }
  }

  const handleLeaveTeam = async (teamId: number, teamName: string) => {
    if (!confirm(`Are you sure you want to leave ${teamName}?`)) return

    try {
      const token = localStorage.getItem('studentToken')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/leave`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        toast.success(`Left ${teamName}`)
        if (selectedTeam?.id === teamId) {
          setSelectedTeam(null)
        }
        fetchMyTeams()
        fetchAllTeams()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to leave team')
      }
    } catch (error) {
      toast.error('Failed to leave team')
    }
  }

  const isTeamMember = (teamId: number) => {
    return myTeams.some(t => t.id === teamId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f2d3d]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#1f2d3d] flex items-center gap-2">
          <Users className="h-5 w-5 text-[#e8cb85]" />
          Teams
        </h3>
        <div className="flex gap-2">
          <Button
            variant={view === 'my-teams' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setView('my-teams')
              setSelectedTeam(null)
            }}
            className={view === 'my-teams' ? 'bg-[#1f2d3d] hover:bg-[#2a3f54]' : ''}
          >
            My Teams ({myTeams.length})
          </Button>
          <Button
            variant={view === 'browse' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setView('browse')
              setSelectedTeam(null)
            }}
            className={view === 'browse' ? 'bg-[#1f2d3d] hover:bg-[#2a3f54]' : ''}
          >
            Browse All
          </Button>
        </div>
      </div>

      {/* Team Notice View */}
      {selectedTeam ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div
            className="p-4 flex items-center justify-between"
            style={{ backgroundColor: `${selectedTeam.color}15`, borderBottom: `3px solid ${selectedTeam.color}` }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-gray-600 hover:text-[#1f2d3d]"
              >
                ←
              </button>
              <div>
                <h4 className="font-bold text-[#1f2d3d]">{selectedTeam.name}</h4>
                <p className="text-xs text-gray-500">{selectedTeam.memberCount} members</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLeaveTeam(selectedTeam.id, selectedTeam.name)}
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Leave
            </Button>
          </div>

          <div className="p-4">
            <h5 className="font-medium text-[#1f2d3d] mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#e8cb85]" />
              Team Notice Board
            </h5>

            {loadingNotices ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1f2d3d]"></div>
              </div>
            ) : teamNotices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notices yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teamNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[#1f2d3d]">{notice.title}</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(notice.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{notice.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : view === 'my-teams' ? (
        /* My Teams List */
        myTeams.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>You haven't joined any teams yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView('browse')}
              className="mt-4"
            >
              Browse Teams
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {myTeams.map((team) => (
              <button
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left transition-all hover:shadow-md hover:border-gray-300"
                style={{ borderLeftWidth: '4px', borderLeftColor: team.color }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#1f2d3d]">{team.name}</h4>
                    <p className="text-xs text-gray-500">{team.memberCount} members</p>
                    {team.joinedAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Joined {format(new Date(team.joinedAt), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        /* Browse All Teams */
        <div className="grid gap-3">
          {allTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white border border-gray-200 rounded-xl p-4 transition-all hover:shadow-md"
              style={{ borderLeftWidth: '4px', borderLeftColor: team.color }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-[#1f2d3d]">{team.name}</h4>
                  {team.description && (
                    <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">{team.memberCount} members</p>
                </div>
                {isTeamMember(team.id) ? (
                  <span className="text-sm text-green-600 font-medium px-3 py-1 bg-green-50 rounded-full">
                    Joined
                  </span>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setTeamToJoin(team)
                      setShowJoinModal(true)
                    }}
                    className="bg-[#1f2d3d] hover:bg-[#2a3f54]"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Join
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && teamToJoin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: teamToJoin.color }}
              />
              <h3 className="text-lg font-bold text-[#1f2d3d]">
                Join {teamToJoin.name}
              </h3>
            </div>

            {teamToJoin.description && (
              <p className="text-sm text-gray-600">{teamToJoin.description}</p>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1f2d3d] mb-2">
                Why do you want to join this team? *
              </label>
              <Textarea
                placeholder="Tell us about your interest and what you hope to contribute..."
                value={joinReason}
                onChange={(e) => setJoinReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowJoinModal(false)
                  setTeamToJoin(null)
                  setJoinReason("")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinTeam}
                disabled={joining || !joinReason.trim()}
                className="flex-1 bg-[#1f2d3d] hover:bg-[#2a3f54]"
              >
                {joining ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Joining...
                  </span>
                ) : (
                  'Join Team'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
