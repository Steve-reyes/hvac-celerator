"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, MapPin, Building2, CheckCircle2, AlertCircle, XCircle, Star, TrendingUp, TrendingDown, Eye, Search, MousePointerClick, Minus } from "lucide-react"
import { loadLocalSEO, getLocalSEORankHistory, type LocalSEOData, type LocalSEOHistoryPoint } from "@/lib/local-seo-storage"
import { getAccountWithCity } from "@/lib/keywords-storage"
import { cn } from "@/lib/utils"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts"

export default function LocalSEOAccountPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const [data, setData] = useState<LocalSEOData | null>(null)
  const [rankHistory, setRankHistory] = useState<LocalSEOHistoryPoint[]>([])
  const [accountName, setAccountName] = useState("")
  const [accountCity, setAccountCity] = useState("")

  useEffect(() => {
    const meta = getAccountWithCity(clientId)
    setAccountName(meta.name)
    setAccountCity(meta.city)
    setData(loadLocalSEO(clientId, meta.name, meta.city))
    setRankHistory(getLocalSEORankHistory(clientId))
  }, [clientId])

  if (!data) return null

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/local-seo"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">Local SEO</h1>
          <p className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
            {accountName}
            {accountCity && <span className="flex items-center gap-1 text-zinc-500"><MapPin className="h-3 w-3" />{accountCity}</span>}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-zinc-400 flex items-center gap-1">
              {data.gbpVerified ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <AlertCircle className="h-3.5 w-3.5 text-zinc-500" />}
              GBP Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn("text-lg font-bold", data.gbpVerified ? "text-emerald-400" : "text-zinc-500")}>
              {data.gbpVerified ? "Verified" : "Unverified"}
            </p>
            <p className="text-[10px] text-zinc-600">{data.gbpCategory} · {data.gbpPostsPerMonth} posts/mo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-zinc-400 flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[#FF6B00]" />Map Pack Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-[#FF6B00]">#{data.mapPackRank}</p>
              {rankHistory.length >= 2 && (() => {
                const first = rankHistory[0].mapPackRank
                const last = rankHistory[rankHistory.length - 1].mapPackRank
                if (last < first) return <span className="flex items-center gap-0.5 text-[10px] text-emerald-400"><TrendingUp className="h-3 w-3" />+{first - last}</span>
                if (last > first) return <span className="flex items-center gap-0.5 text-[10px] text-red-400"><TrendingDown className="h-3 w-3" />-{last - first}</span>
                return <Minus className="h-3 w-3 text-zinc-500" />
              })()}
            </div>
            <p className="text-[10px] text-zinc-600">{data.localKeywordsRanked} local keywords ranked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-zinc-400 flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400" />Citation Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{data.citationScore}%</p>
            <p className="text-[10px] text-zinc-600">{data.citationsConsistent}/{data.citationsFound} directories consistent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-zinc-400 flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-blue-400" />Service Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{data.serviceAreas.length}</p>
            <p className="text-[10px] text-zinc-600 truncate">{data.serviceAreas.join(", ")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-blue-400" />Weekly Views</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.weeklyGBPViews.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 flex items-center gap-1"><Search className="h-3.5 w-3.5 text-[#FF6B00]" />Searches</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.weeklyGBPSearches.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 flex items-center gap-1"><MousePointerClick className="h-3.5 w-3.5 text-emerald-400" />Actions</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.weeklyGBPActions.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      {rankHistory.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#FF6B00]" />
              Map Pack Rank History
            </CardTitle>
            <CardDescription>Daily rank position over time (lower is better)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rankHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rankGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#a1a1aa" }} tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })} />
                  <YAxis domain={[0, "auto"]} reversed tick={{ fontSize: 11, fill: "#a1a1aa" }} tickFormatter={(v) => `#${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: unknown) => [`#${value}`, "Rank"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  />
                  <Area type="monotone" dataKey="mapPackRank" stroke="#FF6B00" fill="url(#rankGradient)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#FF6B00" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Local Competitors</CardTitle><CardDescription>Who's ranking in the local pack around you</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competitor</TableHead>
                  <TableHead className="text-center w-[60px]">Rank</TableHead>
                  <TableHead className="text-center w-[60px]">Rating</TableHead>
                  <TableHead className="text-center w-[70px]">Reviews</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[{
                  name: `${accountName || "You"}`,
                  rank: data.mapPackRank,
                  rating: 0,
                  reviews: 0,
                  isYou: true,
                }, ...data.localCompetitors].map((c) => (
                  <TableRow key={c.name}>
                    <TableCell className={cn("font-medium text-sm", (c as any).isYou && "text-[#FF6B00]")}>
                      {c.name}{(c as any).isYou && <Badge variant="default" className="ml-2 text-[9px]">You</Badge>}
                    </TableCell>
                    <TableCell className="text-center font-bold">#{c.rank}</TableCell>
                    <TableCell className="text-center">{c.rating > 0 ? c.rating.toFixed(1) : "—"}</TableCell>
                    <TableCell className="text-center">{c.reviews > 0 ? c.reviews.toLocaleString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Citation Tracker</CardTitle><CardDescription>NAP consistency across business directories</CardDescription></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1 text-[10px]"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Listed & Matched</div>
              <div className="flex items-center gap-1 text-[10px]"><AlertCircle className="h-3 w-3 text-amber-400" /> Listed, mismatch</div>
              <div className="flex items-center gap-1 text-[10px]"><XCircle className="h-3 w-3 text-red-400" /> Not listed</div>
            </div>
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {data.directoryListings.map((d) => (
                <div key={d.name} className="flex items-center justify-between py-1.5 border-b border-zinc-800/50 last:border-0">
                  <div className="flex items-center gap-2">
                    {d.listed && d.napMatch && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                    {d.listed && !d.napMatch && <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                    {!d.listed && <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                    <span className="text-sm">{d.name}</span>
                  </div>
                  <Badge variant={d.listed && d.napMatch ? "success" : d.listed ? "default" : "destructive"} className="text-[9px]">
                    {d.listed && d.napMatch ? "Match" : d.listed ? "Mismatch" : "Missing"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
