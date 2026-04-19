import { useEffect, useMemo } from "react";
import {
  TrendingUp,
  Building2,
  Briefcase,
  LineChart as LineChartIcon,
  Hourglass,
  CalendarClock,
} from "lucide-react";
import { useDashboardData } from "../hooks/useDashboardData";
import { KpiTile } from "../components/dashboard/KpiTile";
import { RefreshControl } from "../components/dashboard/RefreshControl";
import { ErrorBanner } from "../components/dashboard/ErrorBanner";
import { AgendaWidget } from "../components/dashboard/widgets/AgendaWidget";
import { FeedWidget } from "../components/dashboard/widgets/FeedWidget";
import { B2GWidget } from "../components/dashboard/widgets/B2GWidget";
import { SeoAeoWidget } from "../components/dashboard/widgets/SeoAeoWidget";
import {
  pickAeoCount,
  pickB2gAmount,
  pickB2gScore,
  pickMissionsActive,
  pickMissionsEngaged,
  pickMrr,
  pickRankingTop10,
  pickSeoPages,
} from "../lib/dashboardApi";
import {
  computeDelta,
  formatFcfa,
  formatInt,
  isStale,
} from "../lib/format";

export function IntelligenceDashboardPage() {
  useEffect(() => {
    document.title = "Strateis App — Dashboard";
  }, []);

  const { snapshot, loading, refreshing, error, partialError, lastSync, refresh, hasSeedData } =
    useDashboardData();

  const kpis = useMemo(() => buildKpis(snapshot), [snapshot]);

  return (
    <div className="h-full w-full overflow-auto">
      <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-6 sm:px-8 sm:pt-8">
        <header className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-tertiary">
                Intelligence
              </span>
              {hasSeedData && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-sm border border-gold-400/40 bg-gold-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-gold"
                  title="Des données de travail (seed) sont affichées. Elles disparaîtront au câblage des collecteurs live."
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  Données de travail
                </span>
              )}
            </div>
            <h1 className="mt-1 text-[24px] font-medium tracking-[-0.02em] text-primary sm:text-[26px]">
              Dashboard
            </h1>
            <p className="mt-1 text-[13px] text-secondary">
              Vue consolidée des signaux clés du cabinet — actualisée toutes les 60 secondes.
            </p>
          </div>
          <RefreshControl lastSync={lastSync} refreshing={refreshing || loading} onRefresh={refresh} />
        </header>

        {error ? (
          <ErrorBanner message={error} onRetry={refresh} />
        ) : partialError ? (
          <ErrorBanner message={partialError} onRetry={refresh} variant="partial" />
        ) : null}

        {/* Hero — 4 KPI tiles */}
        <section
          aria-label="Indicateurs clés"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <KpiTile
            icon={TrendingUp}
            label="MRR IdeeLab"
            value={kpis.mrr.value}
            delta={kpis.mrr.delta}
            subMetric={kpis.mrr.sub}
            trend={kpis.mrr.trend}
            trendCaption="12 mois"
            loading={loading}
            empty={kpis.mrr.empty}
            stale={kpis.mrr.stale}
            lastValueDate={kpis.mrr.lastValueDate}
          />
          <KpiTile
            icon={Building2}
            label="Pipeline B2G"
            value={kpis.b2g.value}
            delta={kpis.b2g.delta}
            subMetric={kpis.b2g.sub}
            trend={kpis.b2g.trend}
            trendCaption="12 sem."
            loading={loading}
            empty={kpis.b2g.empty}
          />
          <KpiTile
            icon={Briefcase}
            label="Missions actives"
            value={kpis.missions.value}
            delta={kpis.missions.delta}
            subMetric={kpis.missions.sub}
            trend={kpis.missions.trend}
            trendCaption="12 sem."
            loading={loading}
            empty={kpis.missions.empty}
            stale={kpis.missions.stale}
            lastValueDate={kpis.missions.lastValueDate}
          />
          <KpiTile
            icon={LineChartIcon}
            label="Visibilité"
            value={kpis.visibility.value}
            delta={kpis.visibility.delta}
            subMetric={kpis.visibility.sub}
            trend={kpis.visibility.trend}
            trendCaption="12 sem."
            loading={loading}
            empty={kpis.visibility.empty}
          />
        </section>

        {/* Widgets — 2x2 grid (xl), stacked below 1280px */}
        <section
          aria-label="Widgets opérationnels"
          className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 xl:grid-cols-2"
        >
          <AgendaWidget />
          <FeedWidget items={snapshot?.feedItems ?? []} loading={loading} />
          <B2GWidget items={(snapshot?.b2gPipeline?.length ? snapshot.b2gPipeline : snapshot?.b2gHot) ?? []} loading={loading} />
          <SeoAeoWidget
            seoDaily={snapshot?.seoDaily ?? []}
            aeoWeekly={snapshot?.aeoWeekly ?? []}
            loading={loading}
          />
        </section>
      </div>
    </div>
  );
}

// ---------- KPI builder ----------

type KpiState = {
  value: string;
  delta: ReturnType<typeof computeDelta>;
  sub: React.ReactNode;
  trend: number[];
  empty?: { title: string; description: string; pastille?: string; icon: typeof Hourglass };
  stale?: boolean;
  lastValueDate?: string | null;
};

function buildKpis(snap: ReturnType<typeof useDashboardData>["snapshot"]): {
  mrr: KpiState;
  b2g: KpiState;
  missions: KpiState;
  visibility: KpiState;
} {
  const empty = !snap;

  // ---------- MRR (12 monthly buckets from daily kpis) ----------
  const mrrSeries = empty
    ? []
    : monthlyAggregate(snap!.kpisDaily, pickMrr, 12, "last");
  const mrrLast = mrrSeries.length ? mrrSeries[mrrSeries.length - 1] : null;
  const mrrPrev = mrrSeries.length > 1 ? mrrSeries[mrrSeries.length - 2] : null;
  const mrrDelta = computeDelta(mrrLast, mrrPrev);
  const mrrLatestDate = snap?.kpisDaily.length
    ? snap.kpisDaily[snap.kpisDaily.length - 1].date
    : null;

  const mrr: KpiState = mrrLast === null
    ? {
        value: "—",
        delta: null,
        sub: null,
        trend: [],
        empty: {
          title: "MRR à venir",
          description: "Les revenus IdeeLab seront calculés dès le prochain cycle de synchronisation.",
          pastille: "Collecteur en attente",
          icon: Hourglass,
        },
      }
    : {
        value: formatFcfa(mrrLast, { compact: true }) + " FCFA",
        delta: mrrDelta,
        sub: null,
        trend: mrrSeries,
        stale: isStale(mrrLatestDate),
        lastValueDate: mrrLatestDate,
      };

  // ---------- B2G pipeline (sum amounts; trend by week) ----------
  const b2gItems = snap?.b2gPipeline?.length ? snap.b2gPipeline : snap?.b2gHot ?? [];
  const b2gAmounts = b2gItems
    .map(pickB2gAmount)
    .filter((v): v is number => typeof v === "number");
  const b2gTotal = b2gAmounts.reduce((a, b) => a + b, 0);
  const b2gHotCount = b2gItems.filter((o) => (pickB2gScore(o) ?? 0) >= 7).length;

  const b2g: KpiState = b2gItems.length === 0
    ? {
        value: "—",
        delta: null,
        sub: null,
        trend: [],
        empty: {
          title: "Pipeline en cours",
          description: "Les opportunités B2G remonteront ici dès qu'elles seront scorées.",
          pastille: "Collecteur en attente",
          icon: Hourglass,
        },
      }
    : {
        value: formatFcfa(b2gTotal, { compact: true }) + " FCFA",
        delta: null,
        sub: (
          <>
            <span className="text-secondary">{b2gHotCount}</span>{" "}
            <span className="text-tertiary">opp. hot · score ≥ 7</span>
          </>
        ),
        trend: [],
      };

  // ---------- Missions actives (latest count + engaged amount) ----------
  const missionsSeries = empty
    ? []
    : weeklyAggregate(snap!.kpisDaily, pickMissionsActive, 12, "last");
  const missionsLast = missionsSeries.length
    ? missionsSeries[missionsSeries.length - 1]
    : null;
  const missionsPrev =
    missionsSeries.length > 1 ? missionsSeries[missionsSeries.length - 2] : null;
  const missionsDelta = computeDelta(missionsLast, missionsPrev);
  const engagedSeries = empty
    ? []
    : snap!.kpisDaily.map(pickMissionsEngaged).filter((v): v is number => v !== null);
  const engagedLast = engagedSeries.length ? engagedSeries[engagedSeries.length - 1] : null;
  const missionsLatestDate = snap?.kpisDaily.length
    ? snap.kpisDaily[snap.kpisDaily.length - 1].date
    : null;

  const missions: KpiState = missionsLast === null
    ? {
        value: "—",
        delta: null,
        sub: null,
        trend: [],
        empty: {
          title: "Aucune mission captée",
          description: "Le pilotage des missions sera connecté à la prochaine synchronisation.",
          pastille: "Collecteur en attente",
          icon: Hourglass,
        },
      }
    : {
        value: formatInt(missionsLast),
        delta: missionsDelta,
        sub:
          engagedLast !== null ? (
            <>
              {formatFcfa(engagedLast, { compact: true })}{" "}
              <span className="text-tertiary">FCFA engagés</span>
            </>
          ) : null,
        trend: missionsSeries,
        stale: isStale(missionsLatestDate),
        lastValueDate: missionsLatestDate,
      };

  // ---------- Visibilité (Top 10 + AEO weekly mentions) ----------
  const ranking = snap?.rankingWeekly ?? [];
  const top10 = pickRankingTop10(ranking);
  const aeoSeries = (snap?.aeoWeekly ?? [])
    .slice(-12)
    .map(pickAeoCount)
    .filter((v): v is number => v !== null);
  const aeoLast = aeoSeries.length ? aeoSeries[aeoSeries.length - 1] : null;

  const seoTrend = (snap?.seoDaily ?? [])
    .slice(-12 * 7)
    .map(pickSeoPages)
    .filter((v): v is number => v !== null);

  const hasVisibility = top10 !== null || aeoLast !== null;
  const visibility: KpiState = !hasVisibility
    ? {
        value: "—",
        delta: null,
        sub: null,
        trend: [],
        empty: {
          title: "Suivi en initialisation",
          description: "Le suivi SEO + AEO démarrera à la prochaine fenêtre de collecte.",
          pastille: "Prochain cycle 06:00 UTC",
          icon: CalendarClock,
        },
      }
    : {
        value: top10 !== null ? `${formatInt(top10)} Top 10` : "—",
        delta: null,
        sub:
          aeoLast !== null ? (
            <>
              <span className="text-secondary">{formatInt(aeoLast)}</span>{" "}
              <span className="text-tertiary">mentions AEO sem.</span>
            </>
          ) : null,
        trend: seoTrend,
      };

  return { mrr, b2g, missions, visibility };
}

// ---------- Aggregation helpers ----------

type Picker<T> = (row: T) => number | null;

function monthlyAggregate<T extends { date: string }>(
  rows: T[],
  pick: Picker<T>,
  months: number,
  mode: "last" | "sum",
): number[] {
  const buckets = new Map<string, number[]>();
  for (const r of rows) {
    const v = pick(r);
    if (v === null) continue;
    const key = r.date.slice(0, 7); // YYYY-MM
    const arr = buckets.get(key) ?? [];
    arr.push(v);
    buckets.set(key, arr);
  }
  const sorted = Array.from(buckets.entries()).sort(([a], [b]) => (a < b ? -1 : 1));
  const last = sorted.slice(-months);
  return last.map(([, arr]) => (mode === "last" ? arr[arr.length - 1] : arr.reduce((a, b) => a + b, 0)));
}

function weeklyAggregate<T extends { date: string }>(
  rows: T[],
  pick: Picker<T>,
  weeks: number,
  mode: "last" | "sum",
): number[] {
  const buckets = new Map<string, number[]>();
  for (const r of rows) {
    const v = pick(r);
    if (v === null) continue;
    const d = new Date(r.date + "T00:00:00Z");
    if (Number.isNaN(d.getTime())) continue;
    // ISO week key: YYYY-Www
    const key = isoWeekKey(d);
    const arr = buckets.get(key) ?? [];
    arr.push(v);
    buckets.set(key, arr);
  }
  const sorted = Array.from(buckets.entries()).sort(([a], [b]) => (a < b ? -1 : 1));
  const last = sorted.slice(-weeks);
  return last.map(([, arr]) => (mode === "last" ? arr[arr.length - 1] : arr.reduce((a, b) => a + b, 0)));
}

function isoWeekKey(d: Date): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const diff = (date.getTime() - firstThursday.getTime()) / 86400000;
  const week = 1 + Math.round((diff - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
