"use client"

import { useAuth, type AuthUser } from "@/components/auth/auth-context"

export type { AuthUser }

export function useUser() {
  const { user } = useAuth()
  return user
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return null
  }

  return <>{children}</>
}
