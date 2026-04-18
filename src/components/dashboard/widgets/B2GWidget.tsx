import { Building2, FolderSearch } from "lucide-react";
import { Widget } from "../Widget";
import { EmptyState } from "../EmptyState";
import { Skeleton } from "../Skeleton";
import {
  pickB2gAmount,
  pickB2gName,
  pickB2gScore,
  pickB2gSector,
  type B2GOpportunity,
} from "../../../lib/dashboardApi";
import { formatFcfa } from "../../../lib/format";

type Props = {
  items: B2GOpportunity[];
  loading: boolean;
};

export function B2GWidget({ items, loading }: Props) {
  const sorted = [...items]
    .filter((o) => typeof pickB2gScore(o) === "number")
    .sort((a, b) => (pickB2gScore(b) ?? 0) - (pickB2gScore(a) ?? 0))
    .slice(0, 5);

  return (
    <Widget icon={Building2} title="Top B2G hot" caption="Score ≥ 7 · 5 plus chauds" noPadding>
      {loading ? (
        <div className="space-y-3 px-4 py-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <Skeleton className="h-3 w-[55%]" />
              <Skeleton className="h-2.5 w-[20%]" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={FolderSearch}
          title="Aucune opportunité scorée"
          description="Le pipeline B2G est en cours de constitution. Les opportunités apparaîtront ici dès qu'elles auront été scorées."
          pastille="Pipeline en cours"
        />
      ) : (
        <ul className="divide-y divide-[rgb(var(--border-subtle))]">
          {sorted.map((o, idx) => {
            const name = pickB2gName(o);
            const sector = pickB2gSector(o);
            const amount = pickB2gAmount(o);
            const score = pickB2gScore(o) ?? 0;
            return (
              <li key={(o.id as string | number | undefined) ?? idx} className="px-4 py-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] text-primary">{name}</div>
                    {sector && (
                      <div className="mt-0.5 inline-flex items-center rounded-full px-1.5 py-[1px] font-mono text-[9px] uppercase tracking-[0.14em] text-tertiary ring-1 ring-inset ring-[rgb(var(--border-subtle))]">
                        {sector}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-[12px] tabular-nums text-primary">
                      {amount !== null ? formatFcfa(amount, { compact: true }) : "—"}
                    </div>
                    <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-tertiary">
                      FCFA
                    </div>
                  </div>
                </div>
                <ScoreBar score={score} />
              </li>
            );
          })}
        </ul>
      )}
    </Widget>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(10, score)) * 10;
  const tone = score >= 8 ? "bg-gold" : score >= 6 ? "bg-status-ok" : "bg-status-warn";
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="surface-subtle relative h-1 flex-1 overflow-hidden rounded-full">
        <div
          className={tone}
          style={{ width: `${pct}%`, height: "100%", transition: "width 240ms cubic-bezier(0.16,1,0.3,1)" }}
        />
      </div>
      <span className="w-7 text-right font-mono text-[10px] tabular-nums text-tertiary">
        {score.toFixed(1).replace(".", ",")}
      </span>
    </div>
  );
}
