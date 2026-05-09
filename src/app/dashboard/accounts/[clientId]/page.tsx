import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MOCK_CLIENTS } from "@/services/mock-data"
import { APP_ROUTES } from "@/lib/constants"
import { ArrowUpRight, Grid3X3, BarChart3, FileText } from "lucide-react"

export default async function ClientDetailPage(props: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await props.params
  const client = MOCK_CLIENTS.find((c) => c.id === clientId)

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-zinc-400">Account not found</p>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  const modules = [
    {
      title: "Local Grid Tracker",
      description: "5x5 heatmap of B2B keyword rankings in local search results",
      href: APP_ROUTES.GRID_TRACKER(clientId),
      icon: Grid3X3,
      color: "text-[#FF6B00]",
      bg: "bg-[#FF6B00]/10",
    },
    {
      title: "B2B Keyword Gap Analysis",
      description: "Technical entity comparison against top competitors",
      href: APP_ROUTES.GAP_ANALYSIS(clientId),
      icon: BarChart3,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "AI Content Engine",
      description: "Generate GEO-optimized GBP posts with automated CTAs",
      href: APP_ROUTES.CONTENT_ENGINE(clientId),
      icon: FileText,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
            <Link href="/dashboard" className="hover:text-zinc-200">Dashboard</Link>
            <span>/</span>
            <span className="text-zinc-200">{client.name}</span>
          </div>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          {client.website && (
            <a
              href={client.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#FF6B00] hover:underline inline-flex items-center gap-1 mt-1"
            >
              {client.website}
              <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
        </div>

        <div className="flex gap-2">
          <Card className="text-center p-4">
            <p className="text-xs text-zinc-500">Map Rank</p>
            <p className="text-xl font-bold text-[#FF6B00]">
              #{client.avgMapPackRank?.toFixed(1) ?? "—"}
            </p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-xs text-zinc-500">Reviews</p>
            <p className="text-xl font-bold text-amber-400">
              {client.reviewScore?.toFixed(1) ?? "—"}
            </p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-xs text-zinc-500">Leads/mo</p>
            <p className="text-xl font-bold text-emerald-400">
              {client.monthlyLeadCount ?? "—"}
            </p>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {modules.map((mod) => {
          const Icon = mod.icon
          return (
            <Link key={mod.title} href={mod.href}>
              <Card className="h-full transition-all hover:border-[#FF6B00]/50 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`rounded-lg p-2 ${mod.bg}`}>
                      <Icon className={`h-5 w-5 ${mod.color}`} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-[#FF6B00] transition-colors" />
                  </div>
                  <CardTitle className="text-base mt-3">{mod.title}</CardTitle>
                  <CardDescription>{mod.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
