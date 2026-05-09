"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  ArrowLeft, MapPin, TrendingUp, TrendingDown, Minus, Hash,
  Clock, Crosshair, ArrowUp, ArrowDown, Plus, Pencil, Trash2, Search, AlertCircle,
  ArrowUpDown, ArrowUpNarrowWide, ArrowDownNarrowWide, BarChart3, Upload, FileText
} from "lucide-react"
import { getRankColor, getRankLabel } from "@/services/rankings"
import { HVAC_KEYWORD_POOL } from "@/services/seo-scanner"
import { KeywordSparkline } from "@/components/keywords/keyword-sparkline"
import {
  getRankTrend, loadKeywordRankings, getAccountWithCity,
  loadKeywordList, saveKeywordList, editKeyword as editKeywordInStorage,
  getKeywordHistory,
  type KeywordRanking
} from "@/lib/keywords-storage"
import { APP_ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

function TrendBadge({ rank, rank7 }: { rank: number; rank7: number | null }) {
  const trend = getRankTrend(rank, rank7)
  if (trend === "new") return <Badge variant="default" className="text-[9px] h-4">New</Badge>
  if (trend === "up") return (
    <div className="flex items-center gap-1 text-emerald-400 text-xs">
      <ArrowUp className="h-3 w-3" />
      <span>+{rank7! - rank}</span>
    </div>
  )
  if (trend === "down") return (
    <div className="flex items-center gap-1 text-red-400 text-xs">
      <ArrowDown className="h-3 w-3" />
      <span>-{rank - rank7!}</span>
    </div>
  )
  return <Minus className="h-3.5 w-3.5 text-zinc-500" />
}

function RankCell({ rank, rank7daysAgo }: { rank: number; rank7daysAgo: number | null }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-10 h-8 rounded-md flex items-center justify-center text-sm font-bold", getRankColor(rank))}>
        {rank}
      </div>
      {rank7daysAgo != null && (
        <div className="text-[10px] text-zinc-600 leading-tight text-center">
          <div>7d ago</div>
          <div className="font-mono">{rank7daysAgo}</div>
        </div>
      )}
      <TrendBadge rank={rank} rank7={rank7daysAgo} />
    </div>
  )
}

export default function KeywordsPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const [rankings, setRankings] = useState<KeywordRanking[]>([])
  const [keywordList, setKeywordListState] = useState<string[]>([])
  const [accountName, setAccountName] = useState("")
  const [accountCity, setAccountCity] = useState("")
  const [lastScan, setLastScan] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingKeyword, setEditingKeyword] = useState("")
  const [newKeyword, setNewKeyword] = useState("")
  const [editValue, setEditValue] = useState("")
  const [keywordError, setKeywordError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [importedKeywords, setImportedKeywords] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"keyword" | "rank" | "change" | "status">("rank")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc")
    else { setSortBy(col); setSortDir(col === "rank" || col === "change" ? "asc" : "asc") }
  }

  const sortIcon = (col: typeof sortBy) => {
    if (sortBy !== col) return <ArrowUpDown className="h-3 w-3 ml-1 text-zinc-700" />
    return sortDir === "asc"
      ? <ArrowUpNarrowWide className="h-3 w-3 ml-1 text-[#FF6B00]" />
      : <ArrowDownNarrowWide className="h-3 w-3 ml-1 text-[#FF6B00]" />
  }

  const reload = () => {
    const stored = loadKeywordRankings(clientId)
    setRankings(stored)
    setKeywordListState(loadKeywordList(clientId))
    const meta = getAccountWithCity(clientId)
    setAccountName(meta.name)
    setAccountCity(meta.city)
    if (stored.length > 0) setLastScan(stored[0].scannedAt)
  }

  useEffect(reload, [clientId])

  const top3 = rankings.filter((r) => r.rank <= 3).length
  const top10 = rankings.filter((r) => r.rank <= 10).length
  const avgRank = rankings.length > 0 ? (rankings.reduce((s, r) => s + r.rank, 0) / rankings.length).toFixed(1) : "—"
  const improved = rankings.filter((r) => getRankTrend(r.rank, r.rank7daysAgo) === "up").length
  const declined = rankings.filter((r) => getRankTrend(r.rank, r.rank7daysAgo) === "down").length

  const rankedKeywords = new Set(rankings.map((r) => r.keyword))
  const missingKeywords = keywordList.filter((k) => !rankedKeywords.has(k))

  const handleAdd = () => {
    const kw = newKeyword.trim()
    if (!kw) {
      setKeywordError("Keyword cannot be empty")
      return
    }
    if (keywordList.includes(kw)) {
      setKeywordError("This keyword is already in the list")
      return
    }
    addKeywordToList(kw)
    setNewKeyword("")
    setKeywordError("")
    setAddOpen(false)
  }

  const handleEdit = () => {
    const kw = editValue.trim()
    if (!kw) {
      setKeywordError("Keyword cannot be empty")
      return
    }
    if (kw !== editingKeyword && keywordList.includes(kw)) {
      setKeywordError("This keyword is already in the list")
      return
    }
    editKeywordInStorage(clientId, editingKeyword, kw)
    reload()
    setEditOpen(false)
    setEditingKeyword("")
    setEditValue("")
    setKeywordError("")
  }

  const handleRemove = (keyword: string) => {
    const updated = keywordList.filter((k) => k !== keyword)
    saveKeywordList(clientId, updated)
    reload()
  }

  const addKeywordToList = (kw: string) => {
    const updated = [...keywordList, kw]
    saveKeywordList(clientId, updated)
    reload()
  }

  const handleImportFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setKeywordError("")

    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      let parsed: string[] = []

      if (file.name.endsWith(".csv")) {
        parsed = text
          .split(/\r?\n/)
          .filter((line) => line.trim())
          .flatMap((line) =>
            line.includes(",") ? line.split(",").map((s) => s.trim()) : [line.trim()]
          )
          .filter((kw) => kw.length > 0)
      } else {
        parsed = text
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      }

      const unique = [...new Set(parsed)]
      const existing = new Set(keywordList)
      const newKws = unique.filter((k) => !existing.has(k))

      if (newKws.length === 0) {
        setKeywordError("All keywords in the file are already in your list.")
        return
      }

      setImportedKeywords(newKws)
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const confirmImport = () => {
    for (const kw of importedKeywords) {
      addKeywordToList(kw)
    }
    setImportedKeywords([])
    setAddOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/accounts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <Link href={`/dashboard/accounts/${clientId}/keywords/overview`} className="hover:opacity-80 transition-opacity">
              <h1 className="text-2xl font-bold">Tracked Keywords</h1>
            </Link>
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
        <Button onClick={() => { setKeywordError(""); setNewKeyword(""); setAddOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Keyword
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <Link href={`/dashboard/accounts/${clientId}/keywords/overview`} className="block hover:border-[#FF6B00]/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                <Hash className="h-4 w-4 text-[#FF6B00]" />
                Keywords
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{keywordList.length || rankings.length}</p></CardContent>
          </Link>
        </Card>
        <Card>
          <Link href={`/dashboard/accounts/${clientId}/keywords/overview`} className="block hover:border-[#FF6B00]/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                <Crosshair className="h-4 w-4 text-[#FF6B00]" />
                Avg Rank
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">#{avgRank}</p></CardContent>
          </Link>
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Tracked Keywords</CardTitle>
            <CardDescription>
              {lastScan ? (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last scanned {new Date(lastScan).toLocaleString()}
                  {accountCity && (
                    <>
                      <span className="mx-1">·</span>
                      <MapPin className="h-3 w-3" />
                      {accountCity}
                    </>
                  )}
                  <span className="mx-1">·</span>
                  <span>{keywordList.length} keyword{keywordList.length !== 1 ? "s" : ""} tracked</span>
                </span>
              ) : "No scan data yet"}
            </CardDescription>
          </div>
          <div className="flex gap-3 text-[10px] text-zinc-600">
            <span className="flex items-center gap-1"><ArrowUp className="h-3 w-3 text-emerald-400" /> Improved</span>
            <span className="flex items-center gap-1"><ArrowDown className="h-3 w-3 text-red-400" /> Declined</span>
            <span className="flex items-center gap-1"><Minus className="h-3 w-3 text-zinc-500" /> Stable</span>
            <span className="flex items-center gap-1"><Badge variant="default" className="text-[9px] h-3">New</Badge> New</span>
          </div>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 && keywordList.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No keyword data yet.</p>
              <p className="text-xs mt-1">Scan your website to auto-detect HVAC keywords, or add keywords manually above.</p>
            </div>
          ) : (<>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Search keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-950 border-zinc-800"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button className="flex items-center gap-1 font-medium text-zinc-400 hover:text-zinc-200" onClick={() => toggleSort("keyword")}>
                      Keyword {sortIcon("keyword")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button className="flex items-center gap-1 font-medium text-zinc-400 hover:text-zinc-200" onClick={() => toggleSort("rank")}>
                      Current Position {sortIcon("rank")}
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px]">
                    <span className="text-zinc-400">Trend</span>
                  </TableHead>
                  <TableHead className="w-[100px]">
                    <button className="flex items-center gap-1 font-medium text-zinc-400 hover:text-zinc-200" onClick={() => toggleSort("change")}>
                      7-Day Change {sortIcon("change")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button className="flex items-center gap-1 font-medium text-zinc-400 hover:text-zinc-200" onClick={() => toggleSort("status")}>
                      Status {sortIcon("status")}
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...keywordList]
                  .filter((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase()))
                  .sort((a, b) => {
                    const ra = rankings.find((r) => r.keyword === a)
                    const rb = rankings.find((r) => r.keyword === b)
                    let cmp = 0
                    if (sortBy === "keyword") cmp = a.localeCompare(b)
                    else if (sortBy === "rank") cmp = (ra?.rank ?? 999) - (rb?.rank ?? 999)
                    else if (sortBy === "change") {
                      const ca = ra ? getRankTrend(ra.rank, ra.rank7daysAgo) : "new"
                      const cb = rb ? getRankTrend(rb.rank, rb.rank7daysAgo) : "new"
                      const order = ["up", "stable", "down", "new"]
                      cmp = order.indexOf(ca) - order.indexOf(cb)
                    }
                    else if (sortBy === "status") cmp = (ra?.rank ?? 999) - (rb?.rank ?? 999)
                    return sortDir === "asc" ? cmp : -cmp
                  })
                  .map((keyword) => {
                    const ranking = rankings.find((r) => r.keyword === keyword)
                    return (
                      <TableRow key={keyword}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Link
                              href={APP_ROUTES.KEYWORD_GRAPH(clientId, keyword)}
                              className="hover:text-[#FF6B00] transition-colors"
                            >
                              {keyword}
                            </Link>
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(accountCity ? `${keyword} ${accountCity}` : keyword)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-600 hover:text-[#FF6B00] transition-colors"
                              title="View on Google SERP"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          {ranking ? (
                            <RankCell rank={ranking.rank} rank7daysAgo={ranking.rank7daysAgo} />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">Pending</Badge>
                              <span className="text-[10px] text-zinc-600">Will scan on next run</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {ranking ? (
                            <KeywordSparkline history={getKeywordHistory(clientId, keyword).map((p) => ({ rank: p.rank }))} />
                          ) : (
                            <span className="text-xs text-zinc-600">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {ranking ? <TrendBadge rank={ranking.rank} rank7={ranking.rank7daysAgo} /> : <span className="text-xs text-zinc-600">—</span>}
                        </TableCell>
                        <TableCell>
                          {ranking ? (
                            <Badge variant={ranking.rank <= 3 ? "success" : ranking.rank <= 10 ? "default" : "secondary"}>
                              {getRankLabel(ranking.rank)}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not scanned</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Link href={APP_ROUTES.KEYWORD_GRAPH(clientId, keyword)}>
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="View full graph">
                                <BarChart3 className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingKeyword(keyword); setEditValue(keyword); setKeywordError(""); setEditOpen(true) }}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => handleRemove(keyword)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setImportedKeywords([]) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Keyword</DialogTitle>
            <DialogDescription>
              {importedKeywords.length > 0
                ? `${importedKeywords.length} keyword${importedKeywords.length > 1 ? "s" : ""} detected from file.`
                : "Type a keyword, pick from suggestions, or upload a file."}
            </DialogDescription>
          </DialogHeader>

          {importedKeywords.length > 0 ? (
            <div className="space-y-4">
              <div className="max-h-48 overflow-y-auto space-y-1">
                {importedKeywords.map((kw) => (
                  <div key={kw} className="flex items-center gap-2 text-sm bg-zinc-950 rounded px-3 py-1.5 border border-zinc-800">
                    <FileText className="h-3.5 w-3.5 text-[#FF6B00] shrink-0" />
                    <span>{kw}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={confirmImport}>
                  Import {importedKeywords.length} keyword{importedKeywords.length > 1 ? "s" : ""}
                </Button>
                <Button variant="outline" onClick={() => setImportedKeywords([])}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleAdd() }} className="space-y-4">
              {keywordError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {keywordError}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Keyword</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Commercial AC Repair"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    autoFocus
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">Add</Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-zinc-900 px-2 text-zinc-500">or import from file</span>
                </div>
              </div>

              <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-950 p-6 cursor-pointer hover:border-[#FF6B00]/50 hover:bg-zinc-900/50 transition-colors">
                <Upload className="h-6 w-6 text-zinc-500" />
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-400">Upload .txt or .csv file</p>
                  <p className="text-xs text-zinc-600 mt-0.5">One keyword per line in .txt, or comma-separated in .csv</p>
                </div>
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleImportFromFile}
                  className="hidden"
                />
              </label>

              <div className="border-t border-zinc-800 pt-3">
                <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1"><Search className="h-3 w-3" /> Suggested HVAC keywords</p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {HVAC_KEYWORD_POOL
                    .filter((kw) => !keywordList.includes(kw))
                    .slice(0, 20)
                    .map((kw) => (
                      <Badge
                        key={kw}
                        variant="outline"
                        className="cursor-pointer text-[10px] hover:border-[#FF6B00]/50 hover:text-[#FF6B00]"
                        onClick={() => { setNewKeyword(kw); setKeywordError("") }}
                      >
                        + {kw}
                      </Badge>
                    ))}
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Keyword</DialogTitle>
            <DialogDescription>Rename this tracked keyword.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleEdit() }} className="space-y-4">
            {keywordError && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {keywordError}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Keyword</label>
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Save</Button>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
