"use client"

import { useState, useEffect } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { AccountsTable } from "@/components/dashboard/accounts-table"
import type { DashboardStats, AgencyAccount } from "@/types/database"

interface ManagedAccount {
  id: string
  name: string
  slug: string
  website: string
  avgMapPackRank: number | null
  reviewScore: number | null
  monthlyLeadCount: number | null
}

function loadAccounts(): ManagedAccount[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem("hvac-auth-user")
  if (!raw) return []
  const user = JSON.parse(raw)
  const all = JSON.parse(localStorage.getItem("hvac-managed-accounts") || "{}")
  return (all[user.companySlug] || []).map((a: ManagedAccount) => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    website: a.website,
    avgMapPackRank: a.avgMapPackRank,
    reviewScore: a.reviewScore,
    monthlyLeadCount: a.monthlyLeadCount,
  }))
}

function calculateStats(accounts: AgencyAccount[]): DashboardStats {
  const totalClients = accounts.length
  const validRanks = accounts.filter((a) => a.avgMapPackRank !== null)
  const avgMapPackRank =
    validRanks.length > 0
      ? validRanks.reduce((sum, a) => sum + (a.avgMapPackRank ?? 0), 0) /
        validRanks.length
      : 0
  const validScores = accounts.filter((a) => a.reviewScore !== null)
  const avgReviewScore =
    validScores.length > 0
      ? validScores.reduce((sum, a) => sum + (a.reviewScore ?? 0), 0) /
        validScores.length
      : 0
  const totalMonthlyLeads = accounts.reduce(
    (sum, a) => sum + (a.monthlyLeadCount ?? 0),
    0
  )

  return { totalClients, avgMapPackRank, avgReviewScore, totalMonthlyLeads }
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<AgencyAccount[]>([])

  useEffect(() => {
    setAccounts(loadAccounts())

    const handler = () => setAccounts(loadAccounts())
    window.addEventListener("storage", handler)
    window.addEventListener("focus", handler)
    return () => {
      window.removeEventListener("storage", handler)
      window.removeEventListener("focus", handler)
    }
  }, [])

  const stats = calculateStats(accounts)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agency Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Live overview of {accounts.length} managed account{accounts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <p className="text-zinc-500">No accounts yet.</p>
          <p className="text-sm text-zinc-600 mt-1">
            <a href="/dashboard/accounts" className="text-[#FF6B00] hover:underline">Add a company</a> to start tracking SEO performance.
          </p>
        </div>
      ) : (
        <>
          <StatsCards stats={stats} />
          <AccountsTable accounts={accounts} />
        </>
      )}
    </div>
  )
}
