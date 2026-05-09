"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { KeywordGapEntry } from "@/types/database"

interface CompetitiveTableProps {
  data: KeywordGapEntry[]
}

function getStrengthColor(strength: number): string {
  if (strength >= 70) return "bg-emerald-500"
  if (strength >= 50) return "bg-amber-500"
  return "bg-red-500"
}

export function CompetitiveTable({ data }: CompetitiveTableProps) {
  const entities = [...new Set(data.map((d) => d.entityName))]
  const competitors: string[] = [...new Set(
    data.filter((d): d is KeywordGapEntry & { competitorName: string } => !d.isClient && d.competitorName !== null)
      .map((d) => d.competitorName)
  )]

  const getStrength = (entity: string, source: string | null, isClient: boolean) => {
    return data.find(
      (d) =>
        d.entityName === entity &&
        (isClient ? d.isClient : d.competitorName === source)
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>B2B Keyword Gap Analysis</CardTitle>
        <CardDescription>
          Technical entity comparison against top competitors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Technical Entity</TableHead>
              <TableHead className="text-center">Your Client</TableHead>
              {competitors.map((comp) => (
                <TableHead key={comp} className="text-center">
                  {comp}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {entities.map((entity) => {
              const clientEntry = getStrength(entity, null, true)
              return (
                <TableRow key={entity}>
                  <TableCell className="font-medium">{entity}</TableCell>
                  <TableCell className="text-center">
                    {clientEntry && (
                      <StrengthBar strength={clientEntry.strength} isClient />
                    )}
                  </TableCell>
                  {competitors.map((comp) => {
                    const compEntry = getStrength(entity, comp, false)
                    return (
                      <TableCell key={comp} className="text-center">
                        {compEntry && (
                          <StrengthBar strength={compEntry.strength} />
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function StrengthBar({ strength, isClient }: { strength: number; isClient?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1">
        <div className="h-2 w-16 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              getStrengthColor(strength),
              isClient && "ring-1 ring-[#FF6B00]"
            )}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>
      <span className="text-xs font-mono">{strength}</span>
      {isClient && <Badge variant="default" className="text-[9px] px-1 py-0">You</Badge>}
    </div>
  )
}
