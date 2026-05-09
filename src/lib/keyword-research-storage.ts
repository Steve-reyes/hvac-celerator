const HISTORY_KEY = "hvac-kw-research"

export interface KeywordIdea {
  keyword: string
  volume: number
  difficulty: number
  cpc: number
  competition: "low" | "medium" | "high"
  trend: "up" | "down" | "stable"
  intent: "informational" | "commercial" | "transactional" | "navigational"
}

export interface KeywordResearch {
  seedKeyword: string
  ideas: KeywordIdea[]
  searchedAt: string
}

const HVAC_SEED_DATA: Record<string, KeywordIdea[]> = {
  "ac repair": [
    { keyword: "ac repair near me", volume: 5400, difficulty: 48, cpc: 4.20, competition: "high", trend: "up", intent: "transactional" },
    { keyword: "commercial ac repair", volume: 3200, difficulty: 42, cpc: 6.80, competition: "high", trend: "up", intent: "commercial" },
    { keyword: "emergency ac repair", volume: 2800, difficulty: 35, cpc: 5.50, competition: "medium", trend: "up", intent: "transactional" },
    { keyword: "ac repair cost", volume: 4100, difficulty: 30, cpc: 3.20, competition: "medium", trend: "stable", intent: "commercial" },
    { keyword: "central ac repair", volume: 2200, difficulty: 38, cpc: 4.80, competition: "medium", trend: "stable", intent: "transactional" },
    { keyword: "ac compressor repair", volume: 1800, difficulty: 25, cpc: 5.10, competition: "low", trend: "up", intent: "transactional" },
    { keyword: "ac not blowing cold air", volume: 3600, difficulty: 22, cpc: 2.90, competition: "low", trend: "up", intent: "informational" },
    { keyword: "ac unit repair near me", volume: 2600, difficulty: 40, cpc: 4.50, competition: "high", trend: "up", intent: "transactional" },
    { keyword: "carrier ac repair", volume: 1200, difficulty: 20, cpc: 3.80, competition: "low", trend: "stable", intent: "transactional" },
    { keyword: "ac repair service", volume: 3900, difficulty: 45, cpc: 4.00, competition: "high", trend: "stable", intent: "commercial" },
    { keyword: "ac troubleshooting", volume: 2400, difficulty: 18, cpc: 1.50, competition: "low", trend: "stable", intent: "informational" },
    { keyword: "split ac repair", volume: 900, difficulty: 15, cpc: 3.20, competition: "low", trend: "down", intent: "transactional" },
  ],
  "hvac installation": [
    { keyword: "hvac installation cost", volume: 6200, difficulty: 52, cpc: 5.80, competition: "high", trend: "up", intent: "commercial" },
    { keyword: "commercial hvac installation", volume: 2800, difficulty: 45, cpc: 7.50, competition: "high", trend: "up", intent: "commercial" },
    { keyword: "hvac installation near me", volume: 4900, difficulty: 50, cpc: 4.90, competition: "high", trend: "up", intent: "transactional" },
    { keyword: "new hvac system cost", volume: 5400, difficulty: 48, cpc: 6.20, competition: "high", trend: "up", intent: "commercial" },
    { keyword: "hvac replacement cost", volume: 3600, difficulty: 42, cpc: 5.50, competition: "medium", trend: "stable", intent: "commercial" },
    { keyword: "ductless hvac installation", volume: 1900, difficulty: 30, cpc: 4.80, competition: "medium", trend: "up", intent: "transactional" },
    { keyword: "hvac quote", volume: 4200, difficulty: 35, cpc: 3.20, competition: "medium", trend: "stable", intent: "commercial" },
    { keyword: "hvac financing options", volume: 2100, difficulty: 28, cpc: 2.50, competition: "low", trend: "up", intent: "commercial" },
    { keyword: "hvac installation checklist", volume: 800, difficulty: 12, cpc: 1.20, competition: "low", trend: "stable", intent: "informational" },
    { keyword: "energy efficient hvac installation", volume: 2400, difficulty: 38, cpc: 6.00, competition: "medium", trend: "up", intent: "commercial" },
  ],
  "hvac maintenance": [
    { keyword: "hvac maintenance contract", volume: 1800, difficulty: 35, cpc: 4.50, competition: "medium", trend: "stable", intent: "commercial" },
    { keyword: "commercial hvac maintenance", volume: 2200, difficulty: 40, cpc: 6.20, competition: "medium", trend: "up", intent: "commercial" },
    { keyword: "hvac maintenance plan", volume: 2600, difficulty: 38, cpc: 3.80, competition: "medium", trend: "stable", intent: "commercial" },
    { keyword: "hvac tune up cost", volume: 1900, difficulty: 25, cpc: 2.50, competition: "low", trend: "stable", intent: "transactional" },
    { keyword: "preventative hvac maintenance", volume: 1400, difficulty: 30, cpc: 3.20, competition: "medium", trend: "up", intent: "commercial" },
    { keyword: "hvac maintenance checklist", volume: 1600, difficulty: 15, cpc: 1.00, competition: "low", trend: "stable", intent: "informational" },
    { keyword: "hvac filter replacement", volume: 3200, difficulty: 10, cpc: 0.80, competition: "low", trend: "stable", intent: "informational" },
  ],
  "furnace repair": [
    { keyword: "furnace repair near me", volume: 4800, difficulty: 45, cpc: 4.50, competition: "high", trend: "up", intent: "transactional" },
    { keyword: "furnace not turning on", volume: 5200, difficulty: 20, cpc: 2.00, competition: "low", trend: "stable", intent: "informational" },
    { keyword: "commercial furnace repair", volume: 1600, difficulty: 35, cpc: 6.00, competition: "medium", trend: "up", intent: "transactional" },
    { keyword: "furnace repair cost", volume: 3800, difficulty: 32, cpc: 3.50, competition: "medium", trend: "stable", intent: "commercial" },
    { keyword: "gas furnace repair", volume: 2900, difficulty: 38, cpc: 4.20, competition: "medium", trend: "stable", intent: "transactional" },
    { keyword: "furnace blower motor repair", volume: 1100, difficulty: 18, cpc: 3.00, competition: "low", trend: "down", intent: "transactional" },
  ],
  "boiler service": [
    { keyword: "boiler repair service", volume: 2200, difficulty: 38, cpc: 5.50, competition: "medium", trend: "stable", intent: "transactional" },
    { keyword: "commercial boiler repair", volume: 1400, difficulty: 35, cpc: 7.00, competition: "medium", trend: "up", intent: "transactional" },
    { keyword: "boiler maintenance", volume: 1800, difficulty: 30, cpc: 3.80, competition: "medium", trend: "stable", intent: "commercial" },
    { keyword: "boiler installation cost", volume: 2600, difficulty: 42, cpc: 6.50, competition: "high", trend: "up", intent: "commercial" },
    { keyword: "boiler not heating", volume: 1200, difficulty: 15, cpc: 1.80, competition: "low", trend: "stable", intent: "informational" },
  ],
}

const ALL_KEYWORDS = Object.values(HVAC_SEED_DATA).flat()

function seededShuffle<T>(arr: T[], seed: string): T[] {
  const r = [...arr]
  for (let i = r.length - 1; i > 0; i--) {
    let h = 0
    const s = seed + String(i)
    for (let j = 0; j < s.length; j++) h = ((h << 5) - h) + s.charCodeAt(j % s.length)
    const idx = Math.abs(h) % (i + 1); [r[i], r[idx]] = [r[idx], r[i]]
  }
  return r
}

export function searchKeywords(query: string): KeywordIdea[] {
  const q = query.toLowerCase().trim()
  if (!q) return seededShuffle(ALL_KEYWORDS, "default").slice(0, 15)

  const exact = ALL_KEYWORDS.filter((k) => k.keyword.toLowerCase().includes(q))

  if (exact.length > 0) return exact.slice(0, 20)

  const words = q.split(/\s+/)
  const fuzzy = ALL_KEYWORDS
    .map((k) => ({ keyword: k, score: words.filter((w) => k.keyword.toLowerCase().includes(w)).length }))
    .filter((k) => k.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((k) => k.keyword)

  if (fuzzy.length > 0) return fuzzy.slice(0, 20)

  return seededShuffle(ALL_KEYWORDS, q).slice(0, 15).map((k) => ({
    ...k,
    keyword: `${q} ${k.keyword}`,
    volume: Math.round(k.volume * (0.3 + Math.random() * 0.7)),
    difficulty: Math.min(95, k.difficulty + Math.round(Math.random() * 15 - 5)),
  }))
}

export function saveSearchHistory(query: string, results: KeywordIdea[]) {
  if (typeof window === "undefined") return
  const all = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]")
  all.unshift({ seedKeyword: query, ideas: results.slice(0, 5), searchedAt: new Date().toISOString() })
  localStorage.setItem(HISTORY_KEY, JSON.stringify(all.slice(0, 10)))
}

export function loadSearchHistory(): KeywordResearch[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]")
}

export function getDifficultyColor(d: number): string {
  if (d >= 70) return "text-red-400"
  if (d >= 40) return "text-amber-400"
  return "text-emerald-400"
}

export function getVolumeLabel(v: number): string {
  if (v >= 5000) return "Very High"
  if (v >= 2000) return "High"
  if (v >= 1000) return "Medium"
  if (v >= 500) return "Low"
  return "Very Low"
}

export function getOpportunityScore(difficulty: number, volume: number): number {
  return Math.round((volume / 100) * (100 - difficulty) / 10)
}