"use client"

import { useEffect, useState } from "react"
import { Users, UserPlus, LogOut, Bell, ChevronRight, Calendar, MessageCircle, Search, ArrowRight, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getApiBaseUrl } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

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
  const [activeTab, setActiveTab] = useState("my-teams")

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
      const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
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
      const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
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
      const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
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
      const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token')
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
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  // Team Detail View
  if (selectedTeam) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setSelectedTeam(null)}
            className="pl-0 hover:bg-transparent hover:text-[#1f2d3d] text-gray-500 h-auto p-0"
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            Back to Teams
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLeaveTeam(selectedTeam.id, selectedTeam.name)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Leave Team
          </Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start gap-5">
            <div 
              className="h-16 w-16 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-sm shrink-0"
              style={{ backgroundColor: selectedTeam.color }}
            >
              {selectedTeam.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1f2d3d] tracking-tight">{selectedTeam.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1.5" />
                  {selectedTeam.memberCount} members
                </span>
                {selectedTeam.joinedAt && (
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    Joined {format(new Date(selectedTeam.joinedAt), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
              {selectedTeam.description && (
                <p className="text-gray-600 mt-3 text-sm leading-relaxed max-w-2xl">
                  {selectedTeam.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-[#1f2d3d] flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-400" />
            Team Notices
          </h3>

          {loadingNotices ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
            </div>
          ) : teamNotices.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">No notices yet</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {teamNotices.map((notice) => (
                <div key={notice.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="text-sm font-semibold text-[#1f2d3d]">{notice.title}</h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {format(new Date(notice.createdAt), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {notice.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1f2d3d] tracking-tight">Teams</h2>
          <p className="text-gray-500 text-sm">Collaborate with your groups</p>
        </div>
      </div>

      <Tabs defaultValue="my-teams" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent p-0 border-b border-gray-200 w-full justify-start h-auto rounded-none gap-6">
          <TabsTrigger 
            value="my-teams"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1f2d3d] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-2 text-sm font-medium text-gray-500 data-[state=active]:text-[#1f2d3d] transition-all"
          >
            My Teams
            <span className="ml-2 bg-gray-100 text-gray-600 text-xs py-0.5 px-2 rounded-full">
              {myTeams.length}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="browse"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1f2d3d] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-2 text-sm font-medium text-gray-500 data-[state=active]:text-[#1f2d3d] transition-all"
          >
            Browse All
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-teams" className="mt-6 animate-in fade-in-50 duration-300">
          {myTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <Users className="h-10 w-10 text-gray-300 mb-3" />
              <h3 className="text-sm font-medium text-[#1f2d3d]">No Teams Yet</h3>
              <p className="text-gray-500 text-xs mt-1 mb-4">
                You haven't joined any teams yet.
              </p>
              <Button onClick={() => setActiveTab('browse')} size="sm" className="bg-[#1f2d3d] text-white hover:bg-[#2a3f54]">
                Browse Teams
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className="group flex flex-col bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all text-left"
                >
                  <div className="flex items-start justify-between w-full mb-3">
                    <div 
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-[#1f2d3d] text-base truncate">{team.name}</h4>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {team.memberCount}
                      </span>
                      {team.joinedAt && (
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(team.joinedAt), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse" className="mt-6 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allTeams.map((team) => {
              const isMember = isTeamMember(team.id)
              return (
                <div key={team.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col h-full hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div 
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>
                    {isMember && (
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 text-[10px] px-1.5 h-5">
                        Joined
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mb-4 flex-1">
                    <h4 className="font-semibold text-[#1f2d3d] text-base">{team.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {team.description || "No description available."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400 flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {team.memberCount}
                    </span>
                    
                    {!isMember && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setTeamToJoin(team)
                          setShowJoinModal(true)
                        }}
                        className="h-7 text-xs px-2 hover:bg-gray-50 text-[#1f2d3d]"
                      >
                        Join
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Join Team Dialog */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#1f2d3d] text-base">
              Join {teamToJoin?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Please tell us why you'd like to join this team.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </Label>
              <Textarea
                id="reason"
                placeholder="I want to join because..."
                value={joinReason}
                onChange={(e) => setJoinReason(e.target.value)}
                rows={3}
                className="resize-none text-sm border-gray-200 focus:border-[#1f2d3d] focus:ring-1 focus:ring-[#1f2d3d]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleJoinTeam}
              disabled={joining || !joinReason.trim()}
              className="w-full bg-[#1f2d3d] hover:bg-[#2a3f54] text-white h-9"
            >
              {joining ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
