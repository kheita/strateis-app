# Strateis App — Déploiement

Commit initial déjà créé localement. Les étapes ci-dessous requièrent tes credentials (GitHub, Supabase, Cloudflare).

## 1. Créer le repo GitHub et pousser

```bash
# Option A : via gh CLI
gh repo create kheita/strateis-app --private --source=. --remote=origin --push

# Option B : créer le repo manuellement sur github.com/new (private, nom: strateis-app)
# Puis pousser :
cd "C:/Users/hp/Documents/Claude/Strateis-app"
git push -u origin main
```

Le remote `origin` est déjà configuré sur `https://github.com/kheita/strateis-app.git`.

## 2. Supabase — Exécuter la migration

Ouvrir le SQL Editor du projet `ajmfiddqmjhsrqynwpkg` :
https://supabase.com/dashboard/project/ajmfiddqmjhsrqynwpkg/sql

Copier le contenu de `supabase/migrations/001_strateis_app_foundations.sql` et exécuter.

Vérifier après exécution :

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'monitor_%'
ORDER BY table_name;
-- Doit retourner 10 lignes : monitor_aeo_weekly, monitor_alerts, monitor_b2g_pipeline,
-- monitor_concurrents, monitor_feed_items, monitor_kpis_daily, monitor_ranking_weekly,
-- monitor_rdue_timeline, monitor_seo_daily, monitor_source_health

SELECT COUNT(*) FROM monitor_source_health;
-- Doit retourner 16
```

## 3. Supabase — Déployer les Edge Functions

```bash
cd "C:/Users/hp/Documents/Claude/Strateis-app"

# Login (première fois uniquement)
npx supabase login

# Link (première fois uniquement)
npx supabase link --project-ref ajmfiddqmjhsrqynwpkg

# Déployer
npx supabase functions deploy monitor-ingest --project-ref ajmfiddqmjhsrqynwpkg --no-verify-jwt
npx supabase functions deploy monitor-fetch  --project-ref ajmfiddqmjhsrqynwpkg --no-verify-jwt

# Secret
npx supabase secrets set STRATEIS_INGEST_KEY=strateis-ingest-2026-prod --project-ref ajmfiddqmjhsrqynwpkg
```

## 4. Tests de validation

Remplacer `<ANON_KEY>` par la clé anon du projet (Supabase > Settings > API).

```bash
# Test monitor-ingest
curl -X POST https://ajmfiddqmjhsrqynwpkg.supabase.co/functions/v1/monitor-ingest \
  -H "Content-Type: application/json" \
  -H "x-api-key: strateis-ingest-2026-prod" \
  -d '{
    "source": "routine-1-seo-monitor",
    "category": "seo_daily",
    "data": {
      "date": "2026-04-17",
      "ideelab_indexed": 127,
      "strateis_indexed": 34,
      "monitor_indexed": 12
    }
  }'
# Attendu : {"ok":true,...}

# Test monitor-fetch (status)
curl "https://ajmfiddqmjhsrqynwpkg.supabase.co/functions/v1/monitor-fetch?view=status" \
  -H "Authorization: Bearer <ANON_KEY>"

# Test monitor-fetch (dashboard)
curl "https://ajmfiddqmjhsrqynwpkg.supabase.co/functions/v1/monitor-fetch?view=dashboard" \
  -H "Authorization: Bearer <ANON_KEY>"
```

Les 3 requêtes doivent retourner 200.

## 5. Cloudflare Pages

1. https://dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git
2. Sélectionner `kheita/strateis-app`
3. Build configuration :
   - Framework preset : **Vite**
   - Build command : `npm run build`
   - Build output directory : `dist`
4. Variables d'environnement (Production + Preview) :
   - `VITE_SUPABASE_URL` = `https://ajmfiddqmjhsrqynwpkg.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = clé anon du projet
5. Save & Deploy
6. Custom domains → Set up a custom domain → `app.strateis.co`
   (Cloudflare ajoute automatiquement le CNAME dans la zone `strateis.co`)
