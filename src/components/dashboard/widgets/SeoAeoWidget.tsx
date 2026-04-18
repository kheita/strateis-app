import { LineChart as LineChartIcon, Search, MessageSquareQuote } from "lucide-react";
import { Widget } from "../Widget";
import { EmptyState } from "../EmptyState";
import { Skeleton } from "../Skeleton";
import { Sparkline, VerticalBars } from "../Sparkline";
import {
  pickAeoCount,
  pickSeoDomain,
  pickSeoPages,
  type AeoWeeklyPoint,
  type SeoDailyPoint,
} from "../../../lib/dashboardApi";
import { formatInt } from "../../../lib/format";

type Props = {
  seoDaily: SeoDailyPoint[];
  aeoWeekly: AeoWeeklyPoint[];
  loading: boolean;
};

const DOMAINS = ["ideelab.io", "strateis.co"];

export function SeoAeoWidget({ seoDaily, aeoWeekly, loading }: Props) {
  return (
    <Widget icon={LineChartIcon} title="Tracker SEO + AEO" caption="30 j · 12 sem" noPadding>
      <div className="grid h-full grid-cols-1 divide-y divide-[rgb(var(--border-subtle))] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <SeoPanel domains={DOMAINS} data={seoDaily} loading={loading} />
        <AeoPanel data={aeoWeekly} loading={loading} />
      </div>
    </Widget>
  );
}

function SeoPanel({
  domains,
  data,
  loading,
}: {
  domains: string[];
  data: SeoDailyPoint[];
  loading: boolean;
}) {
  return (
    <div className="flex flex-col p-4">
      <div className="mb-3 font-mono text-[9.5px] uppercase tracking-[0.18em] text-tertiary">
        SEO · pages indexées
      </div>
      {loading ? (
        <div className="space-y-3">
          {domains.map((d) => (
            <div key={d}>
              <Skeleton className="h-3 w-[40%]" />
              <Skeleton className="mt-2 h-6 w-full" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={Search}
            title="Aucune indexation captée"
            description="Le collecteur Search Console sera activé sous peu. Le suivi quotidien apparaîtra ici."
            pastille="Prochain cycle 06:00 UTC"
            compact
          />
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map((dom) => {
            const series = data
              .filter((p) => {
                const d = pickSeoDomain(p);
                return d ? d.includes(dom) : true;
              })
              .slice(-30);
            const values = series.map(pickSeoPages).filter((v): v is number => v !== null);
            const last = values[values.length - 1] ?? null;
            return (
              <div key={dom}>
                <div className="flex items-baseline justify-between">
                  <div className="font-mono text-[10.5px] text-secondary">{dom}</div>
                  <div className="font-mono text-[12px] tabular-nums text-primary">
                    {last !== null ? formatInt(last) : "—"}
                  </div>
                </div>
                <Sparkline values={values} width={220} height={28} tone="gold" className="mt-1 w-full" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AeoPanel({ data, loading }: { data: AeoWeeklyPoint[]; loading: boolean }) {
  return (
    <div className="flex flex-col p-4">
      <div className="mb-3 font-mono text-[9.5px] uppercase tracking-[0.18em] text-tertiary">
        AEO · mentions hebdo
      </div>
      {loading ? (
        <>
          <Skeleton className="h-7 w-20" />
          <Skeleton className="mt-3 h-12 w-full" />
        </>
      ) : data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={MessageSquareQuote}
            title="Aucune mention détectée"
            description="Le tracker AEO démarre son scan hebdomadaire. Les mentions remonteront dès le prochain cycle."
            pastille="Collecteur en attente"
            compact
          />
        </div>
      ) : (
        (() => {
          const series = data.slice(-12);
          const values = series.map(pickAeoCount).filter((v): v is number => v !== null);
          const last = values[values.length - 1] ?? 0;
          const prev = values[values.length - 2] ?? 0;
          const diff = last - prev;
          return (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[22px] font-medium tabular-nums text-primary">
                  {formatInt(last)}
                </span>
                <span
                  className={
                    "font-mono text-[10.5px] tabular-nums " +
                    (diff > 0 ? "status-ok" : diff < 0 ? "status-down" : "text-tertiary")
                  }
                >
                  {diff > 0 ? "+" : diff < 0 ? "−" : "±"}
                  {Math.abs(diff)}
                </span>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-tertiary">
                  vs sem. préc.
                </span>
              </div>
              <div className="mt-3 flex-1">
                <VerticalBars values={values} width={220} height={56} tone="gold" className="w-full" />
              </div>
            </>
          );
        })()
      )}
    </div>
  );
}
