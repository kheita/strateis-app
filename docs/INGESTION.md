# Strateis App — Ingestion API

## Endpoint

```
POST https://ajmfiddqmjhsrqynwpkg.supabase.co/functions/v1/monitor-ingest
Headers:
  Content-Type: application/json
  x-api-key: <STRATEIS_INGEST_KEY>
```

## Enveloppe commune

Toute requête a la même enveloppe :

```json
{
  "source": "routine-1-seo-monitor",
  "category": "seo_daily",
  "timestamp": "2026-04-17T09:00:00Z",
  "data": { ... }
}
```

- `source` : identifiant du collecteur, doit correspondre à un `source_id` dans `monitor_source_health`
- `category` : aiguille le routage vers la bonne table (voir ci-dessous)
- `timestamp` : optionnel, ISO 8601
- `data` : payload spécifique à la catégorie

Chaque succès met à jour `monitor_source_health.last_success`. Chaque échec renseigne `last_failure` + `failure_message`.

## Catégories

### `seo_daily`

Upsert par `date`. Table : `monitor_seo_daily`.

```json
{
  "source": "routine-1-seo-monitor",
  "category": "seo_daily",
  "data": {
    "date": "2026-04-17",
    "ideelab_indexed": 127,
    "strateis_indexed": 34,
    "monitor_indexed": 12
  }
}
```

### `ranking_weekly`

Upsert par `week_start`. Table : `monitor_ranking_weekly`.

```json
{
  "source": "routine-10-ranking",
  "category": "ranking_weekly",
  "data": {
    "week_start": "2026-04-13",
    "ranking_score_ideelab": 6,
    "ranking_score_strateis": 4,
    "keywords_detail": [
      { "keyword": "ideation ia afrique", "position_ideelab": 3, "position_strateis": null }
    ]
  }
}
```

### `aeo_weekly`

Upsert par `week_start`. Table : `monitor_aeo_weekly`.

```json
{
  "source": "routine-9-aeo",
  "category": "aeo_weekly",
  "data": {
    "week_start": "2026-04-13",
    "visibility_score": 7,
    "queries_detail": [
      { "query": "plateforme ideation ia", "appears_chatgpt": true, "appears_perplexity": false, "appears_gemini": true }
    ]
  }
}
```

### `b2g_opportunity`

Upsert par `opportunity_name`. Table : `monitor_b2g_pipeline`.

```json
{
  "source": "routine-8-b2g",
  "category": "b2g_opportunity",
  "data": {
    "opportunity_name": "AO CDC-CI Digitalisation PME",
    "funder": "CDC-CI",
    "score": 8,
    "deadline": "2026-06-30",
    "amount_fcfa": 75000000,
    "status": "qualified",
    "description": "...",
    "source_url": "https://..."
  }
}
```

`status` ∈ `detected | qualified | applied | in_progress | won | lost`.

### `concurrent`

Upsert par `name`. Table : `monitor_concurrents`.

```json
{
  "source": "routine-2-veille-concurrence",
  "category": "concurrent",
  "data": {
    "name": "Acme Africa",
    "sector": "adtech",
    "positioning": "DSP regionale",
    "country": "CI",
    "last_activity_date": "2026-04-15",
    "last_activity_note": "Levee Serie A 4M$"
  }
}
```

### `rdue_event`

Insert (pas d'upsert — chaque event est une ligne). Table : `monitor_rdue_timeline`.

```json
{
  "source": "routine-7-rdue",
  "category": "rdue_event",
  "data": {
    "event_date": "2026-12-30",
    "event_name": "Fin grace period EUDR",
    "event_type": "deadline",
    "description": "...",
    "strateis_phase": "Phase 2 — onboarding pilotes",
    "next_action": "Cloturer 3 pilotes avant Q3"
  }
}
```

`event_type` ∈ `regulation | deadline | grace_period | enforcement | competitor_move | market_signal`.

### `feed_item`

Upsert par `url`. Table : `monitor_feed_items`.

```json
{
  "source": "routine-4-veille-africa",
  "category": "feed_item",
  "data": {
    "source_name": "TECHCRUNCH AFRICA",
    "feed_category": "africa_tech",
    "title": "Kenyan startup raises...",
    "url": "https://techcrunch.com/...",
    "summary": "...",
    "published_at": "2026-04-16T14:00:00Z",
    "tier": 2,
    "tags": ["fintech", "east-africa"]
  }
}
```

`feed_category` ∈ `africa_tech | ai_tech | regulatory | b2g | competition | other`. `tier` ∈ 1–4.

### `kpis_daily`

Upsert par `date`. Table : `monitor_kpis_daily`.

```json
{
  "source": "supabase-kpis-cron",
  "category": "kpis_daily",
  "data": {
    "date": "2026-04-17",
    "total_ideas": 1247,
    "active_projects": 38,
    "monthly_revenue": 8750000,
    "paystack_transactions_count": 42
  }
}
```

## Endpoint de lecture

```
GET https://ajmfiddqmjhsrqynwpkg.supabase.co/functions/v1/monitor-fetch?view=<view>
Headers:
  Authorization: Bearer <anon_or_user_jwt>
```

Vues disponibles :

| view | contenu |
|------|---------|
| `dashboard` | SEO 30j + KPIs + top 5 B2G + sources health |
| `status` | toutes les sources + alertes non-acknowledged |
| `feeds` | items filtrés par `category` (query param), `limit` optionnel |
| `b2g` | pipeline complet trié par deadline |
| `rdue` | timeline + concurrents EUDR |
| `seo` | 90j daily + 12 semaines ranking + 12 semaines AEO |

Exemples :

```
/monitor-fetch?view=dashboard
/monitor-fetch?view=feeds&category=africa_tech&limit=20
/monitor-fetch?view=feeds&category=ai_tech
```

Response cache : 60s (`Cache-Control: public, max-age=60`).

## Codes de réponse

| code | sens |
|------|------|
| 200 | OK |
| 400 | `category` ou `view` inconnu, ou payload incomplet |
| 401 | API key manquante/invalide (ingest uniquement) |
| 405 | Méthode non autorisée |
| 500 | Erreur serveur — détails dans `error.message` |
