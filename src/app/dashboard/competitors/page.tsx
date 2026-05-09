"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { TrendChart, formatTraffic } from "@/components/competitors/trend-chart"
import { loadCompetitors, addCompetitor, removeCompetitor, getClientMetrics, type Competitor } from "@/lib/competitor-storage"
import {
  Building2, Globe, Search, Plus, Trash2, TrendingUp, TrendingDown,
  BarChart3, ExternalLink, Target, Eye, Star, Shield, Hash, Users, DollarSign,
  ArrowUp, ArrowDown, Minus, MapPin, Check, Loader2
} from "lucide-react"

const COLORS = ["#FF6B00", "#34d399", "#60a5fa", "#f472b6", "#fbbf24", "#a78bfa"]

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDomain, setNewDomain] = useState("")
  const [addError, setAddError] = useState("")
  const [predictions, setPredictions] = useState<any[]>([])
  const [selectedPlace, setSelectedPlace] = useState<{ placeId: string; name: string; address: string } | null>(null)
  const [client, setClient] = useState<{ name: string; metrics: ReturnType<typeof getClientMetrics> } | null>(null)

  useEffect(() => {
    setCompetitors(loadCompetitors())
    setSelectedId(null)
    const raw = localStorage.getItem("hvac-auth-user")
    if (raw) {
      const user = JSON.parse(raw)
      const all = JSON.parse(localStorage.getItem("hvac-managed-accounts") || "{}")
      const accounts = all[user.companySlug] || []
      const mainId = accounts.length > 0 ? accounts[0].id : "default"
      setClient({ name: user.companyName || "Your Company", metrics: getClientMetrics(mainId) })
    }
  }, [])

  const refresh = () => setCompetitors(loadCompetitors())
  const selected = competitors.find((c) => c.id === selectedId) || null

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    setAddError("")
    if (!newName.trim() || !newDomain.trim()) { setAddError("Name and domain are required"); return }
    if (competitors.some((c) => c.domain === newDomain.trim().toLowerCase())) { setAddError("This domain is already tracked"); return }
    addCompetitor(newName.trim(), newDomain.trim().toLowerCase())
    refresh()
    setNewName(""); setNewDomain(""); setAddOpen(false)
  }

  const handleRemove = (id: string) => {
    removeCompetitor(id)
    refresh()
    if (selectedId === id) setSelectedId(null)
  }

  const aggregate = {
    avgDA: client ? `You: ${client.metrics.da}` : "—",
    avgTraffic: client ? `You: ${formatTraffic(client.metrics.organicTraffic)}` : "—",
    totalKeywords: client ? `You: ${formatTraffic(client.metrics.totalKeywords)}` : "—",
    totalBacklinks: client ? `You: ${formatTraffic(client.metrics.backlinks)}` : "—",
  }

  const compsAvgDA = competitors.length ? Math.round(competitors.reduce((s, c) => s + c.da, 0) / competitors.length) : 0
  const compsAvgTraffic = competitors.length ? Math.round(competitors.reduce((s, c) => s + c.organicTraffic, 0) / competitors.length) : 0
  const compsTotalKeywords = competitors.length ? competitors.reduce((s, c) => s + c.totalKeywords, 0) : 0
  const compsTotalBacklinks = competitors.length ? competitors.reduce((s, c) => s + c.backlinks, 0) : 0

  const chartData = selected ? (() => {
    const dates = [...new Set(selected.history.map((h) => h.date))].sort()
    return dates.map((date) => {
      const p: Record<string, string | number> = { date }
      const hp = selected.history.find((h) => h.date === date)
      if (hp) { p.da = hp.da; p.traffic = hp.traffic; p.avgPos = hp.avgPosition * -1 }
      return p
    })
  })() : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Competitor Research</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Track, analyze, and compare SEO performance against industry competitors
          </p>
        </div>
        <Button onClick={() => { setAddError(""); setNewName(""); setNewDomain(""); setPredictions([]); setSelectedPlace(null); setAddOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" /> Add Competitor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#FF6B00]" />DA</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{aggregate.avgDA}</p>
            <p className="text-[10px] text-zinc-600">Comp avg: {compsAvgDA}</p>
          </CardContent>
        </Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-400" />Traffic</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{aggregate.avgTraffic}</p>
            <p className="text-[10px] text-zinc-600">Comp avg: {formatTraffic(compsAvgTraffic)}</p>
          </CardContent>
        </Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 flex items-center gap-2"><Hash className="h-4 w-4 text-amber-400" />Keywords</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{aggregate.totalKeywords}</p>
            <p className="text-[10px] text-zinc-600">Comp total: {compsTotalKeywords.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 flex items-center gap-2"><Shield className="h-4 w-4 text-blue-400" />Backlinks</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{aggregate.totalBacklinks}</p>
            <p className="text-[10px] text-zinc-600">Comp total: {compsTotalBacklinks.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-3">
          {client && (
            <div className="rounded-xl border border-[#FF6B00]/40 bg-[#FF6B00]/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/20 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-[#FF6B00]" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium truncate flex items-center gap-1">
                    {client.name}
                    <span className="text-[9px] bg-[#FF6B00]/20 text-[#FF6B00] px-1.5 py-0.5 rounded font-bold">YOU</span>
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate">Your Company</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div><span className="text-zinc-500">DA</span><p className="font-bold text-[#FF6B00]">{client.metrics.da}</p></div>
                <div><span className="text-zinc-500">Traffic</span><p className="font-bold text-emerald-400">{formatTraffic(client.metrics.organicTraffic)}</p></div>
                <div><span className="text-zinc-500">Keywords</span><p className="font-bold">{formatTraffic(client.metrics.totalKeywords)}</p></div>
                <div><span className="text-zinc-500">Backlinks</span><p className="font-bold">{formatTraffic(client.metrics.backlinks)}</p></div>
              </div>
            </div>
          )}
          {competitors.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={cn(
                "w-full text-left rounded-xl border p-4 transition-all",
                selectedId === c.id ? "border-[#FF6B00] bg-[#FF6B00]/5" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0" style={{ color: COLORS[i % COLORS.length] }}>
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{c.domain}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-red-400 hover:text-red-300" onClick={(e) => { e.stopPropagation(); handleRemove(c.id) }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div><span className="text-zinc-500">DA</span><p className="font-bold">{c.da}</p></div>
                <div><span className="text-zinc-500">Traffic</span><p className="font-bold">{formatTraffic(c.organicTraffic)}</p></div>
                <div><span className="text-zinc-500">Keywords</span><p className="font-bold">{formatTraffic(c.totalKeywords)}</p></div>
                <div><span className="text-zinc-500">Backlinks</span><p className="font-bold">{formatTraffic(c.backlinks)}</p></div>
              </div>
            </button>
          ))}
          {competitors.length === 0 && (
            <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No competitors tracked.</p>
              <p className="text-xs mt-1">Add your first competitor to start researching.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="h-full flex items-center justify-center border border-dashed border-zinc-800 rounded-xl py-24">
              <div className="text-center text-zinc-500">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Select a competitor to view detailed research</p>
                <p className="text-xs mt-1">Domain authority, keyword overlap, traffic estimates, and more</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="Domain Authority" value={selected.da.toString()} sub={`Out of 100`} color="text-[#FF6B00]" />
                <MetricCard label="Organic Traffic" value={formatTraffic(selected.organicTraffic)} sub={`${selected.totalKeywords.toLocaleString()} keywords`} color="text-emerald-400" />
                <MetricCard label="Traffic Value" value={`$${formatTraffic(selected.trafficValue)}`} sub="Estimated monthly value" color="text-amber-400" />
                <MetricCard label="Avg Position" value={`#${selected.avgPosition.toFixed(1)}`} sub={`${selected.visibility.toFixed(0)}% visibility`} color="text-blue-400" />
                <MetricCard label="Backlinks" value={formatTraffic(selected.backlinks)} sub={`${selected.referringDomains.toLocaleString()} domains`} color="text-purple-400" />
                <MetricCard label="GMB Rating" value={selected.gmbRating.toFixed(1)} sub={`${selected.gmbReviews.toLocaleString()} reviews`} color="text-amber-400" icon={<Star className="h-3 w-3 fill-amber-400" />} />
                <MetricCard label="Keyword Overlap" value={`${selected.keywordOverlap.filter((o) => Math.abs(o.diff) <= 3).length}`} sub="Shared keywords" color="text-emerald-400" />
                <MetricCard label="Winning Gaps" value={selected.keywordOverlap.filter((o) => o.diff > 0).length.toString()} sub="They rank ahead" color="text-red-400" />
              </div>

              <Card>
                <CardHeader><CardTitle>Historical Trends</CardTitle><CardDescription>Domain authority, traffic, and average position over the last 60 days</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-zinc-500 mb-2">Domain Authority</p>
                    <TrendChart data={chartData} series={[{ key: "da", name: selected.name, color: COLORS[0] }]} yLabel="DA" domain={[0, 100]} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-zinc-500 mb-2">Organic Traffic</p>
                      <TrendChart data={chartData} series={[{ key: "traffic", name: selected.name, color: "#34d399" }]} yLabel="Traffic" domain={[0, "auto"]} yFormat={(v: any) => formatTraffic(v)} />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-2">Avg. Position <span className="text-zinc-700">(lower is better)</span></p>
                      <TrendChart data={chartData} series={[{ key: "avgPos", name: selected.name, color: "#60a5fa" }]} yLabel="Rank" domain={[-18, 0]} yFormat={(v) => `#${Math.abs(v)}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2"><Target className="h-4 w-4 text-[#FF6B00]" /> Keyword Gap Analysis</CardTitle>
                      <CardDescription>Where they rank vs. where you rank for shared HVAC keywords</CardDescription>
                    </div>
                    <div className="flex gap-2 text-[10px] text-zinc-600">
                      <span className="flex items-center gap-1 text-emerald-400"><ArrowUp className="h-3 w-3" /> We Win</span>
                      <span className="flex items-center gap-1 text-red-400"><ArrowDown className="h-3 w-3" /> They Win</span>
                      <span className="flex items-center gap-1 text-zinc-500"><Minus className="h-3 w-3" /> Tie</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead className="text-center w-[80px]">Our Rank</TableHead>
                        <TableHead className="text-center w-[80px]">Their Rank</TableHead>
                        <TableHead className="text-center w-[60px]">Gap</TableHead>
                        <TableHead className="text-center w-[80px]">Volume</TableHead>
                        <TableHead className="w-[70px]">Winner</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selected.keywordOverlap
                        .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
                        .map((o) => {
                          const winner = o.diff > 0 ? "us" : o.diff < 0 ? "them" : "tie"
                          return (
                            <TableRow key={o.keyword}>
                              <TableCell className="font-medium text-sm">{o.keyword}</TableCell>
                              <TableCell className="text-center"><RankBadge rank={o.ourRank} /></TableCell>
                              <TableCell className="text-center"><RankBadge rank={o.theirRank} /></TableCell>
                              <TableCell className="text-center">
                                <span className={cn("font-mono text-xs font-bold", o.diff > 0 ? "text-red-400" : o.diff < 0 ? "text-emerald-400" : "text-zinc-600")}>
                                  {o.diff > 0 ? `+${o.diff}` : o.diff < 0 ? o.diff : "0"}
                                </span>
                              </TableCell>
                              <TableCell className="text-center text-xs text-zinc-400">{o.volume.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant={winner === "us" ? "success" : winner === "them" ? "destructive" : "outline"} className="text-[9px]">
                                  {winner === "us" ? "You" : winner === "them" ? "Them" : "Tie"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-4 w-4 text-[#FF6B00]" /> Top Performing Pages</CardTitle><CardDescription>Highest traffic pages on {selected.domain}</CardDescription></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead className="text-center w-[100px]">Est. Traffic</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selected.topPages.map((p) => (
                        <TableRow key={p.url}>
                          <TableCell>
                            <p className="text-sm font-medium truncate max-w-[300px]">{p.title}</p>
                            <p className="text-[10px] text-zinc-600 truncate max-w-[300px]">{p.url}</p>
                          </TableCell>
                          <TableCell className="text-center text-sm">{formatTraffic(p.traffic)}</TableCell>
                          <TableCell>
                            <a href={p.url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5" /></Button>
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) { setPredictions([]); setSelectedPlace(null) } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Competitor</DialogTitle><DialogDescription>Search for their business on Google Maps, or enter the details manually.</DialogDescription></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            {addError && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{addError}</div>}

            <div className="relative">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2 mb-2">
                <MapPin className="h-3.5 w-3.5 text-[#FF6B00]" />
                Google Maps Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  placeholder="Search for a business on Google Maps..."
                  value={newName}
                  onChange={async (e) => {
                    setNewName(e.target.value)
                    if (e.target.value.length < 3) { setPredictions([]); return }
                    try {
                      const res = await fetch(`/api/scanner/place-autocomplete?input=${encodeURIComponent(e.target.value)}`)
                      const d = await res.json()
                      setPredictions(d.predictions || [])
                    } catch { setPredictions([]) }
                  }}
                  className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-800 pl-9 pr-3 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF6B00]"
                />
              </div>
              {predictions.length > 0 && !selectedPlace && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl max-h-48 overflow-y-auto">
                  {predictions.map((p: any, i: number) => (
                    <button key={p.placeId} type="button"
                      className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-0"
                      onClick={() => {
                        setSelectedPlace({ placeId: p.placeId, name: p.mainText, address: p.secondaryText })
                        setNewName(p.description)
                        setNewDomain(p.mainText.toLowerCase().replace(/\s+/g, "") + ".com")
                        setPredictions([])
                      }}>
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-zinc-500" />
                      <div>
                        <p className="text-sm font-medium">{p.mainText}</p>
                        <p className="text-xs text-zinc-500">{p.secondaryText}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {selectedPlace && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-emerald-400 truncate">{selectedPlace.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{selectedPlace.address}</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => { setSelectedPlace(null); setNewName(""); setNewDomain(""); setPredictions([]) }}>
                    Change
                  </Button>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-800" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-zinc-900 px-2 text-zinc-500">or enter manually</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Company Name</label>
                <Input placeholder="Pro HVAC Group" value={selectedPlace ? selectedPlace.name : newName} onChange={(e) => setNewName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Domain</label>
                <Input placeholder="prohvacgroup.com" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" className="w-full"><Search className="h-4 w-4 mr-2" /> Research Competitor</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MetricCard({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-[10px] text-zinc-500 flex items-center gap-1">{icon}{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={cn("text-lg font-bold", color)}>{value}</p>
        <p className="text-[9px] text-zinc-600 mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const color = rank <= 3 ? "text-emerald-400" : rank <= 10 ? "text-amber-400" : "text-red-400"
  return <span className={cn("font-bold text-sm tabular-nums", color)}>#{rank}</span>
}
