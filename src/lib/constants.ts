export const BRAND = {
  name: "H-VAC-celerator",
  primaryColor: "#FF6B00",
  primaryColorName: "Safety Orange",
} as const

export const APP_ROUTES = {
  DASHBOARD: "/dashboard",
  ACCOUNTS: "/dashboard/accounts",
  KEYWORDS: "/dashboard/keywords",
  CLIENT: (id: string) => `/dashboard/accounts/${id}`,
  KEYWORDS_CLIENT: (id: string) => `/dashboard/accounts/${id}/keywords`,
  KEYWORD_GRAPH: (id: string, keyword: string) => `/dashboard/accounts/${id}/keywords/${encodeURIComponent(keyword)}`,
  REVIEWS_CLIENT: (id: string) => `/dashboard/accounts/${id}/reviews`,
  GRID_TRACKER: (id: string) => `/dashboard/accounts/${id}/grid-tracker`,
  GAP_ANALYSIS: (id: string) => `/dashboard/accounts/${id}/gap-analysis`,
  CONTENT_ENGINE: (id: string) => `/dashboard/accounts/${id}/content-engine`,
  WHITE_LABEL: "/dashboard/white-label",
} as const

export const MAP_PACK_KEYWORDS = [
  "Commercial AC Repair",
  "HVAC Contractor",
  "Emergency HVAC Service",
  "Commercial HVAC Installation",
  "AC Replacement Cost",
  "HVAC Maintenance Plans",
  "Industrial Refrigeration Service",
  "Boiler Repair Service",
  "Ductwork Installation",
  "Heat Pump Repair",
  "Ventilation System Design",
  "Commercial HVAC Quotes",
  "HVAC Financing Options",
  "Energy Efficient HVAC",
  "HVAC Emergency Service 24/7",
  "Rooftop Unit Repair",
  "Zoned HVAC Systems",
  "Indoor Air Quality Testing",
  "HVAC License Contractor",
  "Commercial Refrigeration",
] as const

export const B2B_ENTITIES = [
  "VRF Systems",
  "Chiller Overhaul",
  "Building Automation",
  "RTU Replacement",
  "Energy Management",
  "Air Handler Units",
  "Cooling Tower Service",
  "Variable Frequency Drives",
  "DX System Design",
  "Make-Up Air Units",
] as const
