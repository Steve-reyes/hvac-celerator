import type { GoogleReview, ReviewsScanResult } from "@/services/reviews-scanner"

const REVIEWS_KEY = "hvac-google-reviews"

export interface StoredReviews {
  overallRating: number
  totalReviews: number
  distribution: { stars: number; count: number; percentage: number }[]
  reviews: GoogleReview[]
  scannedAt: string
  source: "google-places-api" | "simulated"
}

export function loadReviews(accountId: string): StoredReviews | null {
  if (typeof window === "undefined") return null
  const all = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "{}")
  return all[accountId] || null
}

export function saveReviews(accountId: string, result: ReviewsScanResult) {
  const all = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "{}")
  all[accountId] = {
    overallRating: result.overallRating,
    totalReviews: result.totalReviews,
    distribution: result.distribution,
    reviews: result.reviews,
    scannedAt: result.scannedAt,
    source: result.source,
  }
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(all))
}
