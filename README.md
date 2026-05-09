# H-VAC-celerator

Multi-tenant SEO management platform for HVAC agencies. Track rankings, analyze competitors, manage Google reviews, and generate GEO-optimized content — all in one place.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + Shadcn/UI
- **Database:** PostgreSQL via Prisma 7 ORM
- **Auth:** Supabase (with localStorage fallback for demo)
- **Charts:** Recharts
- **APIs:** Google Places API (reviews & autocomplete)

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | With Prisma | PostgreSQL connection string |
| `GOOGLE_PLACES_API_KEY` | For live reviews | Google Places API key — get at [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and enable the Places API |
| `NEXT_PUBLIC_SUPABASE_URL` | With Supabase | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | With Supabase | Supabase anonymous key |

## Features

- **Dashboard** — Multi-account executive overview with live stats
- **Accounts** — Manage HVAC companies linked to Google Maps listings
- **Keywords** — Tracked keyword management with bulk CSV/TXT import, position history graphs, sortable/searchable table
- **Reviews** — Google Maps review data with rating distribution and paginated review cards
- **Competitor Research** — Domain analysis, keyword gap comparison, traffic estimates, historical trends
- **Content Engine** — AI-generated Google Business Profile posts with automated CTAs
- **White-Label** — Customizable branding with live preview and CSS variable output

## Architecture

```
src/
├── app/              # Next.js App Router pages & API routes
├── components/       # React components (ui, layout, feature-specific)
├── lib/              # Utilities, storage, Supabase/Prisma clients
├── services/         # Business logic (scanners, generators, mock data)
├── types/            # TypeScript type definitions
└── generated/        # Prisma client (auto-generated)
```

## Deployment

```bash
npm run build
npm start
```

The static prerendered routes work without a database. Dynamic routes (keyword graphs, reviews, competitor analysis) use localStorage for demo data — swap with Supabase/Prisma queries for production.
