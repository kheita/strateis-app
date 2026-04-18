# Strateis App

## Overview
The Strateis App is the operating system of Strateis Partners — an integrated platform for intelligence, monitoring, and consulting operations.

## Tech Stack
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 3
- **Routing**: React Router 7
- **Animations**: Framer Motion 12
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Edge Functions)

## Project Structure
```
src/                  # React frontend source
  lib/supabase.ts     # Supabase client (uses VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
  App.tsx             # Root component
  main.tsx            # Entry point
supabase/
  functions/          # Supabase Edge Functions (Deno)
    monitor-fetch/    # Frontend data aggregation API
    monitor-ingest/   # External data ingestion API
  migrations/         # PostgreSQL schema migrations
```

## Environment Variables
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key

## Development
- Run: `npm run dev` (served on port 5000)
- Build: `npm run build`

## Deployment
- Type: Static site
- Build command: `npm run build`
- Public directory: `dist`
