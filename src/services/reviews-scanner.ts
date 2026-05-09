export interface GoogleReview {
  id: string
  reviewerName: string
  reviewerAvatar: string
  rating: number
  text: string
  relativeDate: string
  isoDate: string
  isLocalGuide: boolean
  reviewCount: number
  source?: "google" | "augmented"
}

export interface ReviewsScanResult {
  overallRating: number
  totalReviews: number
  distribution: { stars: number; count: number; percentage: number }[]
  reviews: GoogleReview[]
  scannedAt: string
  source: "google-places-api" | "simulated"
}

const HVAC_REVIEW_TEXTS: Record<number, string[]> = {
  5: [
    "{name} did an excellent job on our commercial AC unit. Punctual, professional, and fair pricing.",
    "Best HVAC contractor we've worked with. {name} knows commercial systems inside and out.",
    "Called {name} for an emergency repair on a Sunday — they were here within the hour. Lifesavers.",
    "Thorough inspection and maintenance from {name}. The tech explained every step. Couldn't ask for more.",
    "{name} installed our new rooftop units. Clean work, competitive bid, system runs flawlessly.",
    "We've been using {name} for years. They maintain all our properties. Reliable and responsive.",
    "Quick response from {name}. Office AC went down in July — they had us cooled off same day.",
    "Very impressed with {name}'s professionalism. From the office staff to the field techs, top notch.",
    "{name} replaced our entire building's HVAC. Project came in on time and under budget.",
    "The team at {name} is fantastic. They service our chillers quarterly, never had a breakdown.",
  ],
  4: [
    "Good service from {name}. Repair was done well, though scheduling took a bit longer than hoped.",
    "Pretty satisfied with {name}. Would be 5 stars if follow-up communication was a bit faster.",
    "Solid work by {name}. Technician was friendly and knowledgeable. Slightly above average pricing.",
    "{name} did a good job on our maintenance contract. Professional team, reasonable turnaround.",
    "Happy with the install from {name}. Crew was courteous and cleaned up well after the job.",
  ],
  3: [
    "Decent service from {name} but communication could improve. Had to call for updates.",
    "Average experience with {name}. Work was fine but nothing exceptional. Price was fair.",
    "Okay service. {name}'s tech was knowledgeable but the front desk seemed disorganized.",
    "Took {name} three visits to fully resolve the issue. Final result was acceptable.",
    "Satisfied with the repair from {name} but the quote process was slow. Decent overall.",
  ],
  2: [
    "Below average. {name}'s tech was late and the repair didn't hold. Had to call someone else.",
    "Disappointed with {name}. Quoted one price but billed higher after the work was done.",
    "Had issues with {name}'s installation. System works but the ductwork wasn't finished properly.",
  ],
  1: [
    "Terrible experience with {name}. Left a mess, overcharged us, and the problem came back.",
    "Worst HVAC service. {name} sent a rude tech who pushed unnecessary repairs. Avoid.",
    "Avoid {name}. They damaged our ceiling during installation and refused to make it right.",
  ],
}

const REVIEWER_NAMES = [
  "Michael Thompson", "Sarah Martinez", "James Wilson", "Emily Davis",
  "Robert Johnson", "Jennifer Brown", "David Miller", "Lisa Garcia",
  "John Anderson", "Amanda Taylor", "Chris Thomas", "Jessica Jackson",
  "Brian White", "Melissa Harris", "Kevin Martin", "Stephanie Robinson",
  "Daniel Clark", "Nicole Lewis", "Ryan Walker", "Rachel Hall",
  "Jason Allen", "Kimberly Young", "Matthew King", "Ashley Wright",
  "Brandon Scott", "Amber Green", "Justin Adams", "Megan Baker",
  "Kyle Nelson", "Lauren Hill", "Eric Campbell", "Samantha Mitchell",
]

function seededHash(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

function seededRandom(seed: string): number {
  return (seededHash(seed) % 1000) / 1000
}

function generateRelativeDate(daysAgo: number): string {
  if (daysAgo === 0) return "Today"
  if (daysAgo === 1) return "Yesterday"
  if (daysAgo < 7) return `${daysAgo} days ago`
  if (daysAgo < 14) return "1 week ago"
  if (daysAgo < 21) return "2 weeks ago"
  if (daysAgo < 30) return "3 weeks ago"
  if (daysAgo < 60) return "1 month ago"
  if (daysAgo < 90) return "2 months ago"
  if (daysAgo < 180) return `${Math.floor(daysAgo / 30)} months ago`
  return `${Math.floor(daysAgo / 365)} years ago`
}

function generateSimulatedReviews(name: string): ReviewsScanResult {
  const companySeed = name.toLowerCase().replace(/\s/g, "")
  const rng = seededRandom(companySeed)

  const totalReviews = Math.round(25 + rng * 150)
  const p5 = 0.50 + seededRandom(companySeed + "-p5") * 0.20
  const p4 = 0.15 + seededRandom(companySeed + "-p4") * 0.15
  const p3 = 0.05 + seededRandom(companySeed + "-p3") * 0.10
  const p2 = 0.02 + seededRandom(companySeed + "-p2") * 0.06
  const p1 = Math.max(0, 1 - p5 - p4 - p3 - p2)

  const dist = [
    { stars: 5, count: Math.round(totalReviews * p5) },
    { stars: 4, count: Math.round(totalReviews * p4) },
    { stars: 3, count: Math.round(totalReviews * p3) },
    { stars: 2, count: Math.round(totalReviews * p2) },
    { stars: 1, count: Math.round(totalReviews * p1) },
  ]

  const remainder = totalReviews - dist.reduce((s, d) => s + d.count, 0)
  if (remainder > 0) dist[0].count += remainder
  else if (remainder < 0) dist[0].count = Math.max(0, dist[0].count + remainder)

  const weightedSum = dist.reduce((s, d) => s + d.stars * d.count, 0)
  const overallRating = parseFloat((weightedSum / totalReviews).toFixed(1))

  const distWithPercent = dist.map((d) => ({
    ...d,
    percentage: parseFloat(((d.count / totalReviews) * 100).toFixed(1)),
  }))

  const recentReviewCount = Math.min(24, totalReviews)
  const reviewers = [...REVIEWER_NAMES].sort(
    (a, b) => seededHash(companySeed + "-reviewer-" + a) - seededHash(companySeed + "-reviewer-" + b)
  )

  const starPool = [5, 5, 5, 5, 5, 4, 4, 4, 3, 3, 2, 1]
  const reviews: GoogleReview[] = []

  for (let i = 0; i < recentReviewCount; i++) {
    const reviewerName = reviewers[i % reviewers.length]
    const rating = starPool[Math.floor(seededRandom(companySeed + "-rating-" + i) * starPool.length)]
    const texts = HVAC_REVIEW_TEXTS[rating] || HVAC_REVIEW_TEXTS[5]
    const text = texts[seededHash(companySeed + "-text-" + i + reviewerName) % texts.length].replace(/\{name\}/g, name)
    const daysAgo = Math.floor(seededRandom(companySeed + "-date-" + i) * 365)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)

    reviews.push({
      id: `sim-${i}-${companySeed}`,
      reviewerName,
      reviewerAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${reviewerName.replace(/\s/g, "")}&backgroundColor=FF6B00,FF8C38,FFB366`,
      rating,
      text,
      relativeDate: generateRelativeDate(daysAgo),
      isoDate: date.toISOString(),
      isLocalGuide: seededRandom(companySeed + "-guide-" + i) > 0.7,
      reviewCount: Math.round(5 + seededRandom(companySeed + "-rc-" + i) * 50),
    })
  }

  reviews.sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime())

  return {
    overallRating: Math.min(5, Math.max(1, overallRating)),
    totalReviews,
    distribution: distWithPercent,
    reviews,
    scannedAt: new Date().toISOString(),
    source: "simulated",
  }
}

export async function scanGoogleReviews(name: string, city: string, placeId?: string): Promise<ReviewsScanResult> {
  try {
    const response = await fetch("/api/scanner/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, city, placeId }),
    })

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      console.warn(`Google Places API unavailable (${response.status}): ${errBody.error || "unknown"}. Using simulated data.`)
      return generateSimulatedReviews(name)
    }

    const data = await response.json()

    return {
      overallRating: data.overallRating,
      totalReviews: data.totalReviews,
      distribution: data.distribution,
      reviews: data.reviews,
      scannedAt: data.scannedAt,
      source: "google-places-api",
    }
  } catch (err) {
    console.warn("Failed to reach Google Places API, using simulated data:", err)
    return generateSimulatedReviews(name)
  }
}