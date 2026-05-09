"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Hash, ExternalLink, TrendingUp, MapPin, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { getRankColor, getRankLabel } from "@/services/rankings"
import { getAllKeywordRankings, getRankTrend, type KeywordRanking } from "@/lib/keywords-storage"
import { APP_ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

export default function GlobalKeywordsPage() {
  const [data, setData] = useState<{
    accountId: string
    accountName: string
    city: string
    rankings: KeywordRanking[]
  }[]>([])

  useEffect(() => {
    setData(getAllKeywordRankings())

    const handler = () => setData(getAllKeywordRankings())
    window.addEventListener("storage", handler)
    window.addEventListener("focus", handler)
    return () => {
      window.removeEventListener("storage", handler)
      window.removeEventListener("focus", handler)
    }
  }, [])

  const allKeywords = data.flatMap((d) => d.rankings)
  const totalKeywords = allKeywords.length
  const top3 = allKeywords.filter((r) => r.rank <= 3).length
  const top10 = allKeywords.filter((r) => r.rank <= 10).length
  const avgRank = totalKeywords > 0
    ? (allKeywords.reduce((s, r) => s + r.rank, 0) / totalKeywords).toFixed(1)
    : "—"
  const improved = allKeywords.filter((r) => getRankTrend(r.rank, r.rank7daysAgo) === "up").length
  const declined = allKeywords.filter((r) => getRankTrend(r.rank, r.rank7daysAgo) === "down").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tracked Keywords</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Keyword rankings across all scanned accounts
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <Hash className="h-4 w-4 text-[#FF6B00]" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalKeywords}</p></CardContent>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <Hash className="h-4 w-4 text-blue-400" />
              Avg Rank
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">#{avgRank}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-emerald-400" />
              Improved (7d)
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-400">+{improved}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-red-400" />
              Declined (7d)
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-400">{declined}</p></CardContent>
        </Card>
      </div>

      {data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-zinc-500">
            <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No keyword data.</p>
            <p className="text-xs mt-1">Add and scan companies to start tracking keywords.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((entry) => {
            const eImproved = entry.rankings.filter((r) => getRankTrend(r.rank, r.rank7daysAgo) === "up").length
            const eDeclined = entry.rankings.filter((r) => getRankTrend(r.rank, r.rank7daysAgo) === "down").length
            const eAvg = entry.rankings.length > 0
              ? (entry.rankings.reduce((s, r) => s + r.rank, 0) / entry.rankings.length).toFixed(1)
              : "—"

            return (
              <Card key={entry.accountId}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {entry.accountName}
                      {entry.city && (
                        <span className="text-xs font-normal text-zinc-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {entry.city}
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {entry.rankings.length} keywords · Avg #{eAvg}
                      <span className="mx-2">·</span>
                      <span className="text-emerald-400">+{eImproved}</span>
                      <span className="mx-1">/</span>
                      <span className="text-red-400">{eDeclined}</span>
                      <span className="ml-1 text-zinc-600">(7d)</span>
                    </CardDescription>
                  </div>
                  <Link href={APP_ROUTES.KEYWORDS_CLIENT(entry.accountId)}>
                    <Button variant="ghost" size="sm" className="text-xs gap-1">
                      View all <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead className="w-[100px]">7d Change</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entry.rankings
                        .sort((a, b) => a.rank - b.rank)
                        .slice(0, 10)
                        .map((r) => {
                          const trend = getRankTrend(r.rank, r.rank7daysAgo)
                          return (
                            <TableRow key={r.keyword}>
                              <TableCell className="font-medium text-sm">{r.keyword}</TableCell>
                              <TableCell>
                                <div className={cn("w-8 h-6 rounded text-xs font-bold flex items-center justify-center", getRankColor(r.rank))}>
                                  {r.rank}
                                </div>
                              </TableCell>
                              <TableCell>
                                {trend === "new" ? (
                                  <Badge variant="default" className="text-[9px]">New</Badge>
                                ) : trend === "up" ? (
                                  <span className="text-emerald-400 text-xs flex items-center gap-1">
                                    <ArrowUp className="h-3 w-3" />+{r.rank7daysAgo! - r.rank}
                                  </span>
                                ) : trend === "down" ? (
                                  <span className="text-red-400 text-xs flex items-center gap-1">
                                    <ArrowDown className="h-3 w-3" />-{r.rank - r.rank7daysAgo!}
                                  </span>
                                ) : (
                                  <Minus className="h-3 w-3 text-zinc-500" />
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={r.rank <= 3 ? "success" : r.rank <= 10 ? "default" : "secondary"} className="text-[10px]">
                                  {getRankLabel(r.rank)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      {entry.rankings.length > 10 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-xs text-zinc-500">
                            +{entry.rankings.length - 10} more keywords
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
