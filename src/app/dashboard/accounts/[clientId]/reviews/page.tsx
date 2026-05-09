"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Star, ThumbsUp, MessageSquare, Clock, Shield, Award, ChevronLeft, ChevronRight } from "lucide-react"
import { loadReviews, type StoredReviews } from "@/lib/reviews-storage"
import { getAccountWithCity } from "@/lib/keywords-storage"
import { cn } from "@/lib/utils"

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5"
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(cls, s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-zinc-700")}
        />
      ))}
    </div>
  )
}

function RatingBar({ stars, count, percentage, total }: { stars: number; count: number; percentage: number; total: number }) {
  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      <span className="text-sm w-4 text-zinc-400">{stars}</span>
      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
      <div className="flex-1 h-2.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            stars >= 4 ? "bg-emerald-500" : stars >= 3 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-zinc-400 w-10 text-right">{count}</span>
      <span className="text-xs text-zinc-600 w-10 text-right">{percentage.toFixed(0)}%</span>
    </div>
  )
}

function ReviewCard({ review }: { review: { reviewerName: string; reviewerAvatar: string; rating: number; text: string; relativeDate: string; isLocalGuide: boolean; reviewCount: number; source?: string } }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={review.reviewerAvatar}
            alt={review.reviewerName}
            className="h-10 w-10 rounded-full bg-zinc-800"
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{review.reviewerName}</p>
              {review.source === "google" && (
                <Badge variant="success" className="text-[9px] h-4">Google</Badge>
              )}
              {review.isLocalGuide && (
                <Badge variant="outline" className="text-[9px] h-4 gap-1 text-amber-400 border-amber-500/30">
                  <Award className="h-2.5 w-2.5" />
                  Local Guide
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <StarRating rating={review.rating} />
              <span>·</span>
              <Clock className="h-3 w-3" />
              <span>{review.relativeDate}</span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed">{review.text}</p>
      <div className="flex items-center gap-3 text-xs text-zinc-600">
        <button className="hover:text-zinc-400 flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" /> Helpful
        </button>
        <span>·</span>
        <span>{review.reviewCount} reviews</span>
        <span>·</span>
        <Shield className="h-3 w-3" />
        <span>Verified</span>
      </div>
    </div>
  )
}

export default function ReviewsPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const [data, setData] = useState<StoredReviews | null>(null)
  const [accountName, setAccountName] = useState("")
  const [accountCity, setAccountCity] = useState("")
  const [page, setPage] = useState(1)
  const PER_PAGE = 6

  useEffect(() => {
    const stored = loadReviews(clientId)
    setData(stored)

    const meta = getAccountWithCity(clientId)
    setAccountName(meta.name)
    setAccountCity(meta.city)
  }, [clientId])

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/accounts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Google Reviews</h1>
          <p className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
            {accountName}
            {accountCity && (
              <span className="flex items-center gap-1 text-zinc-500">
                <MapPin className="h-3 w-3" />
                {accountCity}
              </span>
            )}
          </p>
        </div>
      </div>

      {!data ? (
        <Card>
          <CardContent className="py-12 text-center text-zinc-500">
            <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No review data yet.</p>
            <p className="text-xs mt-1">Scan your website to fetch Google Reviews data.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-400">Overall Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-amber-400">{data.overallRating}</span>
                  <div>
                    <StarRating rating={data.overallRating} size="lg" />
                    <p className="text-xs text-zinc-500 mt-1">{data.totalReviews.toLocaleString()} reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-400">Rating Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {data.distribution.map((d) => (
                  <RatingBar key={d.stars} {...d} total={data.totalReviews} />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-400">Review Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Total Reviews</span>
                  <span className="font-bold">{data.totalReviews.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">5-star</span>
                  <span className="font-bold text-emerald-400">{data.distribution[0].count.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">4-star</span>
                  <span className="font-bold text-emerald-400">{data.distribution[1].count.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">3-star & below</span>
                  <span className="font-bold text-red-400">{(data.distribution[2].count + data.distribution[3].count + data.distribution[4].count).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Recent Reviews</span>
                  <span className="font-bold">{data.reviews.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Data Source</span>
                  <Badge variant={data.source === "google-places-api" ? "success" : "outline"} className="text-[10px]">
                    {data.source === "google-places-api" ? "Google Maps API" : "Estimated"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Reviews</CardTitle>
                  <CardDescription>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Google Maps · {data.reviews.length} reviews shown
                      <span className="mx-1">·</span>
                      <Clock className="h-3 w-3" />
                      Scanned {new Date(data.scannedAt).toLocaleDateString()}
                    </span>
                  </CardDescription>
                </div>
                <Badge variant="success" className="gap-1">
                  <Shield className="h-3 w-3" />
                  {data.source === "google-places-api" ? "Live Google Data" : "Estimated"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.reviews.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No review text available from Google.</p>
                </div>
              ) : (
                <>
                  {data.reviews
                    .slice((page - 1) * PER_PAGE, page * PER_PAGE)
                    .map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500">
                      Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, data.reviews.length)} of {data.reviews.length} reviews
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: Math.ceil(data.reviews.length / PER_PAGE) }, (_, i) => i + 1)
                        .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === Math.ceil(data.reviews.length / PER_PAGE))
                        .reduce<React.ReactNode[]>((acc, p, idx, arr) => {
                          if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push(<span key={`ellipsis-${p}`} className="text-xs text-zinc-600 px-1">...</span>)
                          acc.push(
                            <Button
                              key={p}
                              variant={p === page ? "default" : "outline"}
                              size="sm"
                              className="h-8 w-8 p-0 text-xs"
                              onClick={() => setPage(p)}
                            >
                              {p}
                            </Button>
                          )
                          return acc
                        }, [])}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={page >= Math.ceil(data.reviews.length / PER_PAGE)}
                        onClick={() => setPage(page + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
