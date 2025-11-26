"use client"

import { AdminSidebar } from "@/components/admin-sidebar"

interface AdminLayoutProps {
  children: React.ReactNode
  onLogout?: () => void
}

export function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto h-screen bg-gray-50">
        {children}
      </main>
    </div>
  )
}

