const STORAGE_KEY = "hvac-competitor-research"

export interface Competitor {
  id: string
  name: string
  domain: string
  addedAt: string
  da: number
  organicTraffic: number
  trafficValue: number
  totalKeywords: number
  backlinks: number
  referringDomains: number
  avgPosition: number
  visibility: number
  gmbRating: number
  gmbReviews: number
  topKeywords: { keyword: string; rank: number; volume: number }[]
  topPages: { url: string; title: string; traffic: number }[]
  keywordOverlap: { keyword: string; ourRank: number; theirRank: number; volume: number; diff: number }[]
  history: { date: string; da: number; traffic: number; avgPosition: number }[]
}

const HVAC_KEYWORDS = [
  "Commercial AC Repair", "HVAC Contractor", "Emergency HVAC Service",
  "Commercial HVAC Installation", "AC Replacement Cost", "HVAC Maintenance Plans",
  "Industrial Refrigeration Service", "Boiler Repair Service", "Ductwork Installation",
  "Heat Pump Repair", "Ventilation System Design", "Commercial HVAC Quotes",
  "HVAC Financing Options", "Energy Efficient HVAC", "Rooftop Unit Repair",
  "Zoned HVAC Systems", "Indoor Air Quality Testing", "Commercial Refrigeration",
]

function seededHash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) { h = ((h << 5) - h) + seed.charCodeAt(i); h = h & h }
  return Math.abs(h)
}

function seedRand(seed: string): number {
  return (seededHash(seed) % 1000) / 1000
}

export function generateCompetitor(name: string, domain: string): Competitor {
  const s = name.toLowerCase().replace(/\s/g, "")
  const id = s + "-" + domain.split(".")[0]

  const da = Math.round(25 + seedRand(s + "-da") * 55)
  const traffic = Math.round(500 + seedRand(s + "-tr") * 15000)
  const avgPos = 3 + seedRand(s + "-pos") * 12
  const vis = Math.max(10, Math.min(95, 60 - (avgPos - 3) * 4 + seedRand(s + "-vis") * 15))

  const topKeywords = HVAC_KEYWORDS.map((kw, i) => ({
    keyword: kw,
    rank: Math.max(1, Math.min(20, Math.round(2 + seedRand(s + "-kw-" + i) * 16))),
    volume: Math.round(100 + seedRand(s + "-vol-" + i) * 900),
  })).sort((a, b) => a.rank - b.rank).slice(0, 12)

  const overlap = HVAC_KEYWORDS.map((kw, i) => {
    const ourRank = Math.max(1, Math.min(20, Math.round(1 + seedRand(id + "-our-" + i) * 17)))
    const theirRank = Math.max(1, Math.min(20, Math.round(2 + seedRand(id + "-them-" + i) * 16)))
    return {
      keyword: kw,
      ourRank,
      theirRank,
      volume: Math.round(100 + seedRand(id + "-vol-" + i) * 900),
      diff: theirRank - ourRank,
    }
  })

  const days = 60
  const history: { date: string; da: number; traffic: number; avgPosition: number }[] = []
  let cDA = da - 8 + seedRand(s + "-hda0") * 10
  let cTraffic = traffic - 2000 + seedRand(s + "-htr0") * 3000
  let cPos = avgPos + 1 + (seedRand(s + "-hpos0") - 0.5) * 2
  for (let i = days; i >= 0; i -= 5) {
    const d = new Date(); d.setDate(d.getDate() - i)
    cDA += (seedRand(s + "-hda-" + i) - 0.48) * 1.5; cDA = Math.max(10, Math.min(95, cDA))
    cTraffic += (seedRand(s + "-htr-" + i) - 0.5) * 400; cTraffic = Math.max(0, cTraffic)
    cPos += (seedRand(s + "-hpos-" + i) - 0.52) * 0.5; cPos = Math.max(1, Math.min(20, cPos))
    history.push({ date: d.toISOString().split("T")[0], da: Math.round(cDA), traffic: Math.round(cTraffic), avgPosition: parseFloat(cPos.toFixed(1)) })
  }

  return {
    id,
    name,
    domain,
    addedAt: new Date().toISOString(),
    da,
    organicTraffic: traffic,
    trafficValue: Math.round(traffic * (1.5 + seedRand(s + "-tv") * 2)),
    totalKeywords: Math.round(100 + seedRand(s + "-tk") * 900),
    backlinks: Math.round(500 + seedRand(s + "-bl") * 9500),
    referringDomains: Math.round(50 + seedRand(s + "-rd") * 500),
    avgPosition: parseFloat(avgPos.toFixed(1)),
    visibility: parseFloat(vis.toFixed(1)),
    gmbRating: parseFloat((3.5 + seedRand(s + "-gmb") * 1.5).toFixed(1)),
    gmbReviews: Math.round(10 + seedRand(s + "-gmbr") * 290),
    topKeywords,
    topPages: topKeywords.slice(0, 6).map((kw) => ({
      url: `https://${domain}/${kw.keyword.toLowerCase().replace(/\s+/g, "-")}`,
      title: `${kw.keyword} | ${name}`,
      traffic: Math.round(kw.volume * (0.1 + seedRand(s + "-tp-" + kw.keyword) * 0.4)),
    })),
    keywordOverlap: overlap,
    history,
  }
}

export function loadCompetitors(): Competitor[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEY)
  if (data) return JSON.parse(data)
  const defaults = [
    generateCompetitor("Pro HVAC Group", "prohvacgroup.com"),
    generateCompetitor("Elite Mechanical", "elitemechanical.com"),
    generateCompetitor("Apex Climate Control", "apexclimate.com"),
    generateCompetitor("Premier HVAC Services", "premierhvacservices.com"),
  ]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
  return defaults
}

export function saveCompetitors(competitors: Competitor[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(competitors))
}

export function addCompetitor(name: string, domain: string): Competitor {
  const comp = generateCompetitor(name, domain)
  const existing = loadCompetitors()
  existing.push(comp)
  saveCompetitors(existing)
  return comp
}

export function removeCompetitor(id: string) {
  saveCompetitors(loadCompetitors().filter((c) => c.id !== id))
}

export function getClientMetrics(accountId: string): {
  da: number; organicTraffic: number; totalKeywords: number; backlinks: number;
  referringDomains: number; avgPosition: number; visibility: number; trafficValue: number;
} {
  const s = accountId || "default-client"
  return {
    da: Math.round(35 + seedRand(s + "-da") * 45),
    organicTraffic: Math.round(800 + seedRand(s + "-tr") * 12000),
    totalKeywords: Math.round(150 + seedRand(s + "-tk") * 700),
    backlinks: Math.round(600 + seedRand(s + "-bl") * 8000),
    referringDomains: Math.round(60 + seedRand(s + "-rd") * 400),
    avgPosition: parseFloat((2 + seedRand(s + "-pos") * 10).toFixed(1)),
    visibility: parseFloat(Math.max(10, Math.min(95, 70 - seedRand(s + "-vis") * 30)).toFixed(1)),
    trafficValue: Math.round((800 + seedRand(s + "-tr") * 12000) * (1.5 + seedRand(s + "-tv") * 2)),
  }
}
