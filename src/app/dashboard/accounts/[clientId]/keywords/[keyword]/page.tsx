"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, TrendingUp, TrendingDown } from "lucide-react"
import { getRankLabel } from "@/services/rankings"
import { getKeywordHistory, getAccountWithCity } from "@/lib/keywords-storage"
import { cn } from "@/lib/utils"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts"

export default function KeywordGraphPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const keyword = decodeURIComponent(params.keyword as string)
  const [history, setHistory] = useState<{ date: string; rank: number }[]>([])
  const [accountName, setAccountName] = useState("")
  const [accountCity, setAccountCity] = useState("")

  useEffect(() => {
    setHistory(getKeywordHistory(clientId, keyword))
    const meta = getAccountWithCity(clientId)
    setAccountName(meta.name)
    setAccountCity(meta.city)
  }, [clientId, keyword])

  const currentRank = history.length > 0 ? history[history.length - 1].rank : null
  const bestRank = history.length > 0 ? Math.min(...history.map((p) => p.rank)) : null
  const worstRank = history.length > 0 ? Math.max(...history.map((p) => p.rank)) : null
  const firstRank = history.length > 0 ? history[0].rank : null
  const trend = currentRank != null && firstRank != null ? currentRank - firstRank : null

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/accounts/${clientId}/keywords`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{keyword}</h1>
          <p className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
            {accountName}
            {accountCity && (
              <span className="flex items-center gap-1 text-zinc-500">
                <MapPin className="h-3 w-3" />
                {accountCity}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Current Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">#{currentRank ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Best Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-400">#{bestRank ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Worst Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-400">#{worstRank ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Overall Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              {trend != null && trend < 0 && <TrendingUp className="h-5 w-5 text-emerald-400" />}
              {trend != null && trend > 0 && <TrendingDown className="h-5 w-5 text-red-400" />}
              {trend != null && trend === 0 && <span className="text-2xl font-bold text-zinc-500">—</span>}
              {trend != null && trend !== 0 && (
                <span className={cn("text-2xl font-bold", trend < 0 ? "text-emerald-400" : "text-red-400")}>
                  {trend < 0 ? "+" : ""}{Math.abs(trend)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Status</CardTitle>
          </CardHeader>
          <CardContent>
            {currentRank ? (
              <Badge variant={currentRank <= 3 ? "success" : currentRank <= 10 ? "default" : "secondary"}>
                {getRankLabel(currentRank)}
              </Badge>
            ) : (
              <span className="text-zinc-600">—</span>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Position History</CardTitle>
              <CardDescription>
                {history.length} scan{history.length !== 1 ? "s" : ""} recorded
                {history.length > 0 && ` · ${history[0].date} to ${history[history.length - 1].date}`}
              </CardDescription>
            </div>
            {history.length >= 2 && (
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1 text-emerald-400">
                  <TrendingUp className="h-3 w-3" /> Improving (lower is better)
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <TrendingDown className="h-3 w-3" /> Declining
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {history.length < 2 ? (
            <div className="py-16 text-center text-zinc-500">
              <p>Not enough data to show a graph.</p>
              <p className="text-xs mt-1">Scan this keyword at least 2 times to see position history.</p>
            </div>
          ) : (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history.map((p) => ({ ...p, rank: p.rank * -1 }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rankGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    reversed={false}
                    label={{ value: "Rank Position", angle: -90, position: "insideLeft", fill: "#a1a1aa", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ color: "#a1a1aa" }}
                    formatter={(value) => [`#${Math.abs(value as number)}`, "Position"]}
                  />
                  <ReferenceLine y={-3} stroke="#34d399" strokeDasharray="4 4" label={{ value: "Top 3", fill: "#34d399", fontSize: 10, position: "right" }} />
                  <ReferenceLine y={-10} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: "Top 10", fill: "#fbbf24", fontSize: 10, position: "right" }} />
                  <Area type="monotone" dataKey="rank" stroke="#FF6B00" strokeWidth={2} fill="url(#rankGradient)" dot={{ r: 3, fill: "#FF6B00", stroke: "#09090b", strokeWidth: 1 }} activeDot={{ r: 5, fill: "#FF6B00", stroke: "#fff", strokeWidth: 1 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>All Scan Records</CardTitle>
            <CardDescription>Detailed position data for each scan date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {[...history].reverse().map((point) => (
                <div key={point.date} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-center">
                  <p className="text-xs text-zinc-500">{point.date}</p>
                  <p className={cn(
                    "text-lg font-bold mt-1",
                    point.rank <= 3 && "text-emerald-400",
                    point.rank > 3 && point.rank <= 5 && "text-green-400",
                    point.rank > 5 && point.rank <= 10 && "text-amber-400",
                    point.rank > 10 && point.rank <= 15 && "text-orange-400",
                    point.rank > 15 && "text-red-400",
                  )}>
                    #{point.rank}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
