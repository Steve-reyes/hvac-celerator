"use client"

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Star, MapPin, TrendingUp } from "lucide-react"
import { APP_ROUTES } from "@/lib/constants"
import type { AgencyAccount } from "@/types/database"

interface AccountsTableProps {
  accounts: AgencyAccount[]
}

function getRankBadge(rank: number | null) {
  if (rank === null) return <Badge variant="outline">N/A</Badge>
  if (rank <= 3) return <Badge variant="success">#{rank}</Badge>
  if (rank <= 5) return <Badge variant="default">#{rank}</Badge>
  if (rank <= 10) return <Badge variant="secondary">#{rank}</Badge>
  return <Badge variant="destructive">#{rank}</Badge>
}

function getScoreColor(score: number | null) {
  if (score === null) return "text-zinc-500"
  if (score >= 4.5) return "text-emerald-400"
  if (score >= 4.0) return "text-amber-400"
  return "text-red-400"
}

export function AccountsTable({ accounts }: AccountsTableProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-lg font-semibold">Managed Accounts</h2>
        <p className="text-sm text-zinc-400 mt-1">
          {accounts.length} active client accounts
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client Name</TableHead>
            <TableHead>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Avg. Map Pack Rank
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                Review Score
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Monthly Leads
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-medium">{account.name}</TableCell>
              <TableCell>{getRankBadge(account.avgMapPackRank)}</TableCell>
              <TableCell>
                <span className={`font-semibold ${getScoreColor(account.reviewScore)}`}>
                  {account.reviewScore?.toFixed(1) ?? "—"}
                  <span className="text-zinc-500 text-xs ml-1">/ 5.0</span>
                </span>
              </TableCell>
              <TableCell>
                <span className="font-semibold">
                  {account.monthlyLeadCount?.toLocaleString() ?? "—"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Link href={APP_ROUTES.KEYWORDS_CLIENT(account.id)}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    Keywords
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
