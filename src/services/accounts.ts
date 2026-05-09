import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { AgencyAccount, DashboardStats } from "@/types/database"

export async function fetchAccounts(): Promise<AgencyAccount[]> {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const accounts = await fetchAccounts()

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
