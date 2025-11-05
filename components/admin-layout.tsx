"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User, Calendar, Clock, FileText } from "lucide-react"
import Image from "next/image"

interface AdminLayoutProps {
  children: React.ReactNode
  onLogout?: () => void
}

export function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

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

  const navItems: Array<{
    path: string
    label: string
    icon: any
    matchPaths?: string[]
  }> = [
    { path: '/admin/applications', label: 'Applications', icon: FileText },
    { path: '/admin/interview', label: 'Interview', icon: Calendar, matchPaths: ['/admin/interview'] },
    { path: '/admin/time-slots', label: 'Time Slots', icon: Clock },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/40">
        <div className="container mx-auto px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl">
                  <Image 
                    src="/assets/logo/logo_icon.png" 
                    alt="Chenaniah Logo" 
                    width={35} 
                    height={35}
                    className="object-contain"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-muted-foreground font-medium text-primary">Chenaniah Music Ministry</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.path || (item.matchPaths && item.matchPaths.some(path => pathname.startsWith(path)))
                return (
                  <Button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`gap-2 transition-all ${
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                )
              })}
              <Button onClick={handleLogout} variant="ghost" size="sm" className="gap-2 hover:bg-muted/50 transition-all">
                <LogOut className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

