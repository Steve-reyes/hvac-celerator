export interface AgencyAccount {
  id: string
  name: string
  slug: string
  avgMapPackRank: number | null
  reviewScore: number | null
  monthlyLeadCount: number | null
  website: string | null
}

export interface RankingEntry {
  id: string
  clientId: string
  keyword: string
  rank: number
  date: string
}

export interface ServiceAreaEntry {
  id: string
  clientId: string
  name: string
  latitude: number
  longitude: number
  radius: number | null
}

export interface CompetitorEntry {
  id: string
  clientId: string
  name: string
  website: string | null
}

export interface KeywordGapEntry {
  id: string
  clientId: string
  entityName: string
  isClient: boolean
  strength: number
  competitorId: string | null
  competitorName?: string | null
}

export interface ContentPostEntry {
  id: string
  clientId: string
  service: string
  targetCity: string
  headline: string | null
  body: string | null
  cta: string | null
  status: string
  createdAt: string
}

export interface WhiteLabelConfig {
  logoUrl: string | null
  primaryColor: string
  fontFamily: string
  reportHeader: string | null
  reportFooter: string | null
}

export interface DashboardStats {
  totalClients: number
  avgMapPackRank: number
  avgReviewScore: number
  totalMonthlyLeads: number
}

export interface HeatmapCell {
  keyword: string
  rank: number
  label: string
}
