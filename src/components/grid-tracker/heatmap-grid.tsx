"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getRankColor, getRankLabel } from "@/services/rankings"
import type { HeatmapCell } from "@/types/database"
import { cn } from "@/lib/utils"

interface HeatmapGridProps {
  data: HeatmapCell[]
}

export function HeatmapGrid({ data }: HeatmapGridProps) {
  const bestRank = Math.min(...data.map((d) => d.rank))
  const worstRank = Math.max(...data.map((d) => d.rank))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Local Grid Tracker</CardTitle>
        <CardDescription>
          5x5 heatmap of high-intent B2B keyword rankings
        </CardDescription>
        <div className="flex gap-4 text-xs text-zinc-400 mt-2">
          <span>Best: #{bestRank}</span>
          <span>Worst: #{worstRank}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {data.map((cell) => (
            <div
              key={cell.keyword}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all hover:scale-105",
                getRankColor(cell.rank)
              )}
            >
              <span className="text-lg font-bold">{cell.rank}</span>
              <span className="text-[10px] leading-tight mt-1 line-clamp-2">
                {cell.keyword}
              </span>
              <span className="text-[9px] opacity-60 mt-1">
                {getRankLabel(cell.rank)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
