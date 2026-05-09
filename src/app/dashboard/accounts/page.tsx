"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { scanWebsite } from "@/services/seo-scanner"
import { scanGoogleReviews } from "@/services/reviews-scanner"
import { saveKeywordRankings, loadKeywordList, saveKeywordList } from "@/lib/keywords-storage"
import { saveReviews } from "@/lib/reviews-storage"
import { APP_ROUTES } from "@/lib/constants"
import { useAuth } from "@/components/auth/auth-context"
import { PlacePicker, type PlaceSelection } from "@/components/accounts/place-picker"
import {
  Eye, Plus, Building2, MapPin, Star, TrendingUp, Trash2,
  ScanSearch, Pencil, RefreshCw, CheckCircle2, AlertCircle
} from "lucide-react"

interface ManagedAccount {
  id: string
  name: string
  slug: string
  website: string
  phone: string
  city: string
  placeId: string
  googlePlaceName: string
  googlePlaceAddress: string
  avgMapPackRank: number | null
  reviewScore: number | null
  monthlyLeadCount: number | null
  lastScannedAt: string | null
  addedAt: string
}

interface ScanningState {
  [accountId: string]: "idle" | "scanning" | "done" | "error"
}

const ACCOUNTS_KEY = "hvac-managed-accounts"

function loadAccounts(companySlug: string): ManagedAccount[] {
  const all = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}")
  return all[companySlug] || []
}

function saveAccounts(companySlug: string, accounts: ManagedAccount[]) {
  const all = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}")
  all[companySlug] = accounts
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(all))
}

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

export default function AccountsPage() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<ManagedAccount[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", website: "", phone: "", city: "" })
  const [place, setPlace] = useState<PlaceSelection>({ placeId: "", name: "", address: "" })
  const [formError, setFormError] = useState("")
  const [scanning, setScanning] = useState<ScanningState>({})
  const [scanResult, setScanResult] = useState<{ id: string; rank: number; reviews: number; leads: number } | null>(null)

  const persist = useCallback((updated: ManagedAccount[]) => {
    setAccounts(updated)
    if (user) saveAccounts(user.companySlug, updated)
  }, [user])

  useEffect(() => {
    if (user) setAccounts(loadAccounts(user.companySlug))
  }, [user])

  if (!user) return null

  const handleDelete = (id: string) => {
    persist(accounts.filter((a) => a.id !== id))
  }

  const resetForm = () => {
    setForm({ name: "", website: "", phone: "", city: "" })
    setPlace({ placeId: "", name: "", address: "" })
    setFormError("")
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    if (!form.name.trim()) {
      setFormError("Company name is required")
      return
    }
    const newAccount: ManagedAccount = {
      id: generateId(),
      name: form.name.trim(),
      slug: form.name.trim().toLowerCase().replace(/\s+/g, "-"),
      website: form.website.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      placeId: place.placeId,
      googlePlaceName: place.name,
      googlePlaceAddress: place.address,
      avgMapPackRank: null,
      reviewScore: null,
      monthlyLeadCount: null,
      lastScannedAt: null,
      addedAt: new Date().toISOString(),
    }
    persist([...accounts, newAccount])
    resetForm()
    setAddOpen(false)
  }

  const openEdit = (account: ManagedAccount) => {
    setEditingId(account.id)
    setForm({ name: account.name, website: account.website, phone: account.phone, city: account.city })
    setPlace({ placeId: account.placeId, name: account.googlePlaceName, address: account.googlePlaceAddress })
    setFormError("")
    setEditOpen(true)
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    if (!form.name.trim()) {
      setFormError("Company name is required")
      return
    }
    const updated = accounts.map((a) =>
      a.id === editingId
        ? { ...a, name: form.name.trim(), slug: form.name.trim().toLowerCase().replace(/\s+/g, "-"), website: form.website.trim(), phone: form.phone.trim(), city: form.city.trim(), placeId: place.placeId, googlePlaceName: place.name, googlePlaceAddress: place.address }
        : a
    )
    persist(updated)
    setEditOpen(false)
    setEditingId(null)
    resetForm()
  }

  const handleScan = async (account: ManagedAccount) => {
    if (!account.placeId) {
      setScanning((prev) => ({ ...prev, [account.id]: "error" }))
      setTimeout(() => setScanning((prev) => ({ ...prev, [account.id]: "idle" })), 3000)
      return
    }

    setScanning((prev) => ({ ...prev, [account.id]: "scanning" }))
    setScanResult(null)

    try {
      const existingList = loadKeywordList(account.id)
      const [result, reviewResult] = await Promise.all([
        scanWebsite(account.name, account.website || "", account.city, existingList.length > 0 ? existingList : undefined),
        scanGoogleReviews(account.name, account.city, account.placeId),
      ])

      if (existingList.length === 0) {
        saveKeywordList(account.id, result.keywordRanks.map((kr) => kr.keyword))
      }

      saveReviews(account.id, reviewResult)

      setScanResult({ id: account.id, rank: result.avgMapPackRank, reviews: reviewResult.overallRating, leads: result.monthlyLeadCount })
      setScanning((prev) => ({ ...prev, [account.id]: "done" }))

      const updated = accounts.map((a) =>
        a.id === account.id
          ? { ...a, avgMapPackRank: result.avgMapPackRank, reviewScore: reviewResult.overallRating, monthlyLeadCount: result.monthlyLeadCount, lastScannedAt: result.scannedAt }
          : a
      )
      persist(updated)

      const rankings = result.keywordRanks.map((kr) => ({
        keyword: kr.keyword,
        rank: kr.rank,
        previousRank: null,
        scannedAt: result.scannedAt,
      }))
      saveKeywordRankings(account.id, rankings, account.city)

      setTimeout(() => setScanning((prev) => ({ ...prev, [account.id]: "idle" })), 2000)
    } catch {
      setScanning((prev) => ({ ...prev, [account.id]: "error" }))
      setTimeout(() => setScanning((prev) => ({ ...prev, [account.id]: "idle" })), 3000)
    }
  }

  const totalLeads = accounts.reduce((s, a) => s + (a.monthlyLeadCount ?? 0), 0)
  const scannedCount = accounts.filter((a) => a.lastScannedAt).length
  const linkedCount = accounts.filter((a) => a.placeId).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Accounts</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {user.companyName} &mdash; {accounts.length} location{accounts.length !== 1 ? "s" : ""}
            {linkedCount > 0 && ` (${linkedCount} linked to Google Maps)`}
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Your Company</DialogTitle>
              <DialogDescription>Search for your Google Maps listing, then fill in the details.</DialogDescription>
            </DialogHeader>
            <AddEditForm form={form} setForm={setForm} formError={formError} onSubmit={handleAdd} submitLabel="Add Company" place={place} onPlaceChange={setPlace} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#FF6B00]" />
              Companies
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{accounts.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#FF6B00]" />
              Avg Map Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {scannedCount > 0
                ? `#${(accounts.reduce((s, a) => s + (a.avgMapPackRank ?? 0), 0) / scannedCount).toFixed(1)}`
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              Avg Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {scannedCount > 0
                ? (accounts.reduce((s, a) => s + (a.reviewScore ?? 0), 0) / scannedCount).toFixed(1)
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Total Leads/mo
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalLeads || "—"}</p></CardContent>
        </Card>
      </div>

      <EditDialog
        open={editOpen}
        onOpenChange={(o) => { setEditOpen(o); if (!o) resetForm() }}
        form={form}
        setForm={setForm}
        formError={formError}
        onSubmit={handleEdit}
        place={place}
        onPlaceChange={setPlace}
      />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Google Maps</TableHead>
              <TableHead className="w-[90px]"><div className="flex items-center gap-1"><MapPin className="h-3 w-3" />Rank</div></TableHead>
              <TableHead className="w-[90px]"><div className="flex items-center gap-1"><Star className="h-3 w-3" />Reviews</div></TableHead>
              <TableHead className="w-[90px]"><div className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />Leads</div></TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="text-right w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No companies added yet.</p>
                  <p className="text-xs mt-1">Click &quot;Add Company&quot; and search for your Google Maps listing to get started.</p>
                </TableCell>
              </TableRow>
            )}
            {accounts.map((account) => {
              const scanStatus = scanning[account.id] || "idle"
              return (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    <div>{account.name}</div>
                    {account.city && <div className="text-xs text-zinc-500">{account.city}</div>}
                  </TableCell>
                  <TableCell>
                    {account.placeId ? (
                      <Badge variant="success" className="text-[9px] gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Linked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px]">No link</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.avgMapPackRank != null ? (
                      <Badge variant={account.avgMapPackRank <= 3 ? "success" : account.avgMapPackRank <= 5 ? "default" : "secondary"}>
                        #{account.avgMapPackRank}
                      </Badge>
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.reviewScore != null ? (
                      <span className={`font-semibold ${account.reviewScore >= 4.5 ? "text-emerald-400" : account.reviewScore >= 4.0 ? "text-amber-400" : "text-red-400"}`}>
                        {account.reviewScore.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.monthlyLeadCount != null ? (
                      <span className="font-semibold">{account.monthlyLeadCount.toLocaleString()}</span>
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.lastScannedAt ? (
                      <Badge variant="success" className="text-[10px]">Scanned</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Not scanned</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant={scanStatus === "scanning" ? "secondary" : scanStatus === "done" ? "default" : scanStatus === "error" ? "destructive" : "outline"}
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        disabled={scanStatus === "scanning" || !account.placeId}
                        onClick={() => handleScan(account)}
                        title={!account.placeId ? "Link a Google Maps listing first" : "Scan now"}
                      >
                        {scanStatus === "scanning" ? (
                          <><RefreshCw className="h-3 w-3 animate-spin" /> Scanning</>
                        ) : scanStatus === "done" ? (
                          <><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Scanned</>
                        ) : scanStatus === "error" ? (
                          <><AlertCircle className="h-3 w-3" /> Error</>
                        ) : (
                          <><ScanSearch className="h-3 w-3" /> Scan</>
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(account)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Link href={APP_ROUTES.REVIEWS_CLIENT(account.id)}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => handleDelete(account.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function AddEditForm({
  form, setForm, formError, onSubmit, submitLabel, place, onPlaceChange
}: {
  form: { name: string; website: string; phone: string; city: string }
  setForm: React.Dispatch<React.SetStateAction<{ name: string; website: string; phone: string; city: string }>>
  formError: string
  onSubmit: (e: React.FormEvent) => void
  submitLabel: string
  place: PlaceSelection
  onPlaceChange: (p: PlaceSelection) => void
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {formError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {formError}
        </div>
      )}

      <PlacePicker onSelect={onPlaceChange} initialValue={place.placeId ? `${place.name}, ${place.address}` : ""} />

      {place.placeId && (
        <>
          <div className="border-t border-zinc-800 pt-3 space-y-3">
            <p className="text-xs text-zinc-500">Company Details</p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Company Name *</label>
              <Input placeholder="e.g. Premier HVAC Solutions" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Website</label>
              <Input placeholder="https://premierhvac.com" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Phone</label>
                <Input placeholder="(555) 123-4567" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">City</label>
                <Input placeholder="Chicago, IL" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full">{submitLabel}</Button>
        </>
      )}

      {!place.placeId && (
        <p className="text-xs text-zinc-600 text-center pt-2">
          Search and select your Google Maps listing above first.
        </p>
      )}
    </form>
  )
}

function EditDialog({
  open, onOpenChange, form, setForm, formError, onSubmit, place, onPlaceChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: { name: string; website: string; phone: string; city: string }
  setForm: React.Dispatch<React.SetStateAction<{ name: string; website: string; phone: string; city: string }>>
  formError: string
  onSubmit: (e: React.FormEvent) => void
  place: PlaceSelection
  onPlaceChange: (p: PlaceSelection) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>Update your Google Maps link and company details.</DialogDescription>
        </DialogHeader>
        <AddEditForm form={form} setForm={setForm} formError={formError} onSubmit={onSubmit} submitLabel="Save Changes" place={place} onPlaceChange={onPlaceChange} />
      </DialogContent>
    </Dialog>
  )
}
