"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Clock, 
  LogOut, 
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  Folder,
  DollarSign,
  CheckSquare,
  Bell,
  Shield,
  Key
} from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface AdminSidebarProps {
  onLogout?: () => void
}

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_token_compressed')
    localStorage.removeItem('admin_token_header')
    // Check if it was a student logout BEFORE removing tokens
    const wasStudent = !!(localStorage.getItem('student_token') || sessionStorage.getItem('student_token'))
    
    sessionStorage.removeItem('admin_token')
    localStorage.removeItem('student_token')
    sessionStorage.removeItem('student_token')
    localStorage.removeItem('student_role')
    sessionStorage.removeItem('student_role')
    localStorage.removeItem('student_user')
    sessionStorage.removeItem('student_user')
    localStorage.removeItem('student_permissions')
    sessionStorage.removeItem('student_permissions')
    localStorage.removeItem('led_section')
    sessionStorage.removeItem('led_section')
    
    if (onLogout) {
      onLogout()
    } else {
      // If student was logged in, redirect to student login, else admin login
      if (wasStudent) {
        router.push('/login')
      } else {
        router.push('/admin')
      }
    }
  }

  const navItems = [
    // { 
    //   path: '/admin/applications', 
    //   label: 'Applications', 
    //   icon: FileText 
    // },
    { 
      path: '/admin/interview', 
      label: 'Interview', 
      icon: Calendar, 
      matchPaths: ['/admin/interview'],
      permission: 'interview'
    },
    // { 
    //   path: '/admin/time-slots', 
    //   label: 'Time Slots', 
    //   icon: Clock 
    // },
    { 
      path: '/admin/trainees', 
      label: 'Trainees', 
      icon: Users,
      matchPaths: ['/admin/trainees'],
      permission: 'trainees'
    },
    { 
      path: '/admin/sections', 
      label: 'Sections', 
      icon: Users,
      matchPaths: ['/admin/sections'],
      permission: 'sections'
    },
    { 
      path: '/admin/assignments', 
      label: 'Assignments', 
      icon: FileText,
      matchPaths: ['/admin/assignments'],
      permission: 'assignments'
    },
    { 
      path: '/admin/payments', 
      label: 'Payments', 
      icon: DollarSign,
      matchPaths: ['/admin/payments'],
      permission: 'payments'
    },
    { 
      path: '/admin/attendance', 
      label: 'Attendance', 
      icon: CheckSquare,
      matchPaths: ['/admin/attendance'],
      permission: 'attendance'
    },
    { 
      path: '/admin/resources', 
      label: 'Resources', 
      icon: Folder,
      matchPaths: ['/admin/resources'],
      permission: 'resources'
    },
    { 
      path: '/admin/notes', 
      label: 'Notes', 
      icon: FileText,
      matchPaths: ['/admin/notes'],
      permission: 'notes'
    },
    { 
      path: '/admin/notices', 
      label: 'Notices', 
      icon: Bell,
      matchPaths: ['/admin/notices'],
      permission: 'notices'
    },
    { 
      path: '/admin/teams', 
      label: 'Teams', 
      icon: Users,
      matchPaths: ['/admin/teams'],
      permission: 'teams'
    },
    { 
      path: '/admin/applications', 
      label: 'Applications', 
      icon: FileText,
      matchPaths: ['/admin/applications'],
      permission: 'applications'
    },
    { 
      path: '/admin/prayer', 
      label: 'Prayer', 
      icon: Clock,
      matchPaths: ['/admin/prayer'],
      permission: 'prayer'
    },
    { 
      path: '/admin/roles', 
      label: 'Roles', 
      icon: Shield,
      matchPaths: ['/admin/roles'],
      adminOnly: true
    },
    { 
      path: '/admin/student-access', 
      label: 'Student Access', 
      icon: Key,
      matchPaths: ['/admin/student-access'],
      adminOnly: true
    },
  ]

  const [isAdmin, setIsAdmin] = useState(false)
  const [studentPermissions, setStudentPermissions] = useState<string[]>([])
  const [ledSection, setLedSection] = useState<{id: number, name: string} | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    const adminToken = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    setIsAdmin(!!adminToken)
    
    if (!adminToken) {
      try {
        const perms = localStorage.getItem('student_permissions') || sessionStorage.getItem('student_permissions')
        if (perms) setStudentPermissions(JSON.parse(perms))
        
        const section = localStorage.getItem('led_section') || sessionStorage.getItem('led_section')
        if (section) setLedSection(JSON.parse(section))
      } catch (e) {}
    }
    setIsLoading(false)
  }, [])

  const isStudentWithPermissions = !isAdmin && studentPermissions.length > 0

  // Filter navItems based on permissions - show nothing while loading
  let filteredNavItems = navItems
  
  if (isLoading) {
    filteredNavItems = []
  } else {
    filteredNavItems = navItems.filter(item => {
      // Hide admin-only pages for students
      if (item.adminOnly && !isAdmin) return false
      // Always show for admins
      if (isAdmin) return true
      
      // Special case for section leader link - it's not in navItems yet
      return !item.permission || studentPermissions.includes(item.permission)
    })

    // Add Section Management for students who lead a section
    if (!isAdmin && ledSection) {
      filteredNavItems.push({
        path: `/admin/sections/${ledSection.id}`,
        label: `My Section: ${ledSection.name}`,
        icon: Users,
        matchPaths: [`/admin/sections/${ledSection.id}`],
        adminOnly: false
      })
    }
  }

  return (
    <div 
      className={cn(
        "flex flex-col h-screen bg-[#1f2d3d] text-white border-r border-white/10 transition-all duration-300 sticky top-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className={cn("flex items-center gap-3 overflow-hidden", collapsed && "justify-center w-full")}>
          <div className="relative flex-shrink-0 w-10 h-10">
            <Image 
              src="/assets/logo/logo_icon.png" 
              alt="Chenaniah Logo" 
              fill
              className="object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none text-white">Admin</span>
              <span className="text-xs text-gray-400">Dashboard</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        ) : filteredNavItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No access yet
          </div>
        ) : (
          filteredNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path || (item.matchPaths && item.matchPaths.some(path => pathname.startsWith(path)))
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                isActive 
                  ? "bg-[#e8cb85] text-[#1f2d3d] shadow-md shadow-black/10 font-medium" 
                  : "hover:bg-white/10 text-gray-300 hover:text-white",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-[#1f2d3d]" : "text-gray-400 group-hover:text-white")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })
      )}

      <Button 
        variant="ghost" 
        size="sm" 
        className={cn(
          "w-full justify-start text-gray-400 hover:text-white hover:bg-white/10 mt-auto",
          collapsed && "justify-center px-0"
        )}
        onClick={() => setCollapsed(!collapsed)}
      >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : (
            <>
              <ChevronLeft className="h-5 w-5 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "w-full justify-start text-rose-400 hover:text-rose-300 hover:bg-rose-500/10",
            collapsed && "justify-center px-0"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-5 w-5", !collapsed && "mr-2")} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}
