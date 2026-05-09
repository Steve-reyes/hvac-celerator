const KEYWORDS_KEY = "hvac-keyword-rankings"
const HISTORY_KEY = "hvac-keyword-history"
const KEYWORD_LIST_KEY = "hvac-keyword-lists"

export interface KeywordRanking {
  keyword: string
  rank: number
  previousRank: number | null
  rank7daysAgo: number | null
  scannedAt: string
  city: string
}

export interface ScanSnapshot {
  date: string
  keywordRanks: { keyword: string; rank: number }[]
  scannedAt: string
  city: string
}

export function loadKeywordRankings(accountId: string): KeywordRanking[] {
  if (typeof window === "undefined") return []

  const current = loadCurrentRankings(accountId)
  const history = loadHistory(accountId)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const cutoff = sevenDaysAgo.toISOString().split("T")[0]

  const historicalMap = new Map<string, number>()
  for (const snap of history) {
    if (snap.date >= cutoff) continue
    for (const kr of snap.keywordRanks) {
      if (!historicalMap.has(kr.keyword)) {
        historicalMap.set(kr.keyword, kr.rank)
      }
    }
  }

  const latestScanned = current.length > 0 ? current[0].scannedAt : ""
  const accountMeta = getAccountMeta(accountId)

  return current.map((r) => ({
    ...r,
    rank7daysAgo: historicalMap.get(r.keyword) ?? null,
    scannedAt: latestScanned,
    city: accountMeta.city,
  }))
}

function loadCurrentRankings(accountId: string): { keyword: string; rank: number; previousRank: number | null; scannedAt: string }[] {
  const all = JSON.parse(localStorage.getItem(KEYWORDS_KEY) || "{}")
  return all[accountId] || []
}

function loadHistory(accountId: string): ScanSnapshot[] {
  const all = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}")
  return all[accountId] || []
}

function saveHistory(accountId: string, history: ScanSnapshot[]) {
  const all = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}")
  all[accountId] = history
  localStorage.setItem(HISTORY_KEY, JSON.stringify(all))
}

function getAccountMeta(accountId: string): { name: string; city: string } {
  const raw = localStorage.getItem("hvac-auth-user")
  if (!raw) return { name: "", city: "" }
  const user = JSON.parse(raw)
  const all = JSON.parse(localStorage.getItem("hvac-managed-accounts") || "{}")
  const accounts = all[user.companySlug] || []
  const account = accounts.find((a: { id: string }) => a.id === accountId)
  return { name: account?.name || "", city: account?.city || "" }
}

export function saveKeywordRankings(
  accountId: string,
  rankings: { keyword: string; rank: number; previousRank: number | null; scannedAt: string }[],
  city: string
) {
  const all = JSON.parse(localStorage.getItem(KEYWORDS_KEY) || "{}")
  all[accountId] = rankings
  localStorage.setItem(KEYWORDS_KEY, JSON.stringify(all))

  const today = new Date().toISOString().split("T")[0]
  const history = loadHistory(accountId)

  const existingToday = history.findIndex((s) => s.date === today)
  const snapshot: ScanSnapshot = {
    date: today,
    keywordRanks: rankings.map((r) => ({ keyword: r.keyword, rank: r.rank })),
    scannedAt: rankings[0]?.scannedAt || new Date().toISOString(),
    city,
  }

  if (existingToday >= 0) {
    history[existingToday] = snapshot
  } else {
    history.push(snapshot)
  }

  saveHistory(accountId, history)
}

export function getAccountWithCity(accountId: string): { name: string; city: string } {
  return getAccountMeta(accountId)
}

export function getAllKeywordRankings(): {
  accountId: string
  accountName: string
  city: string
  rankings: KeywordRanking[]
}[] {
  if (typeof window === "undefined") return []
  const user = JSON.parse(localStorage.getItem("hvac-auth-user") || "null")
  if (!user) return []

  const accounts = JSON.parse(localStorage.getItem("hvac-managed-accounts") || "{}")
  const userAccounts = accounts[user.companySlug] || []

  return userAccounts
    .filter((a: { id: string }) => {
      const stored = JSON.parse(localStorage.getItem(KEYWORDS_KEY) || "{}")
      return stored[a.id]
    })
    .map((a: { id: string; name: string; city: string }) => ({
      accountId: a.id,
      accountName: a.name,
      city: a.city,
      rankings: loadKeywordRankings(a.id),
    }))
}

export function getRankTrend(rank: number, rank7daysAgo: number | null): "up" | "down" | "stable" | "new" {
  if (rank7daysAgo === null) return "new"
  if (rank < rank7daysAgo) return "up"
  if (rank > rank7daysAgo) return "down"
  return "stable"
}

export interface KeywordHistoryPoint {
  date: string
  rank: number
}

export function getKeywordHistory(accountId: string, keyword: string): KeywordHistoryPoint[] {
  if (typeof window === "undefined") return []
  const history = loadHistory(accountId)
  const points: KeywordHistoryPoint[] = []
  for (const snap of history) {
    const kr = snap.keywordRanks.find((r) => r.keyword === keyword)
    if (kr) {
      points.push({ date: snap.date, rank: kr.rank })
    }
  }
  points.sort((a, b) => a.date.localeCompare(b.date))
  return points
}

export function loadKeywordList(accountId: string): string[] {
  if (typeof window === "undefined") return []
  const all = JSON.parse(localStorage.getItem(KEYWORD_LIST_KEY) || "{}")
  return all[accountId] || []
}

export function saveKeywordList(accountId: string, keywords: string[]) {
  const all = JSON.parse(localStorage.getItem(KEYWORD_LIST_KEY) || "{}")
  all[accountId] = keywords
  localStorage.setItem(KEYWORD_LIST_KEY, JSON.stringify(all))
}

export function addKeyword(accountId: string, keyword: string) {
  const list = loadKeywordList(accountId)
  if (list.includes(keyword)) return
  saveKeywordList(accountId, [...list, keyword])
}

export function removeKeyword(accountId: string, keyword: string) {
  const list = loadKeywordList(accountId)
  saveKeywordList(accountId, list.filter((k) => k !== keyword))
}

export function editKeyword(accountId: string, oldKeyword: string, newKeyword: string) {
  const list = loadKeywordList(accountId)
  saveKeywordList(accountId, list.map((k) => (k === oldKeyword ? newKeyword : k)))
}
