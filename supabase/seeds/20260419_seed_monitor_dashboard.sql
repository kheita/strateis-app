-- =============================================================================
-- SEED DASHBOARD INTELLIGENCE — DONNÉES DE TRAVAIL
-- =============================================================================
-- Toutes les rows insérées ici portent is_seed = TRUE
-- Cleanup trivial : exécuter supabase/seeds/cleanup_seed_monitor.sql
-- Exécution : SQL Editor Supabase, projet ajmfiddqmjhsrqynwpkg
-- Date : 2026-04-19
--
-- ÉCARTS vs. schéma attendu (notés dans le prompt) :
--   - monitor_kpis_daily n'a pas de colonne mrr_ideelab_fcfa / pipeline_b2g_fcfa /
--     missions_actives / visibilite_pct. On utilise monthly_revenue (NUMERIC) pour
--     le MRR et on stocke pipeline/missions/visibilité dans raw_metrics (JSONB).
--     active_projects est aussi servi pour missions_actives (colonne native).
--   - monitor_b2g_pipeline.status est contraint (detected/qualified/applied/
--     in_progress/won/lost). Mapping : lead→detected, qualifié→qualified,
--     proposé→applied, signé→won, perdu→lost.
--   - monitor_b2g_pipeline n'a pas de colonne "dernière activité" distincte ;
--     on pose updated_at = NOW() pour toutes les rows (le trigger trg_b2g_updated
--     ne se déclenche pas en INSERT).
--   - monitor_ranking_weekly.week_start est UNIQUE → on ne peut pas avoir 4 rows
--     par semaine. Les 4 requêtes stratégiques sont packées dans keywords_detail
--     (JSONB), une row par semaine, soit 8 rows.
--   - monitor_concurrents n'a pas de colonne score/visibilité ; on stocke la
--     métrique dans last_activity_note avec un format parsable.
--   - monitor_rdue_timeline.event_type est contraint ; les milestones internes
--     de la campagne Strateis ne correspondent à aucune valeur strictement,
--     on utilise 'market_signal' comme catégorie la moins fausse, et on place le
--     statut ("planifié"/"en cours"/"à démarrer") dans strateis_phase.
--   - monitor_source_health : on ne fait QUE des UPDATE, aucun INSERT. Les 5
--     sources retenues (routine-1-seo-monitor, chrome-gsc-batch, paystack-webhook,
--     supabase-kpis-cron, chrome-linkedin-posting) matchent les 16 rows seedées
--     par 001_strateis_app_foundations.sql. "Cloudflare Pages" n'existe pas
--     comme source_id ; chrome-linkedin-posting a été retenu à la place.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. monitor_kpis_daily — 30 rows (2026-03-20 → 2026-04-18)
-- -----------------------------------------------------------------------------
-- MRR IdeeLab : 0 FCFA jusqu'au 2026-04-02, puis +49 900 FCFA (2026-04-03),
-- +49 900 (2026-04-07), +99 900 (2026-04-12), +49 900 (2026-04-16).
-- Final 2026-04-18 : 249 500 FCFA.
-- Pipeline B2G : 15 000 000 → 65 000 000 FCFA (bump +30 000 000 le 2026-04-05 RDUE).
-- Missions actives : 1 jusqu'au 2026-04-10, 2 ensuite.
-- Visibilité SEO : 8% → 22%.
INSERT INTO public.monitor_kpis_daily
  (date, total_ideas, active_projects, monthly_revenue, paystack_transactions_count, raw_metrics, source, is_seed)
VALUES
  ('2026-03-20', 1102, 1,      0,      0, '{"mrr_ideelab_fcfa":0,"pipeline_b2g_fcfa":15000000,"missions_actives":1,"visibilite_pct":8.0}'::jsonb,  'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-21', 1108, 1,      0,      0, '{"mrr_ideelab_fcfa":0,"pipeline_b2g_fcfa":15000000,"missions_actives":1,"visibilite_pct":8.2}'::jsonb,  'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-22', 1115, 1,      0,      0, '{"mrr_ideelab_fcfa":0,"pipeline_b2g_fcfa":15500000,"missions_actives":1,"visibilite_pct":8.5}'::jsonb,  'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-23', 1123, 1,      0,      0, '{"mrr_ideelab_fcfa":0,"pipeline_b2g_fcfa":15500000,"missions_actives":1,"visibilite_pct":9.0}'::jsonb,  'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-24', 1131, 1,      0,      0, '{"mrr_ideelab_fcfa":0,"pipeline_b2g_fcfa":16000000,"missions_actives":1,"visibilite_pct":9.6}'::jsonb,  'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-25', 1140, 1,      0,      0, '{"mrr_ideelab_fcfa":0,"pipeline_b2g_fcfa":17500000,"missions_actives":1,"visibilite_pct":10.1}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-26', 1148, 1,      0,      0, '{"mrr_ideelab_fcfa":0,"pipeline_b2g_fcfa":17500000,"missions_actives":1,"visibilite_pct":10.4}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-27', 1157, 1,      0,      0, '{"mrr_ideelab_fcfa":0,"pipeline_b2g_fcfa":18000000,"missions_actives":1,"visibilite_pct":11.0}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-28', 1165, 1,      0,      0, '{"mrr_ideelab_fcfa":0,"pipeline_b2g_fcfa":18000000,"missions_actives":1,"visibilite_pct":11.3}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-29', 1174, 1,      0,      0, '{"mrr_ideelab_fcfa":0,"pipeline_b2g_fcfa":19000000,"missions_actives":1,"visibilite_pct":12.0}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-30', 1185, 1,      0,      0, '{"mrr_ideelab_fcfa":0,"pipeline_b2g_fcfa":20000000,"missions_actives":1,"visibilite_pct":12.5}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-31', 1196, 1,      0,      0, '{"mrr_ideelab_fcfa":0,"pipeline_b2g_fcfa":22000000,"missions_actives":1,"visibilite_pct":13.1}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-01', 1208, 1,      0,      0, '{"mrr_ideelab_fcfa":0,"pipeline_b2g_fcfa":22000000,"missions_actives":1,"visibilite_pct":13.6}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-02', 1219, 1,      0,      0, '{"mrr_ideelab_fcfa":0,"pipeline_b2g_fcfa":23500000,"missions_actives":1,"visibilite_pct":14.0}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-03', 1231, 1,  49900,      1, '{"mrr_ideelab_fcfa":49900,"pipeline_b2g_fcfa":24000000,"missions_actives":1,"visibilite_pct":14.4}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-04', 1243, 1,  49900,      1, '{"mrr_ideelab_fcfa":49900,"pipeline_b2g_fcfa":24500000,"missions_actives":1,"visibilite_pct":15.0}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-05', 1256, 1,  49900,      1, '{"mrr_ideelab_fcfa":49900,"pipeline_b2g_fcfa":54500000,"missions_actives":1,"visibilite_pct":15.5}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-06', 1270, 1,  49900,      1, '{"mrr_ideelab_fcfa":49900,"pipeline_b2g_fcfa":55000000,"missions_actives":1,"visibilite_pct":16.2}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-07', 1284, 1,  99800,      2, '{"mrr_ideelab_fcfa":99800,"pipeline_b2g_fcfa":55500000,"missions_actives":1,"visibilite_pct":16.8}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-08', 1298, 1,  99800,      2, '{"mrr_ideelab_fcfa":99800,"pipeline_b2g_fcfa":57000000,"missions_actives":1,"visibilite_pct":17.2}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-09', 1313, 1,  99800,      2, '{"mrr_ideelab_fcfa":99800,"pipeline_b2g_fcfa":58000000,"missions_actives":1,"visibilite_pct":17.8}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-10', 1328, 1,  99800,      2, '{"mrr_ideelab_fcfa":99800,"pipeline_b2g_fcfa":59000000,"missions_actives":1,"visibilite_pct":18.2}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-11', 1344, 2,  99800,      2, '{"mrr_ideelab_fcfa":99800,"pipeline_b2g_fcfa":60000000,"missions_actives":2,"visibilite_pct":18.6}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-12', 1361, 2, 199700,      3, '{"mrr_ideelab_fcfa":199700,"pipeline_b2g_fcfa":61000000,"missions_actives":2,"visibilite_pct":19.1}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-13', 1378, 2, 199700,      3, '{"mrr_ideelab_fcfa":199700,"pipeline_b2g_fcfa":62000000,"missions_actives":2,"visibilite_pct":19.6}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-14', 1396, 2, 199700,      3, '{"mrr_ideelab_fcfa":199700,"pipeline_b2g_fcfa":62500000,"missions_actives":2,"visibilite_pct":20.3}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-15', 1415, 2, 199700,      3, '{"mrr_ideelab_fcfa":199700,"pipeline_b2g_fcfa":63000000,"missions_actives":2,"visibilite_pct":20.8}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-16', 1435, 2, 249600,      4, '{"mrr_ideelab_fcfa":249600,"pipeline_b2g_fcfa":64000000,"missions_actives":2,"visibilite_pct":21.1}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-17', 1456, 2, 249600,      4, '{"mrr_ideelab_fcfa":249600,"pipeline_b2g_fcfa":64500000,"missions_actives":2,"visibilite_pct":21.6}'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-18', 1478, 2, 249500,      4, '{"mrr_ideelab_fcfa":249500,"pipeline_b2g_fcfa":65000000,"missions_actives":2,"visibilite_pct":22.0}'::jsonb, 'seed-dashboard-2026-04-19', TRUE)
ON CONFLICT (date) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. monitor_b2g_pipeline — 9 rows (mix de lead/qualified/applied/won/lost)
-- -----------------------------------------------------------------------------
INSERT INTO public.monitor_b2g_pipeline
  (opportunity_name, funder, score, deadline, amount_fcfa, status, description, source_url, source, detected_at, updated_at, is_seed)
VALUES
  ('Conseil Café-Cacao (RDUE)',          'Conseil Café-Cacao',        8, '2026-06-30',  8000000, 'applied',    'Pack conformité RDUE cacao — proposition Standard envoyée', 'https://conseilcafecacao.ci', 'seed-dashboard-2026-04-19', '2026-04-17 09:00:00+00', '2026-04-17 09:00:00+00', TRUE),
  ('Ivoire Win (accélération distribution)', 'Ivoire Win',             6, '2026-07-15',  3500000, 'qualified',  'Mission accélération distribution — qualif en cours',       'https://ivoirewin.ci',       'seed-dashboard-2026-04-19', '2026-04-16 11:00:00+00', '2026-04-16 11:00:00+00', TRUE),
  ('CDC-CI Capital',                     'CDC-CI Capital',            7, '2026-08-15', 12000000, 'detected',   'Lead entrant sur programme de structuration PME',           'https://cdcci.ci',           'seed-dashboard-2026-04-19', '2026-04-14 10:30:00+00', '2026-04-14 10:30:00+00', TRUE),
  ('ANADER (RDUE Plus)',                 'ANADER',                    7, '2026-07-10',  3500000, 'qualified',  'Variante Pack Plus RDUE — interlocuteur identifié',         'https://anader.ci',          'seed-dashboard-2026-04-19', '2026-04-15 14:00:00+00', '2026-04-15 14:00:00+00', TRUE),
  ('Port Autonome Abidjan',              'Port Autonome Abidjan',     5, '2026-09-30', 25000000, 'detected',   'Lead froid — initiative de digitalisation portuaire',       'https://paa.ci',             'seed-dashboard-2026-04-19', '2026-04-11 08:15:00+00', '2026-04-11 08:15:00+00', TRUE),
  ('Timbuktoo AgriTech',                 'Timbuktoo',                 9, '2026-04-14',   750000, 'won',        'Mission courte signée — sprint AgriTech',                   'https://timbuktoo.unctad.org','seed-dashboard-2026-04-19', '2026-04-14 17:20:00+00', '2026-04-14 17:20:00+00', TRUE),
  ('CI-PME',                             'CI-PME',                    6, '2026-08-31',  5500000, 'applied',    'Proposition envoyée — accompagnement PME 12 semaines',      'https://cipme.ci',           'seed-dashboard-2026-04-19', '2026-04-10 09:45:00+00', '2026-04-10 09:45:00+00', TRUE),
  ('BAD (note conceptuelle)',            'Banque Africaine de Développement', 6, '2026-10-15', 18000000, 'detected', 'Note conceptuelle en préparation — guichet digital',      'https://afdb.org',           'seed-dashboard-2026-04-19', '2026-04-08 13:00:00+00', '2026-04-08 13:00:00+00', TRUE),
  ('AFD (appel à projets)',              'Agence Française de Développement', 4, '2026-03-31',  6000000, 'lost',     'Appel à projets clos — non retenu en shortlist',          'https://afd.fr',             'seed-dashboard-2026-04-19', '2026-03-28 16:40:00+00', '2026-03-28 16:40:00+00', TRUE)
ON CONFLICT (opportunity_name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. monitor_seo_daily — 30 rows (2026-03-20 → 2026-04-18)
-- -----------------------------------------------------------------------------
-- Colonnes schéma : ideelab_indexed / strateis_indexed / monitor_indexed (INT)
-- raw_data (JSONB) reçoit clicks / impressions / avg_position / ctr pour
-- compatibilité avec les accesseurs frontend (pickSeoPages, etc.).
INSERT INTO public.monitor_seo_daily
  (date, ideelab_indexed, strateis_indexed, monitor_indexed, source, raw_data, is_seed)
VALUES
  ('2026-03-20',  92, 18,  6, 'seed-dashboard-2026-04-19', '{"clicks":2,"impressions":85,"avg_position":52.0,"ctr":0.024}'::jsonb,  TRUE),
  ('2026-03-21',  93, 18,  6, 'seed-dashboard-2026-04-19', '{"clicks":3,"impressions":110,"avg_position":51.2,"ctr":0.027}'::jsonb, TRUE),
  ('2026-03-22',  95, 19,  6, 'seed-dashboard-2026-04-19', '{"clicks":3,"impressions":128,"avg_position":50.5,"ctr":0.023}'::jsonb, TRUE),
  ('2026-03-23',  97, 19,  7, 'seed-dashboard-2026-04-19', '{"clicks":4,"impressions":162,"avg_position":49.8,"ctr":0.025}'::jsonb, TRUE),
  ('2026-03-24',  99, 20,  7, 'seed-dashboard-2026-04-19', '{"clicks":5,"impressions":198,"avg_position":48.9,"ctr":0.025}'::jsonb, TRUE),
  ('2026-03-25', 101, 20,  7, 'seed-dashboard-2026-04-19', '{"clicks":7,"impressions":240,"avg_position":47.5,"ctr":0.029}'::jsonb, TRUE),
  ('2026-03-26', 103, 21,  8, 'seed-dashboard-2026-04-19', '{"clicks":8,"impressions":285,"avg_position":46.8,"ctr":0.028}'::jsonb, TRUE),
  ('2026-03-27', 105, 21,  8, 'seed-dashboard-2026-04-19', '{"clicks":9,"impressions":320,"avg_position":45.9,"ctr":0.028}'::jsonb, TRUE),
  ('2026-03-28', 107, 22,  8, 'seed-dashboard-2026-04-19', '{"clicks":10,"impressions":370,"avg_position":45.2,"ctr":0.027}'::jsonb, TRUE),
  ('2026-03-29', 109, 22,  9, 'seed-dashboard-2026-04-19', '{"clicks":12,"impressions":425,"avg_position":44.1,"ctr":0.028}'::jsonb, TRUE),
  ('2026-03-30', 111, 23,  9, 'seed-dashboard-2026-04-19', '{"clicks":14,"impressions":490,"avg_position":43.0,"ctr":0.029}'::jsonb, TRUE),
  ('2026-03-31', 113, 23,  9, 'seed-dashboard-2026-04-19', '{"clicks":15,"impressions":540,"avg_position":42.1,"ctr":0.028}'::jsonb, TRUE),
  ('2026-04-01', 115, 24, 10, 'seed-dashboard-2026-04-19', '{"clicks":17,"impressions":605,"avg_position":41.3,"ctr":0.028}'::jsonb, TRUE),
  ('2026-04-02', 117, 24, 10, 'seed-dashboard-2026-04-19', '{"clicks":19,"impressions":680,"avg_position":40.0,"ctr":0.028}'::jsonb, TRUE),
  ('2026-04-03', 119, 25, 10, 'seed-dashboard-2026-04-19', '{"clicks":21,"impressions":760,"avg_position":39.2,"ctr":0.028}'::jsonb, TRUE),
  ('2026-04-04', 121, 25, 11, 'seed-dashboard-2026-04-19', '{"clicks":23,"impressions":840,"avg_position":38.4,"ctr":0.027}'::jsonb, TRUE),
  ('2026-04-05', 123, 26, 11, 'seed-dashboard-2026-04-19', '{"clicks":25,"impressions":925,"avg_position":37.5,"ctr":0.027}'::jsonb, TRUE),
  ('2026-04-06', 124, 26, 11, 'seed-dashboard-2026-04-19', '{"clicks":27,"impressions":1010,"avg_position":36.7,"ctr":0.027}'::jsonb, TRUE),
  ('2026-04-07', 126, 27, 12, 'seed-dashboard-2026-04-19', '{"clicks":29,"impressions":1095,"avg_position":36.0,"ctr":0.026}'::jsonb, TRUE),
  ('2026-04-08', 128, 27, 12, 'seed-dashboard-2026-04-19', '{"clicks":31,"impressions":1180,"avg_position":35.3,"ctr":0.026}'::jsonb, TRUE),
  ('2026-04-09', 130, 28, 12, 'seed-dashboard-2026-04-19', '{"clicks":33,"impressions":1280,"avg_position":34.6,"ctr":0.026}'::jsonb, TRUE),
  ('2026-04-10', 132, 28, 13, 'seed-dashboard-2026-04-19', '{"clicks":35,"impressions":1370,"avg_position":34.0,"ctr":0.026}'::jsonb, TRUE),
  ('2026-04-11', 134, 29, 13, 'seed-dashboard-2026-04-19', '{"clicks":37,"impressions":1450,"avg_position":33.5,"ctr":0.026}'::jsonb, TRUE),
  ('2026-04-12', 136, 29, 13, 'seed-dashboard-2026-04-19', '{"clicks":39,"impressions":1530,"avg_position":33.0,"ctr":0.025}'::jsonb, TRUE),
  ('2026-04-13', 138, 30, 14, 'seed-dashboard-2026-04-19', '{"clicks":40,"impressions":1605,"avg_position":32.6,"ctr":0.025}'::jsonb, TRUE),
  ('2026-04-14', 140, 30, 14, 'seed-dashboard-2026-04-19', '{"clicks":42,"impressions":1680,"avg_position":32.2,"ctr":0.025}'::jsonb, TRUE),
  ('2026-04-15', 141, 31, 14, 'seed-dashboard-2026-04-19', '{"clicks":43,"impressions":1720,"avg_position":31.8,"ctr":0.025}'::jsonb, TRUE),
  ('2026-04-16', 143, 31, 15, 'seed-dashboard-2026-04-19', '{"clicks":44,"impressions":1760,"avg_position":31.5,"ctr":0.025}'::jsonb, TRUE),
  ('2026-04-17', 145, 32, 15, 'seed-dashboard-2026-04-19', '{"clicks":44,"impressions":1780,"avg_position":31.2,"ctr":0.025}'::jsonb, TRUE),
  ('2026-04-18', 147, 32, 15, 'seed-dashboard-2026-04-19', '{"clicks":45,"impressions":1800,"avg_position":31.0,"ctr":0.025}'::jsonb, TRUE)
ON CONFLICT (date) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. monitor_ranking_weekly — 8 rows (semaines 09 à 16 de 2026)
-- -----------------------------------------------------------------------------
-- keywords_detail (JSONB) regroupe les 4 requêtes stratégiques par semaine,
-- chacune avec sa position moyenne sur ideelab.io et strateis.co.
-- Progression : ~position 60 → ~22.
INSERT INTO public.monitor_ranking_weekly
  (week_start, ranking_score_ideelab, ranking_score_strateis, keywords_detail, source, is_seed)
VALUES
  ('2026-02-23', 0, 0, '[
    {"keyword":"générateur business plan afrique","position_ideelab":62,"position_strateis":null},
    {"keyword":"conseil stratégique côte d''ivoire","position_ideelab":null,"position_strateis":58},
    {"keyword":"RDUE cacao conformité","position_ideelab":null,"position_strateis":65},
    {"keyword":"bureau études startup afrique francophone","position_ideelab":55,"position_strateis":68}
  ]'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-02', 0, 0, '[
    {"keyword":"générateur business plan afrique","position_ideelab":57,"position_strateis":null},
    {"keyword":"conseil stratégique côte d''ivoire","position_ideelab":null,"position_strateis":52},
    {"keyword":"RDUE cacao conformité","position_ideelab":null,"position_strateis":59},
    {"keyword":"bureau études startup afrique francophone","position_ideelab":51,"position_strateis":62}
  ]'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-09', 0, 0, '[
    {"keyword":"générateur business plan afrique","position_ideelab":51,"position_strateis":null},
    {"keyword":"conseil stratégique côte d''ivoire","position_ideelab":null,"position_strateis":46},
    {"keyword":"RDUE cacao conformité","position_ideelab":null,"position_strateis":52},
    {"keyword":"bureau études startup afrique francophone","position_ideelab":46,"position_strateis":55}
  ]'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-16', 0, 0, '[
    {"keyword":"générateur business plan afrique","position_ideelab":45,"position_strateis":null},
    {"keyword":"conseil stratégique côte d''ivoire","position_ideelab":null,"position_strateis":41},
    {"keyword":"RDUE cacao conformité","position_ideelab":null,"position_strateis":46},
    {"keyword":"bureau études startup afrique francophone","position_ideelab":41,"position_strateis":48}
  ]'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-23', 0, 0, '[
    {"keyword":"générateur business plan afrique","position_ideelab":39,"position_strateis":null},
    {"keyword":"conseil stratégique côte d''ivoire","position_ideelab":null,"position_strateis":36},
    {"keyword":"RDUE cacao conformité","position_ideelab":null,"position_strateis":40},
    {"keyword":"bureau études startup afrique francophone","position_ideelab":36,"position_strateis":42}
  ]'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-30', 1, 0, '[
    {"keyword":"générateur business plan afrique","position_ideelab":33,"position_strateis":null},
    {"keyword":"conseil stratégique côte d''ivoire","position_ideelab":null,"position_strateis":31},
    {"keyword":"RDUE cacao conformité","position_ideelab":null,"position_strateis":34},
    {"keyword":"bureau études startup afrique francophone","position_ideelab":30,"position_strateis":37}
  ]'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-06', 1, 1, '[
    {"keyword":"générateur business plan afrique","position_ideelab":28,"position_strateis":null},
    {"keyword":"conseil stratégique côte d''ivoire","position_ideelab":null,"position_strateis":26},
    {"keyword":"RDUE cacao conformité","position_ideelab":null,"position_strateis":29},
    {"keyword":"bureau études startup afrique francophone","position_ideelab":25,"position_strateis":31}
  ]'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-13', 2, 1, '[
    {"keyword":"générateur business plan afrique","position_ideelab":23,"position_strateis":null},
    {"keyword":"conseil stratégique côte d''ivoire","position_ideelab":null,"position_strateis":22},
    {"keyword":"RDUE cacao conformité","position_ideelab":null,"position_strateis":24},
    {"keyword":"bureau études startup afrique francophone","position_ideelab":21,"position_strateis":26}
  ]'::jsonb, 'seed-dashboard-2026-04-19', TRUE)
ON CONFLICT (week_start) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. monitor_aeo_weekly — 12 rows (semaines 05 à 16 de 2026)
-- -----------------------------------------------------------------------------
-- Score : 0 sur les 4 premières semaines, puis progression linéaire 2 → 18.
INSERT INTO public.monitor_aeo_weekly
  (week_start, visibility_score, queries_detail, source, is_seed)
VALUES
  ('2026-01-26',  0, '{"panel_size":13,"mentions":0}'::jsonb,  'seed-dashboard-2026-04-19', TRUE),
  ('2026-02-02',  0, '{"panel_size":13,"mentions":0}'::jsonb,  'seed-dashboard-2026-04-19', TRUE),
  ('2026-02-09',  0, '{"panel_size":13,"mentions":0}'::jsonb,  'seed-dashboard-2026-04-19', TRUE),
  ('2026-02-16',  0, '{"panel_size":13,"mentions":0}'::jsonb,  'seed-dashboard-2026-04-19', TRUE),
  ('2026-02-23',  2, '{"panel_size":13,"mentions":2}'::jsonb,  'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-02',  4, '{"panel_size":13,"mentions":4}'::jsonb,  'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-09',  6, '{"panel_size":13,"mentions":5}'::jsonb,  'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-16',  8, '{"panel_size":13,"mentions":6}'::jsonb,  'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-23', 11, '{"panel_size":13,"mentions":7}'::jsonb,  'seed-dashboard-2026-04-19', TRUE),
  ('2026-03-30', 13, '{"panel_size":13,"mentions":8}'::jsonb,  'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-06', 16, '{"panel_size":13,"mentions":9}'::jsonb,  'seed-dashboard-2026-04-19', TRUE),
  ('2026-04-13', 18, '{"panel_size":13,"mentions":10}'::jsonb, 'seed-dashboard-2026-04-19', TRUE)
ON CONFLICT (week_start) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 6. monitor_feed_items — 20 rows (5 par catégorie)
-- -----------------------------------------------------------------------------
INSERT INTO public.monitor_feed_items
  (source, category, title, url, summary, published_at, tier, tags, collector, is_seed)
VALUES
  -- AFRICA TECH
  ('TECHCABAL',       'africa_tech', 'Wave lève 130M$ en extension Series B',                         'https://techcabal.com/seed-2026-04-18-wave-series-b',           'Extension majeure de la Series B — valorisation consolidée à 1.7Md$.',                                  '2026-04-18 08:30:00+00', 2, '["fintech","west-africa","funding"]'::jsonb,     'seed-dashboard-2026-04-19', TRUE),
  ('REST OF WORLD',   'africa_tech', 'Flutterwave prépare son IPO au Nigéria pour 2027',              'https://restofworld.org/seed-2026-04-17-flutterwave-ipo',       'Roadshow prévu fin 2026. Premier cas d''IPO tech majeure au NGX.',                                      '2026-04-17 14:20:00+00', 2, '["fintech","nigeria","ipo"]'::jsonb,             'seed-dashboard-2026-04-19', TRUE),
  ('ECOFIN AGENCY',   'africa_tech', 'Chari acquiert une fintech égyptienne pour s''étendre au MENA', 'https://ecofinagency.com/seed-2026-04-16-chari-mena',           'Opération non divulguée. Positionnement B2B cross-border.',                                            '2026-04-16 10:15:00+00', 3, '["fintech","mena","maroc"]'::jsonb,              'seed-dashboard-2026-04-19', TRUE),
  ('JEUNE AFRIQUE',   'africa_tech', 'MTN lance MoMo Pay en mode off-grid au Ghana',                  'https://jeuneafrique.com/seed-2026-04-14-mtn-offgrid',          'Déploiement USSD en zone rurale — 2.1M utilisateurs ciblés.',                                           '2026-04-14 09:00:00+00', 3, '["fintech","ghana","mobile-money"]'::jsonb,      'seed-dashboard-2026-04-19', TRUE),
  ('BLOOMBERG AFRICA','africa_tech', 'Le Nigéria approuve un cadre pour les stablecoins locaux',      'https://bloomberg.com/seed-2026-04-12-ng-stablecoin',           'Cadre pilote de 12 mois — 4 émetteurs agréés.',                                                         '2026-04-12 16:45:00+00', 1, '["crypto","nigeria","regulation"]'::jsonb,       'seed-dashboard-2026-04-19', TRUE),
  -- AI TECH
  ('TECHCRUNCH',      'ai_tech',     'Anthropic lance Claude Opus 4.7 avec contexte 1M tokens',       'https://techcrunch.com/seed-2026-04-18-claude-opus-47',         'Fenêtre de contexte portée à 1M tokens. Prix en baisse de 15%.',                                        '2026-04-18 12:00:00+00', 2, '["llm","anthropic","context"]'::jsonb,           'seed-dashboard-2026-04-19', TRUE),
  ('THE VERGE',       'ai_tech',     'OpenAI annonce GPT-5.5 orienté agents autonomes',               'https://theverge.com/seed-2026-04-17-gpt55',                    'Focus sur les agents outillés. Mode "long horizon" de 72h.',                                            '2026-04-17 17:40:00+00', 2, '["llm","openai","agents"]'::jsonb,               'seed-dashboard-2026-04-19', TRUE),
  ('LE MONDE',        'ai_tech',     'Mistral AI ouvre un bureau à Abidjan pour l''Afrique francophone','https://lemonde.fr/seed-2026-04-15-mistral-abidjan',           'Annonce lors du Next Horizons Summit. 20 recrutements prévus.',                                         '2026-04-15 11:30:00+00', 2, '["llm","mistral","afrique","abidjan"]'::jsonb,   'seed-dashboard-2026-04-19', TRUE),
  ('ARXIV',           'ai_tech',     'Google DeepMind démontre Gemini Ultra 2 sur benchmarks raisonnement','https://arxiv.org/seed-2026-04-13-gemini-ultra-2',          'Gains significatifs sur ARC-AGI et MATH-Olympiad.',                                                     '2026-04-13 20:10:00+00', 1, '["llm","google","benchmark"]'::jsonb,            'seed-dashboard-2026-04-19', TRUE),
  ('PAPERS WITH CODE','ai_tech',     'Les LLM passent le seuil des 50% sur SWE-Bench Pro',            'https://paperswithcode.com/seed-2026-04-12-swe-bench-pro',      'Premier benchmark "coding agents" à franchir 50% en production.',                                       '2026-04-12 08:00:00+00', 2, '["llm","coding","benchmark"]'::jsonb,            'seed-dashboard-2026-04-19', TRUE),
  -- B2G (feed.category = 'b2g')
  ('COMMISSION EUROPEENNE', 'b2g',   'L''UE confirme l''entrée en vigueur du règlement RDUE pour décembre 2026','https://ec.europa.eu/seed-2026-04-18-rdue-confirmation', 'Confirmation officielle de l''échéance — pas de nouveau report.',                                      '2026-04-18 15:00:00+00', 1, '["rdue","eu","cocoa"]'::jsonb,                   'seed-dashboard-2026-04-19', TRUE),
  ('AFRICAN BUSINESS','b2g',         'La BAD lance un fonds de 200M$ pour la transformation digitale','https://african.business/seed-2026-04-16-bad-200m',              'Fenêtre de 2 ans. Focus sur structuration régionale des PME.',                                           '2026-04-16 13:25:00+00', 2, '["bad","digital","funding"]'::jsonb,             'seed-dashboard-2026-04-19', TRUE),
  ('FRATMAT',         'b2g',         'Côte d''Ivoire : le PND 2026-2030 priorise l''économie numérique','https://fratmat.info/seed-2026-04-15-pnd-numerique',           'Enveloppe prévue : 450Md FCFA sur 5 ans.',                                                              '2026-04-15 07:45:00+00', 2, '["côte-divoire","pnd","digital"]'::jsonb,        'seed-dashboard-2026-04-19', TRUE),
  ('AFD.FR',          'b2g',         'L''AFD ouvre un appel à projets MVP souverain Afrique francophone','https://afd.fr/seed-2026-04-13-aap-mvp-souverain',           'Dépôt de candidatures jusqu''au 2026-06-30.',                                                           '2026-04-13 10:00:00+00', 1, '["afd","aap","mvp"]'::jsonb,                     'seed-dashboard-2026-04-19', TRUE),
  ('REUTERS AFRICA',  'b2g',         'La CEDEAO harmonise les règles de data residency',              'https://reuters.com/seed-2026-04-12-cedeao-data',               'Accord politique de principe sur un corpus commun.',                                                    '2026-04-12 11:55:00+00', 1, '["cedeao","data-residency","regulation"]'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  -- COMPETITION (feed.category = 'competition')
  ('LINKEDIN',        'competition', 'Performances Group recrute 15 consultants à Abidjan',           'https://linkedin.com/seed-2026-04-18-performances-recrute',     'Vague de recrutements seniors — practice B2G/B2B.',                                                     '2026-04-18 09:20:00+00', 4, '["performances","recrutement","abidjan"]'::jsonb,'seed-dashboard-2026-04-19', TRUE),
  ('JEUNE AFRIQUE',   'competition', 'StratMinds annonce un partenariat avec McKinsey Afrique',       'https://jeuneafrique.com/seed-2026-04-17-stratminds-mckinsey',  'Accord de co-sourcing sur les dossiers Tier-1.',                                                        '2026-04-17 18:10:00+00', 3, '["stratminds","mckinsey","partnership"]'::jsonb, 'seed-dashboard-2026-04-19', TRUE),
  ('LES ECHOS',       'competition', 'Roland Berger ouvre un practice Climate à Dakar',               'https://lesechos.fr/seed-2026-04-15-rb-climate-dakar',          '5 partners rejoignent l''équipe — focus transition juste.',                                             '2026-04-15 14:50:00+00', 2, '["roland-berger","climate","dakar"]'::jsonb,     'seed-dashboard-2026-04-19', TRUE),
  ('DALBERG.COM',     'competition', 'Dalberg publie son rapport annuel sur l''impact en Afrique de l''Ouest','https://dalberg.com/seed-2026-04-14-report-west-africa', '136 pages — benchmark de référence sur le secteur.',                                                    '2026-04-14 12:35:00+00', 2, '["dalberg","impact","report"]'::jsonb,           'seed-dashboard-2026-04-19', TRUE),
  ('ABIDJAN.NET',     'competition', 'Deloitte CI recrute un associé Digital Transformation',         'https://abidjan.net/seed-2026-04-12-deloitte-associe',          'Ouverture d''un siège local permanent — concurrence directe.',                                          '2026-04-12 10:05:00+00', 4, '["deloitte","recrutement","abidjan"]'::jsonb,    'seed-dashboard-2026-04-19', TRUE)
ON CONFLICT (url) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 7. monitor_source_health — UPDATE de 5 rows existantes (pas INSERT)
-- -----------------------------------------------------------------------------
-- Sources retenues (mapping vs. le prompt) :
--   routine-1-seo-monitor     ← "GSC strateis.co"
--   chrome-gsc-batch          ← "GSC ideelab.io"
--   supabase-kpis-cron        ← "Supabase REST API"
--   paystack-webhook          ← "Paystack API"
--   chrome-linkedin-posting   ← (fallback "Cloudflare Pages" n'existe pas)
UPDATE public.monitor_source_health
   SET last_success = NOW(),
       last_failure = NULL,
       failure_message = NULL,
       uptime_7d = 100.0,
       is_seed = TRUE
 WHERE source_id IN (
   'routine-1-seo-monitor',
   'chrome-gsc-batch',
   'supabase-kpis-cron',
   'paystack-webhook',
   'chrome-linkedin-posting'
 );

-- -----------------------------------------------------------------------------
-- 8. monitor_concurrents — 5 rows
-- -----------------------------------------------------------------------------
-- Score visibilité stocké dans last_activity_note avec format parsable
-- "visibility_score=<N>/100 | <note>".
INSERT INTO public.monitor_concurrents
  (name, sector, positioning, country, last_activity_date, last_activity_note, source, is_seed)
VALUES
  ('Performances Group',      'conseil', 'Cabinet panafricain full-service tier 1',       'CI', '2026-04-18', 'visibility_score=72/100 | Vague de recrutements seniors sur B2G/B2B',           'seed-dashboard-2026-04-19', TRUE),
  ('StratMinds',              'conseil', 'Boutique régionale tech-driven',                 'CI', '2026-04-17', 'visibility_score=58/100 | Annonce partenariat McKinsey Afrique',              'seed-dashboard-2026-04-19', TRUE),
  ('Roland Berger Afrique',   'conseil', 'Global tier 1 — ouverture practice Climate',     'SN', '2026-04-15', 'visibility_score=81/100 | Nouveau practice Climate à Dakar, 5 partners',      'seed-dashboard-2026-04-19', TRUE),
  ('Dalberg Advisors',        'conseil', 'Impact advisory référent sur l''Afrique',        'SN', '2026-04-14', 'visibility_score=88/100 | Rapport annuel impact Afrique de l''Ouest publié', 'seed-dashboard-2026-04-19', TRUE),
  ('Deloitte CI',             'conseil', 'Big 4 — pousse Digital Transformation',          'CI', '2026-04-12', 'visibility_score=76/100 | Recrutement associé Digital Transformation',        'seed-dashboard-2026-04-19', TRUE)
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 9. monitor_rdue_timeline — 5 rows (milestones campagne Strateis RDUE)
-- -----------------------------------------------------------------------------
-- event_type = 'market_signal' (catégorie CHECK la moins fausse pour des
-- milestones internes). Le statut ("planifié"/"en cours"/"à démarrer") est
-- stocké dans strateis_phase.
INSERT INTO public.monitor_rdue_timeline
  (event_date, event_name, event_type, description, strateis_phase, next_action, source, is_seed)
VALUES
  ('2026-05-06', 'Lancement campagne LinkedIn RDUE',           'market_signal', 'Activation campagne sponsored + séquence outbound SDR',      'planifié',    'Finaliser copy + visuels J-7',                         'seed-dashboard-2026-04-19', TRUE),
  ('2026-05-13', 'Publication guide RDUE cacao (12 pages)',    'market_signal', 'Guide téléchargeable positionné comme lead magnet',          'en cours',    'Relecture juridique + design final',                   'seed-dashboard-2026-04-19', TRUE),
  ('2026-05-20', 'Webinaire Conseil Café-Cacao',                'market_signal', 'Webinaire co-organisé avec le Conseil — cible 120 inscrits', 'planifié',    'Caler intervenants + CRM',                             'seed-dashboard-2026-04-19', TRUE),
  ('2026-05-27', 'Démo outil traçabilité (Lovable one-shot)',  'market_signal', 'Démo produit live — preuve de capacité',                     'à démarrer',  'Brief Lovable + écrire scénario démo',                 'seed-dashboard-2026-04-19', TRUE),
  ('2026-06-10', 'Clôture batch 1 signatures Pack Standard',   'market_signal', 'Objectif : 5 signatures Pack Standard RDUE',                 'planifié',    'Pipeline review hebdo + relances',                     'seed-dashboard-2026-04-19', TRUE);

-- -----------------------------------------------------------------------------
-- 10. monitor_alerts — 3 rows
-- -----------------------------------------------------------------------------
INSERT INTO public.monitor_alerts
  (triggered_at, severity, module, message, metadata, acknowledged, is_seed)
VALUES
  ('2026-04-16 10:42:00+00', 'info',     'paystack',    'Paystack webhook traité : 1 nouveau client Pro activé',                     '{"plan":"Pro","amount_fcfa":49900}'::jsonb,           FALSE, TRUE),
  ('2026-04-18 03:15:00+00', 'warning',  'cloudflare',  'KV quota Cloudflare Workers à 82%',                                         '{"usage_pct":82,"namespace":"monitor-cache"}'::jsonb, FALSE, TRUE),
  ('2026-04-02 14:20:00+00', 'critical', 'strateisos',  'StrateisOS tools-api DOWN depuis le 2026-04-02 — fallback documenté',       '{"service":"tools-api","fallback":"manual"}'::jsonb,  FALSE, TRUE);

COMMIT;
