-- =============================================================================
-- CLEANUP SEED DASHBOARD INTELLIGENCE
-- =============================================================================
-- Supprime toutes les rows taggées is_seed = TRUE sur les 10 tables monitor_*
-- À exécuter dès qu'un collecteur live est câblé pour la source correspondante
-- Exécution : SQL Editor Supabase, projet ajmfiddqmjhsrqynwpkg
-- =============================================================================

BEGIN;

DELETE FROM public.monitor_alerts          WHERE is_seed = TRUE;
DELETE FROM public.monitor_rdue_timeline   WHERE is_seed = TRUE;
DELETE FROM public.monitor_concurrents     WHERE is_seed = TRUE;
DELETE FROM public.monitor_feed_items      WHERE is_seed = TRUE;
DELETE FROM public.monitor_aeo_weekly      WHERE is_seed = TRUE;
DELETE FROM public.monitor_ranking_weekly  WHERE is_seed = TRUE;
DELETE FROM public.monitor_seo_daily       WHERE is_seed = TRUE;
DELETE FROM public.monitor_b2g_pipeline    WHERE is_seed = TRUE;
DELETE FROM public.monitor_kpis_daily      WHERE is_seed = TRUE;

-- Sur source_health : UPDATE inverse (les rows sont préexistantes, pas insérées)
UPDATE public.monitor_source_health
   SET is_seed = FALSE
 WHERE is_seed = TRUE;

COMMIT;
