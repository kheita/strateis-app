# Strateis App

Le système d'exploitation de Strateis Partners — intelligence, pilotage, exécution et livraison client dans une seule interface.

## Stack

- Frontend : Vite + React 18 + TypeScript + Tailwind
- Backend : Supabase (Postgres + Edge Functions)
- Hosting : Cloudflare Pages
- Domain : app.strateis.co

## Architecture

Deux sections principales :

- **Intelligence** — monitoring, veille, indicateurs temps réel
- **Workspace** — outils de gestion, consulting, opérations

Toutes les tables backend sont préfixées `monitor_` pour ne pas toucher aux tables IdeeLab existantes.

## Structure

- `src/` — Code React (construit par Replit Agent)
- `supabase/functions/monitor-ingest/` — Point d'entrée unique des collecteurs
- `supabase/functions/monitor-fetch/` — Endpoint agrégé pour le frontend
- `supabase/migrations/` — Schémas SQL
- `docs/INGESTION.md` — Schémas de payloads pour monitor-ingest

## Développement

```bash
cp .env.example .env
# Remplir VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

## Déploiement

Push sur `main` déclenche un build Cloudflare Pages automatique.

### Supabase — Migrations

Exécuter `supabase/migrations/001_strateis_app_foundations.sql` via le SQL Editor Supabase (projet `ajmfiddqmjhsrqynwpkg`).

### Supabase — Edge Functions

```bash
npx supabase functions deploy monitor-ingest --project-ref ajmfiddqmjhsrqynwpkg --no-verify-jwt
npx supabase functions deploy monitor-fetch  --project-ref ajmfiddqmjhsrqynwpkg --no-verify-jwt
npx supabase secrets set STRATEIS_INGEST_KEY=strateis-ingest-2026-prod --project-ref ajmfiddqmjhsrqynwpkg
```

### Cloudflare Pages

1. Cloudflare Dashboard > Workers & Pages > Create > Pages > Connect to Git
2. Repo : `kheita/strateis-app`
3. Build : `npm run build` → output `dist` (Framework preset : Vite)
4. Env vars : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
5. Custom domain : `app.strateis.co`

## Ingestion de données

Les Edge Functions acceptent des données en POST. Voir [`docs/INGESTION.md`](docs/INGESTION.md) pour les schémas de payloads par catégorie.

---

© 2026 Strateis Partners SAS — Abidjan, Côte d'Ivoire
