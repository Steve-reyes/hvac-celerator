"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, TrendingUp, TrendingDown, Hash } from "lucide-react"
import { getRankLabel } from "@/services/rankings"
import {
  loadKeywordRankings, getKeywordHistory, getAccountWithCity,
  type KeywordRanking
} from "@/lib/keywords-storage"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from "recharts"

const COLORS = [
  "#FF6B00", "#34d399", "#60a5fa", "#f472b6", "#fbbf24",
  "#a78bfa", "#34d399", "#f87171", "#2dd4bf", "#fb923c",
  "#e879f9", "#22d3ee", "#4ade80", "#facc15", "#38bdf8",
]

export default function KeywordsOverviewPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const [rankings, setRankings] = useState<KeywordRanking[]>([])
  const [accountName, setAccountName] = useState("")
  const [accountCity, setAccountCity] = useState("")

  useEffect(() => {
    setRankings(loadKeywordRankings(clientId))
    const meta = getAccountWithCity(clientId)
    setAccountName(meta.name)
    setAccountCity(meta.city)
  }, [clientId])

  const allDates = new Set<string>()
  const keywordSeries: { keyword: string; color: string; data: { date: string; rank: number }[] }[] = []

  rankings.forEach((r, i) => {
    const history = getKeywordHistory(clientId, r.keyword)
    history.forEach((h) => allDates.add(h.date))
    keywordSeries.push({ keyword: r.keyword, color: COLORS[i % COLORS.length], data: history })
  })

  const sortedDates = [...allDates].sort()
  const top3 = rankings.filter((r) => r.rank <= 3).length
  const top10 = rankings.filter((r) => r.rank <= 10).length
  const avgRank = rankings.length > 0
    ? (rankings.reduce((s, r) => s + r.rank, 0) / rankings.length).toFixed(1)
    : "—"

  const chartData = sortedDates.map((date) => {
    const point: Record<string, number | string> = { date }
    keywordSeries.forEach(({ keyword, data }) => {
      const match = data.find((d) => d.date === date)
      if (match) point[keyword] = match.rank * -1
    })
    return point
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/accounts/${clientId}/keywords`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Keyword Position History</h1>
          <p className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
            {accountName}
            {accountCity && (
              <span className="flex items-center gap-1 text-zinc-500">
                <MapPin className="h-3 w-3" />
                {accountCity}
              </span>
            )}
            <span className="mx-1">·</span>
            <span>{rankings.length} keywords tracked</span>
            <span className="mx-1">·</span>
            <span>{sortedDates.length} scan dates</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <Hash className="h-4 w-4 text-[#FF6B00]" />
              Keywords
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{rankings.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-[#FF6B00]" />
              Avg Rank
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">#{avgRank}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Top 3
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{top3}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              Top 10
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{top10}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Keywords — Position Over Time</CardTitle>
          <CardDescription>
            {keywordSeries.length} keyword{keywordSeries.length !== 1 ? "s" : ""} plotted across {sortedDates.length} scan date{sortedDates.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length < 2 ? (
            <div className="py-16 text-center text-zinc-500">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Not enough scan data to show a graph.</p>
              <p className="text-xs mt-1">Scan keywords at least 2 times to see position history.</p>
            </div>
          ) : (
            <div className="h-[500px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    tickLine={{ stroke: "#27272a" }}
                    axisLine={{ stroke: "#27272a" }}
                  />
                  <YAxis
                    domain={[-20, 0]}
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    tickLine={{ stroke: "#27272a" }}
                    axisLine={{ stroke: "#27272a" }}
                    tickFormatter={(v) => `#${Math.abs(v)}`}
                    label={{ value: "Rank Position", angle: -90, position: "insideLeft", fill: "#a1a1aa", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ color: "#a1a1aa" }}
                    formatter={(value) => [`#${Math.abs(value as number)}`, "Position"]}
                  />
                  <ReferenceLine y={-3} stroke="#34d399" strokeDasharray="4 4" label={{ value: "Top 3", fill: "#34d399", fontSize: 10, position: "right" }} />
                  <ReferenceLine y={-10} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: "Top 10", fill: "#fbbf24", fontSize: 10, position: "right" }} />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", color: "#a1a1aa" }}
                    formatter={(value) => <span style={{ color: "#d4d4d8" }}>{value}</span>}
                  />
                  {keywordSeries.map(({ keyword, color, data }) => (
                    data.length >= 2 && (
                      <Line
                        key={keyword}
                        type="monotone"
                        dataKey={keyword}
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: color, stroke: "#09090b", strokeWidth: 1 }}
                        connectNulls
                      />
                    )
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {keywordSeries.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {keywordSeries
            .sort((a, b) => {
              const lastA = a.data[a.data.length - 1]?.rank ?? 999
              const lastB = b.data[b.data.length - 1]?.rank ?? 999
              return lastA - lastB
            })
            .map(({ keyword, color, data }) => {
              const current = data[data.length - 1]?.rank
              const first = data[0]?.rank
              const trend = current != null && first != null ? current - first : null
              return (
                <Link key={keyword} href={`/dashboard/accounts/${clientId}/keywords/${encodeURIComponent(keyword)}`}>
                  <Card className="hover:border-zinc-700 transition-colors cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          {keyword}
                        </CardTitle>
                        <Badge variant={current != null && current <= 3 ? "success" : current != null && current <= 10 ? "default" : "secondary"}>
                          {current ? getRankLabel(current) : "—"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold">#{current ?? "—"}</span>
                        <div className="flex items-center gap-1 text-xs">
                          {trend != null && trend < 0 && <TrendingUp className="h-3 w-3 text-emerald-400" />}
                          {trend != null && trend > 0 && <TrendingDown className="h-3 w-3 text-red-400" />}
                          {trend != null && (
                            <span className={trend < 0 ? "text-emerald-400" : trend > 0 ? "text-red-400" : "text-zinc-500"}>
                              {trend < 0 ? `+${Math.abs(trend)}` : trend > 0 ? `-${trend}` : "—"}
                            </span>
                          )}
                          {trend == null && <span className="text-zinc-600">No trend</span>}
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-1">{data.length} scan{data.length !== 1 ? "s" : ""}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
        </div>
      )}
    </div>
  )
}

function Crosshair(props: React.ComponentProps<"svg">) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="22" x2="18" y1="12" y2="12" />
      <line x1="6" x2="2" y1="12" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
    </svg>
  )
}