"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, ExternalLink, Clock, Shield, ThumbsUp, Award } from "lucide-react"
import { loadReviews, type StoredReviews } from "@/lib/reviews-storage"
import { APP_ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface AccountReview {
  accountId: string
  accountName: string
  city: string
  data: StoredReviews
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn("h-3 w-3", s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-zinc-700")}
        />
      ))}
    </div>
  )
}

export default function GlobalReviewsPage() {
  const [accounts, setAccounts] = useState<AccountReview[]>([])

  useEffect(() => {
    const raw = localStorage.getItem("hvac-auth-user")
    if (!raw) return
    const user = JSON.parse(raw)
    const allAccounts = JSON.parse(localStorage.getItem("hvac-managed-accounts") || "{}")
    const userAccounts = allAccounts[user.companySlug] || []

    const result: AccountReview[] = []
    for (const a of userAccounts) {
      const reviews = loadReviews(a.id)
      if (reviews) {
        result.push({ accountId: a.id, accountName: a.name, city: a.city || "", data: reviews })
      }
    }
    setAccounts(result)
  }, [])

  const totalReviews = accounts.reduce((s, a) => s + a.data.totalReviews, 0)
  const avgRating = accounts.length > 0
    ? (accounts.reduce((s, a) => s + a.data.overallRating, 0) / accounts.length).toFixed(1)
    : "—"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Google Reviews</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Verified review data from Google Maps across all accounts
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-400">{avgRating}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-emerald-400" />
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalReviews.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <Award className="h-4 w-4 text-[#FF6B00]" />
              Accounts Tracked
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{accounts.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              Data Source
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-xs pt-1">
            {accounts.some((a) => a.data.source === "google-places-api") ? "Google Maps API" : "Estimated"}
          </p></CardContent>
        </Card>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-zinc-500">
            <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No review data.</p>
            <p className="text-xs mt-1">Add and scan companies to fetch Google Reviews.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((account) => (
            <Card key={account.accountId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {account.accountName}
                      {account.city && (
                        <span className="text-xs font-normal text-zinc-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {account.city}
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold text-amber-400">{account.data.overallRating}</span>
                          <StarRating rating={account.data.overallRating} />
                        </div>
                        <span className="text-zinc-600">·</span>
                        <span>{account.data.totalReviews.toLocaleString()} reviews</span>
                        <span className="text-zinc-600">·</span>
                        <Clock className="h-3 w-3 text-zinc-600" />
                        <span className="text-xs">{new Date(account.data.scannedAt).toLocaleDateString()}</span>
                        <span className="text-zinc-600">·</span>
                        <Badge variant={account.data.source === "google-places-api" ? "success" : "outline"} className="text-[8px] h-4">
                          {account.data.source === "google-places-api" ? "Live" : "Estimated"}
                        </Badge>
                      </div>
                    </CardDescription>
                  </div>
                  <Link href={APP_ROUTES.REVIEWS_CLIENT(account.accountId)}>
                    <Button variant="ghost" size="sm" className="text-xs gap-1">
                      View <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 mb-3">
                  {account.data.distribution.map((d) => (
                    <div key={d.stars} className="flex items-center gap-2">
                      <span className="text-xs w-3 text-zinc-500">{d.stars}</span>
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", d.stars >= 4 ? "bg-emerald-500" : d.stars >= 3 ? "bg-amber-500" : "bg-red-500")}
                          style={{ width: `${d.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500 w-8 text-right">{d.count}</span>
                    </div>
                  ))}
                </div>
                {account.data.reviews.length > 0 && (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                      <MessageSquare className="h-3 w-3" />
                      Latest review
                      <span className="text-zinc-600">·</span>
                      {account.data.reviews[0].relativeDate}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating rating={account.data.reviews[0].rating} />
                      <span className="text-xs font-medium">{account.data.reviews[0].reviewerName}</span>
                      {account.data.reviews[0].isLocalGuide && (
                        <Badge variant="outline" className="text-[8px] h-3 text-amber-400 border-amber-500/30">Guide</Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2">{account.data.reviews[0].text}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function MessageSquare(props: React.ComponentProps<"svg">) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}