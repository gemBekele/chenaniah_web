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
  DollarSign
} from "lucide-react"
import Image from "next/image"
import { useState } from "react"
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
    sessionStorage.removeItem('admin_token')
    if (onLogout) {
      onLogout()
    } else {
      router.push('/admin')
    }
  }

  const navItems = [
    { 
      path: '/admin/applications', 
      label: 'Applications', 
      icon: FileText 
    },
    { 
      path: '/admin/interview', 
      label: 'Interview', 
      icon: Calendar, 
      matchPaths: ['/admin/interview'] 
    },
    { 
      path: '/admin/time-slots', 
      label: 'Time Slots', 
      icon: Clock 
    },
    { 
      path: '/admin/trainees', 
      label: 'Trainees', 
      icon: Users,
      matchPaths: ['/admin/trainees'] 
    },
    { 
      path: '/admin/assignments', 
      label: 'Assignments', 
      icon: FileText,
      matchPaths: ['/admin/assignments'] 
    },
    { 
      path: '/admin/payments', 
      label: 'Payments', 
      icon: DollarSign,
      matchPaths: ['/admin/payments'] 
    },
    { 
      path: '/admin/resources', 
      label: 'Resources', 
      icon: Folder,
      matchPaths: ['/admin/resources'] 
    },
  ]

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
        {navItems.map((item) => {
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
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "w-full justify-start text-gray-400 hover:text-white hover:bg-white/10",
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
