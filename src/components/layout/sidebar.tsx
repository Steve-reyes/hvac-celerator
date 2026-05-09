"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-context"
import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Palette,
  Hash,
  Star,
  Crosshair,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/accounts", label: "Accounts", icon: Users },
  { href: "/dashboard/keywords", label: "Keywords", icon: Hash },
  { href: "/dashboard/competitors", label: "Competitors", icon: Crosshair },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/white-label", label: "White Label", icon: Palette },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b border-zinc-800 px-4">
        {collapsed ? (
          <span className="text-lg font-bold text-[#FF6B00]">H</span>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#FF6B00]">H-VAC</span>
            <span className="text-xs text-zinc-500">celerator</span>
          </Link>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size={collapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start gap-3 text-sm",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-zinc-800 p-2 space-y-1">
        {user && !collapsed && (
          <div className="px-3 py-2 text-xs text-zinc-500 truncate">
            {user.companyName}
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn("w-full justify-start gap-3 text-sm", collapsed && "justify-center px-0")}
          onClick={logout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="text-xs text-zinc-500">Collapse</span>}
        </Button>
      </div>
    </aside>
  )
}