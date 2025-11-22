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
  ChevronRight
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
  ]

  return (
    <div 
      className={cn(
        "flex flex-col h-screen bg-background border-r border-border/40 transition-all duration-300 sticky top-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/40 flex items-center justify-between">
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
              <span className="font-bold text-lg leading-none">Admin</span>
              <span className="text-xs text-muted-foreground">Dashboard</span>
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
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/40 space-y-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted",
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
            "w-full justify-start text-rose-500 hover:text-rose-600 hover:bg-rose-50",
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
