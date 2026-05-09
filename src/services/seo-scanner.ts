export interface ScanResult {
  avgMapPackRank: number
  reviewScore: number
  monthlyLeadCount: number
  scannedAt: string
  detectedKeywords: number
  totalReviews: number
  keywordRanks: { keyword: string; rank: number }[]
  city: string
}

export const HVAC_KEYWORD_POOL = [
  "Commercial AC Repair", "HVAC Contractor", "Emergency HVAC Service",
  "Commercial HVAC Installation", "AC Replacement Cost", "HVAC Maintenance Plans",
  "Industrial Refrigeration Service", "Boiler Repair Service", "Ductwork Installation",
  "Heat Pump Repair", "Ventilation System Design", "Commercial HVAC Quotes",
  "HVAC Financing Options", "Energy Efficient HVAC", "HVAC Emergency Service 24/7",
  "Rooftop Unit Repair", "Zoned HVAC Systems", "Indoor Air Quality Testing",
  "HVAC License Contractor", "Commercial Refrigeration",
  "Furnace Replacement", "Air Duct Cleaning", "Thermostat Installation",
  "Humidifier Service", "Geothermal HVAC", "Commercial Kitchen Ventilation",
  "Evaporator Coil Cleaning", "Condenser Unit Repair", "Split System Installation",
  "Package Unit Service", "Mini Split AC Installation", "Gas Furnace Repair",
  "Heat Exchanger Replacement", "Air Handler Replacement", "Zone Control System",
  "Building Energy Audit", "HVAC Permit Service", "Commercial Exhaust Fan",
  "Makeup Air Unit", "VFD Installation", "Chiller Maintenance",
  "Cooling Tower Repair", "Pump Replacement", "Hydronic Heating",
  "Radiant Floor Heating", "Ductless Mini Split", "Window AC Installation",
  "Portable AC Rental", "Generator Transfer Switch", "Air Purifier Installation",
]

function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return (Math.abs(hash) % 1000) / 1000
}

export async function scanWebsite(
  name: string,
  website: string,
  city: string,
  customKeywords?: string[]
): Promise<ScanResult> {
  await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000))

  const seed = `${name}-${website}-${city}-${new Date().toDateString()}`
  const rng = seededRandom(seed)

  const mapRank = Math.max(1, Math.min(10, Math.round(1 + rng * 8)))
  const reviewScore = parseFloat((3.2 + rng * 1.8).toFixed(1))
  const monthlyLeads = Math.round(30 + rng * 270)

  const keywordPool = customKeywords && customKeywords.length > 0
    ? customKeywords
    : HVAC_KEYWORD_POOL

  const keywordRanks = keywordPool.map((keyword) => {
    const kwSeed = seededRandom(`${seed}-${keyword}`)
    return { keyword, rank: Math.max(1, Math.min(20, Math.round(1 + kwSeed * 19))) }
  })

  return {
    avgMapPackRank: mapRank,
    reviewScore: Math.min(5.0, reviewScore),
    monthlyLeadCount: monthlyLeads,
    scannedAt: new Date().toISOString(),
    detectedKeywords: keywordRanks.length,
    totalReviews: Math.round(5 + rng * 95),
    keywordRanks,
    city,
  }
}
