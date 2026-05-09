import { DashboardShell } from "@/components/layout/dashboard-shell"
import { RequireAuth } from "@/components/auth/use-auth"
import type { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  )
}