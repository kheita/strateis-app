-- ═══════════════════════════════════════════════════════════════
-- STRATEIS APP — FOUNDATIONS MIGRATION 001
-- ═══════════════════════════════════════════════════════════════

-- ─── Fonction utilitaire : auto-update updated_at ───
CREATE OR REPLACE FUNCTION monitor_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- TABLES TEMPORELLES (pour sparklines et courbes)
-- ═══════════════════════════════════════════════════════════════

-- SEO quotidien : pages indexées sur chaque domaine
CREATE TABLE monitor_seo_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  ideelab_indexed INTEGER,
  strateis_indexed INTEGER,
  monitor_indexed INTEGER,
  source TEXT NOT NULL DEFAULT 'routine-1-seo-monitor',
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_seo_daily_date ON monitor_seo_daily(date DESC);

-- Ranking Google hebdomadaire : scores sur mots-clés cibles
CREATE TABLE monitor_ranking_weekly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL UNIQUE,
  ranking_score_ideelab INTEGER,
  ranking_score_strateis INTEGER,
  keywords_detail JSONB,
  source TEXT NOT NULL DEFAULT 'routine-10-ranking',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_ranking_week ON monitor_ranking_weekly(week_start DESC);

-- AEO (Answer Engine Optimization) hebdomadaire
CREATE TABLE monitor_aeo_weekly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL UNIQUE,
  visibility_score INTEGER,
  queries_detail JSONB,
  source TEXT NOT NULL DEFAULT 'routine-9-aeo',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_aeo_week ON monitor_aeo_weekly(week_start DESC);

-- KPIs quotidiens internes
CREATE TABLE monitor_kpis_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_ideas INTEGER,
  active_projects INTEGER,
  monthly_revenue NUMERIC,
  paystack_transactions_count INTEGER,
  raw_metrics JSONB,
  source TEXT NOT NULL DEFAULT 'edge-function-cron',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_kpis_date ON monitor_kpis_daily(date DESC);

-- ═══════════════════════════════════════════════════════════════
-- PIPELINES VIVANTS
-- ═══════════════════════════════════════════════════════════════

-- B2G Pipeline : opportunités scorées
CREATE TABLE monitor_b2g_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_name TEXT NOT NULL UNIQUE,
  funder TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 10),
  deadline DATE,
  amount_fcfa BIGINT,
  status TEXT CHECK (status IN ('detected', 'qualified', 'applied', 'in_progress', 'won', 'lost')) DEFAULT 'detected',
  description TEXT,
  source_url TEXT,
  source TEXT NOT NULL DEFAULT 'routine-8-b2g',
  detected_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_b2g_score ON monitor_b2g_pipeline(score DESC);
CREATE INDEX idx_b2g_deadline ON monitor_b2g_pipeline(deadline);
CREATE INDEX idx_b2g_status ON monitor_b2g_pipeline(status);
CREATE TRIGGER trg_b2g_updated BEFORE UPDATE ON monitor_b2g_pipeline
  FOR EACH ROW EXECUTE FUNCTION monitor_update_timestamp();

-- Concurrents : carte des acteurs
CREATE TABLE monitor_concurrents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sector TEXT,
  positioning TEXT,
  country TEXT,
  last_activity_date DATE,
  last_activity_note TEXT,
  source TEXT NOT NULL DEFAULT 'routine-2-veille-concurrence',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_concurrents_sector ON monitor_concurrents(sector);
CREATE TRIGGER trg_concurrents_updated BEFORE UPDATE ON monitor_concurrents
  FOR EACH ROW EXECUTE FUNCTION monitor_update_timestamp();

-- RDUE timeline : dates clés + concurrents EUDR
CREATE TABLE monitor_rdue_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date DATE NOT NULL,
  event_name TEXT NOT NULL,
  event_type TEXT CHECK (event_type IN ('regulation', 'deadline', 'grace_period', 'enforcement', 'competitor_move', 'market_signal')),
  description TEXT,
  strateis_phase TEXT,
  next_action TEXT,
  source TEXT NOT NULL DEFAULT 'routine-7-rdue',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_rdue_date ON monitor_rdue_timeline(event_date);

-- ═══════════════════════════════════════════════════════════════
-- FEEDS STRUCTURÉS
-- ═══════════════════════════════════════════════════════════════

-- Feed items : actualités structurées
CREATE TABLE monitor_feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('africa_tech', 'ai_tech', 'regulatory', 'b2g', 'competition', 'other')),
  title TEXT NOT NULL,
  url TEXT UNIQUE,
  summary TEXT,
  published_at TIMESTAMPTZ,
  tier INTEGER CHECK (tier >= 1 AND tier <= 4) DEFAULT 3,
  tags JSONB,
  collector TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_feed_category_date ON monitor_feed_items(category, published_at DESC);
CREATE INDEX idx_feed_source ON monitor_feed_items(source);
CREATE INDEX idx_feed_tier ON monitor_feed_items(tier);

-- ═══════════════════════════════════════════════════════════════
-- SANTÉ DU SYSTÈME
-- ═══════════════════════════════════════════════════════════════

-- Source health : état de chaque source de données
CREATE TABLE monitor_source_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL UNIQUE,
  source_name TEXT NOT NULL,
  source_type TEXT CHECK (source_type IN ('routine', 'mcp', 'webhook', 'cron', 'chrome', 'cowork', 'agent')),
  expected_frequency TEXT,
  last_success TIMESTAMPTZ,
  last_failure TIMESTAMPTZ,
  failure_message TEXT,
  uptime_7d NUMERIC DEFAULT 100.0,
  is_critical BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_source_health_id ON monitor_source_health(source_id);
CREATE TRIGGER trg_source_health_updated BEFORE UPDATE ON monitor_source_health
  FOR EACH ROW EXECUTE FUNCTION monitor_update_timestamp();

-- Alerts : alertes déclenchées
CREATE TABLE monitor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_at TIMESTAMPTZ DEFAULT now(),
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
  module TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_alerts_triggered ON monitor_alerts(triggered_at DESC);
CREATE INDEX idx_alerts_unack ON monitor_alerts(acknowledged) WHERE acknowledged = false;

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE monitor_seo_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_ranking_weekly ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_aeo_weekly ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_kpis_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_b2g_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_concurrents ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_rdue_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_source_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read seo_daily" ON monitor_seo_daily FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read ranking_weekly" ON monitor_ranking_weekly FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read aeo_weekly" ON monitor_aeo_weekly FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read kpis_daily" ON monitor_kpis_daily FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read b2g" ON monitor_b2g_pipeline FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read concurrents" ON monitor_concurrents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read rdue" ON monitor_rdue_timeline FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read feeds" ON monitor_feed_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read source_health" ON monitor_source_health FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read alerts" ON monitor_alerts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth ack alerts" ON monitor_alerts FOR UPDATE TO authenticated
  USING (true) WITH CHECK (acknowledged = true);

-- ═══════════════════════════════════════════════════════════════
-- SEED INITIAL : SOURCES CONNUES
-- ═══════════════════════════════════════════════════════════════

INSERT INTO monitor_source_health (source_id, source_name, source_type, expected_frequency, is_critical, last_success) VALUES
  ('routine-1-seo-monitor', 'Routine SEO Monitor', 'routine', 'daily', true, null),
  ('routine-2-veille-concurrence', 'Routine Veille Concurrentielle', 'routine', 'weekly', false, null),
  ('routine-4-veille-africa', 'Routine Veille Africa Tech', 'routine', 'daily', false, null),
  ('routine-5-veille-ia', 'Routine Veille IA & Tech', 'routine', 'daily', false, null),
  ('routine-6-email-review', 'Routine Revue Email', 'routine', 'daily', false, null),
  ('routine-7-rdue', 'Routine Monitoring RDUE', 'routine', 'weekly', true, null),
  ('routine-8-b2g', 'Routine Monitoring B2G', 'routine', 'weekly', true, null),
  ('routine-9-aeo', 'Routine AEO', 'routine', 'weekly', false, null),
  ('routine-10-ranking', 'Routine Ranking Google', 'routine', 'weekly', false, null),
  ('mcp-gmail', 'MCP Gmail', 'mcp', 'realtime', false, null),
  ('mcp-calendar', 'MCP Google Calendar', 'mcp', 'realtime', false, null),
  ('mcp-drive', 'MCP Google Drive', 'mcp', 'realtime', false, null),
  ('paystack-webhook', 'Paystack Webhook', 'webhook', 'realtime', true, null),
  ('chrome-gsc-batch', 'Chrome GSC Batch', 'chrome', 'daily', false, null),
  ('chrome-linkedin-posting', 'Chrome LinkedIn Posting', 'chrome', 'daily', false, null),
  ('supabase-kpis-cron', 'Supabase KPIs Cron', 'cron', 'daily', true, null)
ON CONFLICT (source_id) DO NOTHING;
