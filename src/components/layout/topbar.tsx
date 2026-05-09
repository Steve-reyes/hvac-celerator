"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-context"

export function Topbar() {
  const { user } = useAuth()

  return (
    <header className="flex h-14 items-center gap-4 border-b border-zinc-800 bg-zinc-900 px-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Search accounts, keywords..."
          className="pl-9 bg-zinc-800 border-zinc-700"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
          <div className="h-8 w-8 rounded-full bg-[#FF6B00] flex items-center justify-center text-xs font-bold text-white">
            {user ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "SA"}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-none">{user?.fullName ?? "User"}</p>
            <p className="text-xs text-zinc-500">{user?.companyName ?? "Agency"}</p>
          </div>
        </div>
      </div>
    </header>
  )
}