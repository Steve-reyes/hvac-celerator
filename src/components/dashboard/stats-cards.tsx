"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Star, MapPin, Users } from "lucide-react"
import type { DashboardStats } from "@/types/database"

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Accounts",
      value: stats.totalClients,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Avg. Map Pack Rank",
      value: stats.avgMapPackRank.toFixed(1),
      icon: MapPin,
      color: "text-[#FF6B00]",
      bg: "bg-[#FF6B00]/10",
    },
    {
      title: "Avg. Review Score",
      value: stats.avgReviewScore.toFixed(1),
      icon: Star,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      title: "Total Monthly Leads",
      value: stats.totalMonthlyLeads.toLocaleString(),
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
