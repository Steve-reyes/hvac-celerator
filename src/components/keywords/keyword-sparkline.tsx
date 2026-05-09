"use client"

import { TrendingUp, TrendingDown } from "lucide-react"

interface Point {
  rank: number
}

export function KeywordSparkline({ history }: { history: Point[] }) {
  if (history.length < 2) {
    if (history.length === 1) {
      return (
        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <span className="w-16 text-right">{history[0].rank}</span>
        </div>
      )
    }
    return <span className="text-xs text-zinc-600">—</span>
  }

  const values = history.map((p) => p.rank)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(max - min, 3)
  const w = 64
  const h = 24
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  })
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${p}`).join(" ")

  const trend = values[values.length - 1] - values[0]
  const color = trend < 0 ? "#34d399" : trend > 0 ? "#f87171" : "#a1a1aa"

  return (
    <div className="flex items-center gap-1">
      <svg width={w} height={h} className="shrink-0">
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex flex-col text-[10px] leading-tight text-zinc-500">
        <span className="font-mono">{values[values.length - 1]}</span>
        {trend < 0 && <TrendingUp className="h-2.5 w-2.5 text-emerald-400" />}
        {trend > 0 && <TrendingDown className="h-2.5 w-2.5 text-red-400" />}
      </div>
    </div>
  )
}
