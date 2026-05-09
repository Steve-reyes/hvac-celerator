"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, TrendingUp, TrendingDown, Minus, Clock, DollarSign, Target, Hash, Sparkles } from "lucide-react"
import {
  searchKeywords, saveSearchHistory, loadSearchHistory,
  getDifficultyColor, getVolumeLabel, getOpportunityScore,
  type KeywordIdea
} from "@/lib/keyword-research-storage"
import { cn } from "@/lib/utils"

export default function KeywordResearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<KeywordIdea[]>([])
  const [searched, setSearched] = useState(false)
  const [searching, setSearching] = useState(false)
  const [history, setHistory] = useState<{ seedKeyword: string; searchedAt: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHistory(loadSearchHistory().map((r) => ({ seedKeyword: r.seedKeyword, searchedAt: r.searchedAt })))
  }, [])

  const handleSearch = useCallback(() => {
    if (!query.trim()) return
    setSearching(true)
    setTimeout(() => {
      const ideas = searchKeywords(query)
      setResults(ideas)
      setSearched(true)
      setSearching(false)
      saveSearchHistory(query, ideas)
      setHistory(loadSearchHistory().map((r) => ({ seedKeyword: r.seedKeyword, searchedAt: r.searchedAt })))
    }, 400)
  }, [query])

  const avgVol = results.length ? Math.round(results.reduce((s, r) => s + r.volume, 0) / results.length) : 0
  const avgDiff = results.length ? Math.round(results.reduce((s, r) => s + r.difficulty, 0) / results.length) : 0
  const easyWins = results.filter((r) => r.difficulty < 40 && r.volume > 500).length
  const highVolume = results.filter((r) => r.volume >= 2000).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Keyword Research</h1>
        <p className="text-sm text-zinc-400 mt-1">Discover HVAC keyword opportunities with volume, difficulty, and trend data</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Search Keywords</CardTitle>
              <CardDescription>Enter a seed keyword to discover related HVAC terms</CardDescription>
            </div>
            {history.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                <Clock className="h-3 w-3" />
                Recent: {history.slice(0, 4).map((h, i) => (
                  <span key={h.seedKeyword}>
                    {i > 0 && <span className="text-zinc-700">, </span>}
                    <button className="hover:text-zinc-400 underline underline-offset-2" onClick={() => { setQuery(h.seedKeyword); inputRef.current?.focus() }}>
                      {h.seedKeyword}
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                ref={inputRef}
                placeholder="e.g. ac repair, hvac installation, furnace..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={searching || !query.trim()}>
              {searching ? "Searching..." : "Research"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 flex items-center gap-1"><Hash className="h-3.5 w-3.5 text-[#FF6B00]" />Keywords</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{results.length}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 flex items-center gap-1"><Target className="h-3.5 w-3.5 text-amber-400" />Avg Difficulty</CardTitle></CardHeader><CardContent><p className={cn("text-2xl font-bold", getDifficultyColor(avgDiff))}>{avgDiff}%</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-emerald-400" />Easy Wins</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-emerald-400">{easyWins}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-blue-400" />High Vol.</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{highVolume}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Results for &quot;{query}&quot;</CardTitle>
                <div className="flex gap-2 text-[10px] text-zinc-600">
                  <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-400" /> Rising</span>
                  <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-red-400" /> Declining</span>
                  <span className="flex items-center gap-1"><Minus className="h-3 w-3 text-zinc-500" /> Stable</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead className="text-center w-[90px]">Volume</TableHead>
                    <TableHead className="text-center w-[90px]">Difficulty</TableHead>
                    <TableHead className="text-center w-[70px]">CPC</TableHead>
                    <TableHead className="text-center w-[80px]">Trend</TableHead>
                    <TableHead className="text-center w-[80px]">Intent</TableHead>
                    <TableHead className="text-center w-[80px]">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results
                    .sort((a, b) => getOpportunityScore(b.difficulty, b.volume) - getOpportunityScore(a.difficulty, a.volume))
                    .map((kw) => (
                      <TableRow key={kw.keyword}>
                        <TableCell className="font-medium text-sm">{kw.keyword}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold">{kw.volume.toLocaleString()}</span>
                          <p className="text-[9px] text-zinc-600">{getVolumeLabel(kw.volume)}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                              <div className={cn("h-full rounded-full", kw.difficulty >= 70 ? "bg-red-500" : kw.difficulty >= 40 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${kw.difficulty}%` }} />
                            </div>
                            <span className={cn("text-xs font-bold mt-0.5", getDifficultyColor(kw.difficulty))}>{kw.difficulty}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm">${kw.cpc.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          {kw.trend === "up" && <TrendingUp className="h-4 w-4 text-emerald-400 mx-auto" />}
                          {kw.trend === "down" && <TrendingDown className="h-4 w-4 text-red-400 mx-auto" />}
                          {kw.trend === "stable" && <Minus className="h-4 w-4 text-zinc-500 mx-auto" />}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-[9px]">{kw.intent}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn("font-bold text-sm", getOpportunityScore(kw.difficulty, kw.volume) >= 50 ? "text-emerald-400" : getOpportunityScore(kw.difficulty, kw.volume) >= 25 ? "text-amber-400" : "text-zinc-500")}>
                            {getOpportunityScore(kw.difficulty, kw.volume)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {!searched && (
        <Card>
          <CardContent className="py-16 text-center text-zinc-500">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Enter a seed keyword above to discover HVAC keyword opportunities</p>
            <p className="text-xs mt-1">Try "ac repair", "hvac installation", or "boiler service"</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}