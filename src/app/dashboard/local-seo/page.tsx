"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, ExternalLink, Building2, CheckCircle2, AlertCircle, TrendingUp, Hash, Star, Crosshair } from "lucide-react"
import { loadLocalSEO, type LocalSEOData } from "@/lib/local-seo-storage"
import { APP_ROUTES } from "@/lib/constants"

export default function LocalSEOPage() {
  const [accounts, setAccounts] = useState<{ id: string; name: string; city: string; data: LocalSEOData }[]>([])

  useEffect(() => {
    const raw = localStorage.getItem("hvac-auth-user")
    if (!raw) return
    const user = JSON.parse(raw)
    const all = JSON.parse(localStorage.getItem("hvac-managed-accounts") || "{}")
    const list = all[user.companySlug] || []
    const result = list.map((a: { id: string; name: string; city: string }) => ({
      id: a.id,
      name: a.name,
      city: a.city || "",
      data: loadLocalSEO(a.id, a.name, a.city || ""),
    }))
    setAccounts(result)
  }, [])

  const avgRank = accounts.length
    ? (accounts.reduce((s, a) => s + a.data.mapPackRank, 0) / accounts.length).toFixed(1)
    : "—"
  const totalCitations = accounts.reduce((s, a) => s + a.data.citationsConsistent, 0)
  const avgCitationScore = accounts.length
    ? Math.round(accounts.reduce((s, a) => s + a.data.citationScore, 0) / accounts.length)
    : 0
  const verifiedCount = accounts.filter((a) => a.data.gbpVerified).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Local SEO</h1>
        <p className="text-sm text-zinc-400 mt-1">Google Business Profile, citations, and local rankings across all accounts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" />GBP Verified</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{verifiedCount}/{accounts.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 flex items-center gap-2"><MapPin className="h-4 w-4 text-[#FF6B00]" />Avg Map Rank</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">#{avgRank}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 flex items-center gap-2"><Hash className="h-4 w-4 text-amber-400" />Citation Score</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{avgCitationScore}%</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 flex items-center gap-2"><Star className="h-4 w-4 text-blue-400" />Consistent</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{totalCitations}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Accounts</CardTitle><CardDescription>Select an account to view detailed local SEO data</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {accounts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-zinc-500">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No accounts found.</p>
                <p className="text-xs mt-1"><Link href="/dashboard/accounts" className="text-[#FF6B00] hover:underline">Add a company</Link> to view local SEO data.</p>
              </div>
            ) : accounts.map((a) => (
              <Link key={a.id} href={APP_ROUTES.LOCAL_SEO_CLIENT(a.id)}>
                <Card className="hover:border-[#FF6B00]/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {a.name}
                          {a.data.gbpVerified ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <AlertCircle className="h-3.5 w-3.5 text-zinc-600" />}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{a.city || "N/A"}</CardDescription>
                      </div>
                      <ExternalLink className="h-4 w-4 text-zinc-600 shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div><span className="text-zinc-500">Map Rank</span><p className="font-bold text-[#FF6B00]">#{a.data.mapPackRank}</p></div>
                      <div><span className="text-zinc-500">Citations</span><p className="font-bold">{a.data.citationsConsistent}/{a.data.citationsFound}</p></div>
                      <div><span className="text-zinc-500">Score</span><p className="font-bold">{a.data.citationScore}%</p></div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
