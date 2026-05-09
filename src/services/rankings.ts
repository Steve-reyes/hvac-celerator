import { MAP_PACK_KEYWORDS } from "@/lib/constants"
import type { HeatmapCell } from "@/types/database"

export function generateHeatmapData(clientId: string): HeatmapCell[] {
  return MAP_PACK_KEYWORDS.map((keyword) => ({
    keyword,
    rank: Math.floor(Math.random() * 20) + 1,
    label: keyword,
  }))
}

export function getRankColor(rank: number): string {
  if (rank <= 3) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
  if (rank <= 5) return "bg-green-500/20 text-green-400 border-green-500/40"
  if (rank <= 10) return "bg-amber-500/20 text-amber-400 border-amber-500/40"
  if (rank <= 15) return "bg-orange-500/20 text-orange-400 border-orange-500/40"
  return "bg-red-500/20 text-red-400 border-red-500/40"
}

export function getRankLabel(rank: number): string {
  if (rank === 1) return "Local Pack #1"
  if (rank <= 3) return "Top 3"
  if (rank <= 5) return "Top 5"
  if (rank <= 10) return "Top 10"
  if (rank <= 15) return "Top 15"
  return "Beyond 15"
}
