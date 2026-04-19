-- Migration : ajout colonne is_seed sur toutes les tables monitor_*
-- Objectif : permettre seeding discipliné en prod avec cleanup trivial
-- Date : 2026-04-19
-- Ticket : is_seed + seed taggé Dashboard Intelligence

BEGIN;

ALTER TABLE public.monitor_kpis_daily       ADD COLUMN is_seed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.monitor_b2g_pipeline     ADD COLUMN is_seed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.monitor_seo_daily        ADD COLUMN is_seed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.monitor_ranking_weekly   ADD COLUMN is_seed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.monitor_aeo_weekly       ADD COLUMN is_seed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.monitor_feed_items       ADD COLUMN is_seed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.monitor_source_health    ADD COLUMN is_seed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.monitor_concurrents      ADD COLUMN is_seed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.monitor_rdue_timeline    ADD COLUMN is_seed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.monitor_alerts           ADD COLUMN is_seed BOOLEAN NOT NULL DEFAULT FALSE;

-- Index partiels sur les tables à haute lecture pour isoler les rows live du bruit seed.
-- Colonnes de tri temporel vérifiées contre supabase/migrations/001_strateis_app_foundations.sql :
--   monitor_kpis_daily.date        (DATE NOT NULL UNIQUE)
--   monitor_feed_items.published_at (TIMESTAMPTZ)
--   monitor_seo_daily.date         (DATE NOT NULL UNIQUE)

CREATE INDEX IF NOT EXISTS idx_monitor_kpis_daily_live
  ON public.monitor_kpis_daily (date DESC) WHERE is_seed = FALSE;

CREATE INDEX IF NOT EXISTS idx_monitor_feed_items_live
  ON public.monitor_feed_items (published_at DESC) WHERE is_seed = FALSE;

CREATE INDEX IF NOT EXISTS idx_monitor_seo_daily_live
  ON public.monitor_seo_daily (date DESC) WHERE is_seed = FALSE;

COMMIT;
