const LOCAL_KEY = "hvac-local-seo"
const LOCAL_HISTORY_KEY = "hvac-local-seo-history"

export interface LocalSEOData {
  gbpVerified: boolean
  gbpCategory: string
  gbpPhone: string
  gbpWebsite: string
  gbpPostsPerMonth: number
  mapPackRank: number
  localKeywordsRanked: number
  citationsFound: number
  citationsConsistent: number
  citationScore: number
  serviceAreas: string[]
  localCompetitors: { name: string; rank: number; rating: number; reviews: number }[]
  directoryListings: { name: string; listed: boolean; napMatch: boolean; url: string }[]
  weeklyGBPViews: number
  weeklyGBPSearches: number
  weeklyGBPActions: number
}

export interface LocalSEOHistoryPoint {
  date: string
  mapPackRank: number
}

const DIRECTORIES = [
  "Google Business Profile", "Yelp", "YellowPages", "Angi", "HomeAdvisor",
  "BBB", "Facebook", "Nextdoor", "MapQuest", "SuperPages",
  "MerchantCircle", "Hotfrog", "Citysearch", "Foursquare", "Brownbook",
]

function seed(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) { h = ((h << 5) - h) + seed.charCodeAt(i); h = h & h }
  return (Math.abs(h) % 1000) / 1000
}

export function generateLocalSEO(accountId: string, name: string, city: string): LocalSEOData {
  const s = accountId || name.toLowerCase().replace(/\s/g, "")
  const gbpVerified = seed(s + "-gbp") > 0.15
  const rank = Math.max(1, Math.min(10, Math.round(1 + seed(s + "-mpr") * 9)))
  const citationsTotal = DIRECTORIES.length
  const citationsGood = Math.round(citationsTotal * (0.5 + seed(s + "-cit") * 0.4))

  return {
    gbpVerified,
    gbpCategory: "HVAC Contractor",
    gbpPhone: "(555) 000-0000",
    gbpWebsite: `https://${name.toLowerCase().replace(/\s/g, "")}.com`,
    gbpPostsPerMonth: Math.round(1 + seed(s + "-posts") * 5),
    mapPackRank: rank,
    localKeywordsRanked: Math.round(10 + seed(s + "-lkw") * 40),
    citationsFound: citationsTotal,
    citationsConsistent: citationsGood,
    citationScore: Math.round((citationsGood / citationsTotal) * 100),
    serviceAreas: [
      city,
      ...["North", "South", "East", "West", "Downtown"].map((d) => `${d} ${city.split(",")[0]}`),
    ].slice(0, 3 + Math.round(seed(s + "-sa") * 3)),
    localCompetitors: [
      { name: "Pro HVAC Group", rank: Math.max(1, Math.round(rank - 2 + seed(s + "-c1") * 4)), rating: parseFloat((3.5 + seed(s + "-cr1") * 1.5).toFixed(1)), reviews: Math.round(20 + seed(s + "-crv1") * 200) },
      { name: "Elite Mechanical", rank: Math.max(1, Math.round(rank + 1 + seed(s + "-c2") * 4)), rating: parseFloat((3.5 + seed(s + "-cr2") * 1.5).toFixed(1)), reviews: Math.round(20 + seed(s + "-crv2") * 200) },
      { name: "Apex Climate Control", rank: Math.max(1, Math.round(rank + 3 + seed(s + "-c3") * 3)), rating: parseFloat((3.5 + seed(s + "-cr3") * 1.5).toFixed(1)), reviews: Math.round(20 + seed(s + "-crv3") * 200) },
    ],
    directoryListings: DIRECTORIES.map((d) => ({
      name: d,
      listed: seed(s + "-dir-" + d) > 0.25,
      napMatch: seed(s + "-nap-" + d) > 0.3,
      url: `https://${d.toLowerCase().replace(/\s/g, "")}.com`,
    })),
    weeklyGBPViews: Math.round(100 + seed(s + "-views") * 900),
    weeklyGBPSearches: Math.round(50 + seed(s + "-search") * 500),
    weeklyGBPActions: Math.round(10 + seed(s + "-acts") * 200),
  }
}

export function loadLocalSEO(accountId: string, name: string, city: string): LocalSEOData {
  if (typeof window === "undefined") return generateLocalSEO(accountId, name, city)
  const all = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}")
  if (all[accountId]) {
    saveLocalSEOSnapshot(accountId, all[accountId].mapPackRank)
    return all[accountId]
  }
  const data = generateLocalSEO(accountId, name, city)
  all[accountId] = data
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all))
  saveLocalSEOSnapshot(accountId, data.mapPackRank)
  return data
}

function loadLocalSEOHistory(accountId: string): LocalSEOHistoryPoint[] {
  if (typeof window === "undefined") return []
  const all = JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || "{}")
  return all[accountId] || []
}

function saveLocalSEOHistory(accountId: string, history: LocalSEOHistoryPoint[]) {
  const all = JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || "{}")
  all[accountId] = history
  localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(all))
}

function saveLocalSEOSnapshot(accountId: string, mapPackRank: number) {
  const today = new Date().toISOString().split("T")[0]
  const history = loadLocalSEOHistory(accountId)
  const existing = history.findIndex((h) => h.date === today)
  if (existing >= 0) {
    history[existing].mapPackRank = mapPackRank
  } else {
    history.push({ date: today, mapPackRank })
  }
  history.sort((a, b) => a.date.localeCompare(b.date))
  saveLocalSEOHistory(accountId, history)
}

export function getLocalSEORankHistory(accountId: string): LocalSEOHistoryPoint[] {
  if (typeof window === "undefined") return []
  const history = loadLocalSEOHistory(accountId)
  history.sort((a, b) => a.date.localeCompare(b.date))
  return history
}
