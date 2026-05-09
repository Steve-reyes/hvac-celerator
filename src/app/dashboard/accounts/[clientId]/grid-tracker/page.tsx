import Link from "next/link"
import { HeatmapGrid } from "@/components/grid-tracker/heatmap-grid"
import { generateHeatmapData } from "@/services/rankings"
import { MOCK_CLIENTS } from "@/services/mock-data"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function GridTrackerPage(props: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await props.params
  const client = MOCK_CLIENTS.find((c) => c.id === clientId)
  const data = generateHeatmapData(clientId)

  if (!client) {
    return <p className="text-zinc-400">Client not found</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/accounts/${clientId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Local Grid Tracker</h1>
          <p className="text-sm text-zinc-400">{client.name}</p>
        </div>
      </div>

      <HeatmapGrid data={data} />
    </div>
  )
}
