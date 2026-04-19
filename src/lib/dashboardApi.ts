// API layer for the Intelligence dashboard.
// Calls the Supabase Edge Function `monitor-fetch` with multiple views,
// and queries `monitor_kpis_daily` directly for KPI sparklines.

import { supabase } from "./supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// ---------- Types (defensive: most fields optional) ----------

export type SeoDailyPoint = {
  date: string;
  domain?: string;
  site?: string;
  pages_indexed?: number;
  pages?: number;
  indexed_count?: number;
  // wildcard for unknown columns
  [k: string]: unknown;
};

export type AeoWeeklyPoint = {
  week_start?: string;
  week?: string;
  date?: string;
  mentions?: number;
  count?: number;
  [k: string]: unknown;
};

export type RankingWeeklyPoint = {
  week?: string;
  date?: string;
  position?: number;
  keyword?: string;
  top10_count?: number;
  [k: string]: unknown;
};

export type B2GOpportunity = {
  id?: string | number;
  name?: string;
  entity?: string;
  titre?: string;
  sector?: string;
  secteur?: string;
  amount_estimate_fcfa?: number;
  montant_fcfa?: number;
  amount?: number;
  score?: number;
  [k: string]: unknown;
};

export type FeedItem = {
  id?: string | number;
  title?: string;
  titre?: string;
  source?: string;
  category?: string;
  categorie?: string;
  published_at?: string;
  created_at?: string;
  date?: string;
  url?: string;
  [k: string]: unknown;
};

export type SourceHealth = {
  id?: string;
  name?: string;
  status?: string;
  last_success_at?: string;
  [k: string]: unknown;
};

export type KpiDailyPoint = {
  date: string;
  mrr_ideelab_fcfa?: number;
  mrr_fcfa?: number;
  mrr?: number;
  missions_active_count?: number;
  missions_actives?: number;
  missions_engaged_fcfa?: number;
  revenus_engages_fcfa?: number;
  [k: string]: unknown;
};

export type ViewKey = "dashboard" | "feeds" | "b2g" | "seo" | "kpis";

export type DashboardSnapshot = {
  fetchedAt: string;
  seoDaily: SeoDailyPoint[];
  aeoWeekly: AeoWeeklyPoint[];
  rankingWeekly: RankingWeeklyPoint[];
  b2gHot: B2GOpportunity[];
  b2gPipeline: B2GOpportunity[];
  feedItems: FeedItem[];
  sourcesHealth: SourceHealth[];
  kpisDaily: KpiDailyPoint[];
  /** Per-view fetch errors (omitted entries succeeded). */
  viewErrors: Partial<Record<ViewKey, string>>;
  /** True if at least one row in the loaded data carries is_seed=true. */
  hasSeedData: boolean;
};

type FetchViewResult<T> = {
  data: T;
  hasSeedData: boolean;
};

// ---------- Edge function helpers ----------

async function fetchView<T = unknown>(
  view: ViewKey,
  params?: Record<string, string>,
  signal?: AbortSignal,
): Promise<FetchViewResult<T>> {
  const qs = new URLSearchParams({ view, ...(params ?? {}) }).toString();
  const url = `${SUPABASE_URL}/functions/v1/monitor-fetch?${qs}`;
  // Use the user JWT if available, otherwise fall back to anon.
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token ?? SUPABASE_ANON_KEY;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
    },
    signal,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    data?: T;
    meta?: { has_seed_data?: boolean };
  };
  return {
    data: json.data ?? ({} as T),
    hasSeedData: json.meta?.has_seed_data === true,
  };
}

function asMessage(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  return typeof reason === "string" ? reason : "Erreur inconnue";
}

// ---------- Sorting helpers ----------

function sortByDateAsc<T>(rows: T[], pickKey: (r: T) => string | null | undefined): T[] {
  return [...rows].sort((a, b) => {
    const ka = pickKey(a) ?? "";
    const kb = pickKey(b) ?? "";
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

// ---------- Public fetcher ----------

export async function fetchDashboardSnapshot(signal?: AbortSignal): Promise<DashboardSnapshot> {
  const [dash, feeds, b2g, seo, kpis] = await Promise.allSettled([
    fetchView<{
      seo?: SeoDailyPoint[];
      b2g_hot?: B2GOpportunity[];
      sources_health?: SourceHealth[];
    }>("dashboard", undefined, signal),
    // Explicit "all" category — backend defaults to a single category otherwise.
    fetchView<{ items?: FeedItem[] }>("feeds", { category: "all" }, signal),
    fetchView<{ pipeline?: B2GOpportunity[] }>("b2g", undefined, signal),
    fetchView<{
      daily?: SeoDailyPoint[];
      ranking?: RankingWeeklyPoint[];
      aeo?: AeoWeeklyPoint[];
    }>("seo", undefined, signal),
    fetchKpisDaily(signal),
  ]);

  const viewErrors: Partial<Record<ViewKey, string>> = {};
  if (dash.status === "rejected") viewErrors.dashboard = asMessage(dash.reason);
  if (feeds.status === "rejected") viewErrors.feeds = asMessage(feeds.reason);
  if (b2g.status === "rejected") viewErrors.b2g = asMessage(b2g.reason);
  if (seo.status === "rejected") viewErrors.seo = asMessage(seo.reason);
  if (kpis.status === "rejected") viewErrors.kpis = asMessage(kpis.reason);

  // Normalize all time series to ascending order so consumers can use `last()`.
  const rawSeoDaily =
    (seo.status === "fulfilled" && seo.value.data.daily) ||
    (dash.status === "fulfilled" && dash.value.data.seo) ||
    [];
  const seoDaily = sortByDateAsc(rawSeoDaily, (r) => r.date);

  const rawAeo = (seo.status === "fulfilled" && seo.value.data.aeo) || [];
  const aeoWeekly = sortByDateAsc(rawAeo, (r) => r.week_start ?? r.week ?? r.date ?? null);

  const rawRanking = (seo.status === "fulfilled" && seo.value.data.ranking) || [];
  const rankingWeekly = sortByDateAsc(rawRanking, (r) => r.week ?? r.date ?? null);

  const kpisDaily = kpis.status === "fulfilled" ? kpis.value.data : [];

  // Aggregate has_seed_data across every successful view + the direct KPIs query.
  const hasSeedData =
    (dash.status === "fulfilled" && dash.value.hasSeedData) ||
    (feeds.status === "fulfilled" && feeds.value.hasSeedData) ||
    (b2g.status === "fulfilled" && b2g.value.hasSeedData) ||
    (seo.status === "fulfilled" && seo.value.hasSeedData) ||
    (kpis.status === "fulfilled" && kpis.value.hasSeedData);

  return {
    fetchedAt: new Date().toISOString(),
    seoDaily,
    aeoWeekly,
    rankingWeekly,
    b2gHot:
      (dash.status === "fulfilled" && dash.value.data.b2g_hot) ||
      (b2g.status === "fulfilled" ? (b2g.value.data.pipeline ?? []).slice(0, 5) : []),
    b2gPipeline: (b2g.status === "fulfilled" && b2g.value.data.pipeline) || [],
    feedItems: (feeds.status === "fulfilled" && feeds.value.data.items) || [],
    sourcesHealth: (dash.status === "fulfilled" && dash.value.data.sources_health) || [],
    kpisDaily,
    viewErrors,
    hasSeedData: Boolean(hasSeedData),
  };
}

async function fetchKpisDaily(signal?: AbortSignal): Promise<FetchViewResult<KpiDailyPoint[]>> {
  // Last ~12 months of daily KPIs for sparklines + delta computations.
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 400);
  const sinceIso = since.toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("monitor_kpis_daily")
    .select("*")
    .gte("date", sinceIso)
    .order("date", { ascending: true })
    .abortSignal(signal as AbortSignal);
  if (error) throw error;
  const rows = (data ?? []) as KpiDailyPoint[];
  return {
    data: rows,
    hasSeedData: rows.some((r) => (r as { is_seed?: boolean }).is_seed === true),
  };
}

// ---------- Field accessors (handle naming variants) ----------

export function pickMrr(p: KpiDailyPoint): number | null {
  const v = p.mrr_ideelab_fcfa ?? p.mrr_fcfa ?? p.mrr;
  return typeof v === "number" ? v : null;
}

export function pickMissionsActive(p: KpiDailyPoint): number | null {
  const v = p.missions_active_count ?? p.missions_actives;
  return typeof v === "number" ? v : null;
}

export function pickMissionsEngaged(p: KpiDailyPoint): number | null {
  const v = p.missions_engaged_fcfa ?? p.revenus_engages_fcfa;
  return typeof v === "number" ? v : null;
}

export function pickB2gName(o: B2GOpportunity): string {
  return (o.name ?? o.entity ?? o.titre ?? "—") as string;
}

export function pickB2gSector(o: B2GOpportunity): string | null {
  const v = o.sector ?? o.secteur;
  return typeof v === "string" ? v : null;
}

export function pickB2gAmount(o: B2GOpportunity): number | null {
  const v = o.amount_estimate_fcfa ?? o.montant_fcfa ?? o.amount;
  return typeof v === "number" ? v : null;
}

export function pickB2gScore(o: B2GOpportunity): number | null {
  const v = o.score;
  return typeof v === "number" ? v : null;
}

export function pickFeedTitle(f: FeedItem): string {
  return (f.title ?? f.titre ?? "—") as string;
}

export function pickFeedDate(f: FeedItem): string | null {
  return (f.published_at ?? f.created_at ?? f.date ?? null) as string | null;
}

export function pickFeedCategory(f: FeedItem): string | null {
  const v = f.category ?? f.categorie;
  return typeof v === "string" ? v : null;
}

export function pickSeoPages(p: SeoDailyPoint): number | null {
  const v = p.pages_indexed ?? p.pages ?? p.indexed_count;
  return typeof v === "number" ? v : null;
}

export function pickSeoDomain(p: SeoDailyPoint): string | null {
  const v = p.domain ?? p.site;
  return typeof v === "string" ? v : null;
}

export function pickAeoCount(p: AeoWeeklyPoint): number | null {
  const v = p.mentions ?? p.count;
  return typeof v === "number" ? v : null;
}

export function pickAeoWeek(p: AeoWeeklyPoint): string | null {
  const v = p.week_start ?? p.week ?? p.date;
  return typeof v === "string" ? v : null;
}

export function pickRankingTop10(rows: RankingWeeklyPoint[]): number | null {
  if (rows.length === 0) return null;
  // Rows are pre-sorted ascending by week_start/week/date; latest is at the tail.
  const keyOf = (r: RankingWeeklyPoint) =>
    (r.week ?? r.date ?? (r as { week_start?: string }).week_start ?? null) as string | null;
  const latest = rows[rows.length - 1];
  if (typeof latest.top10_count === "number") return latest.top10_count;
  const latestKey = keyOf(latest);
  if (!latestKey) return null;
  const sameWeek = rows.filter((r) => keyOf(r) === latestKey);
  const top10 = sameWeek.filter(
    (r) => typeof r.position === "number" && (r.position as number) <= 10,
  );
  return top10.length;
}
