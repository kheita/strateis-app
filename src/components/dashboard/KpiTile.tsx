import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";
import { formatDeltaPct, deltaTone, formatRelativeFr, type Delta } from "../../lib/format";
import { cn } from "../../lib/cn";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: Delta | null;
  subMetric?: React.ReactNode;
  trend?: number[];
  trendCaption?: string;
  loading?: boolean;
  empty?: { title: string; description: string; pastille?: string; icon: LucideIcon };
  stale?: boolean;
  /** Timestamp of the last known data point (used for stale state). */
  lastValueDate?: string | null;
};

export function KpiTile({
  icon: Icon,
  label,
  value,
  delta,
  subMetric,
  trend,
  trendCaption,
  loading,
  empty,
  stale,
  lastValueDate,
}: Props) {
  if (loading) {
    return (
      <div className="surface border-subtle flex h-[156px] flex-col rounded-xl border p-5 shadow-elev-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-2.5 w-24" />
        </div>
        <Skeleton className="mt-4 h-7 w-32" />
        <Skeleton className="mt-3 h-2.5 w-20" />
        <div className="mt-auto">
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="surface border-subtle flex h-[156px] flex-col rounded-xl border shadow-elev-1">
        <div className="flex items-center gap-2 px-5 pt-4">
          <div className="bg-gold-soft text-gold flex h-5 w-5 items-center justify-center rounded-md">
            <Icon size={10.5} strokeWidth={1.75} />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-tertiary">{label}</span>
        </div>
        <div className="flex flex-1 items-center justify-center px-3 pb-3">
          <EmptyState
            icon={empty.icon}
            title={empty.title}
            description={empty.description}
            pastille={empty.pastille}
            compact
          />
        </div>
      </div>
    );
  }

  const tone = deltaTone(delta);

  return (
    <div className="surface border-subtle group relative flex h-[156px] flex-col rounded-xl border p-5 shadow-elev-1 transition-base hover:border-default">
      <div className="flex items-center gap-2">
        <div className="bg-gold-soft text-gold flex h-5 w-5 items-center justify-center rounded-md">
          <Icon size={10.5} strokeWidth={1.75} />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-tertiary">{label}</span>
        {stale && (
          <span
            className="ml-auto inline-flex items-center rounded-full px-1.5 py-[1px] font-mono text-[8.5px] uppercase tracking-[0.16em] status-warn ring-1 ring-inset"
            style={{ borderColor: "rgba(224,187,94,0.35)" }}
            title="Donnée datant de plus de 24 heures"
          >
            Données obsolètes
          </span>
        )}
      </div>

      <div
        className={cn(
          "mt-3 font-medium tracking-[-0.02em] tabular-nums text-primary",
          stale && "opacity-50",
        )}
        style={{ fontSize: "26px", lineHeight: "1.1" }}
      >
        {value}
      </div>

      <div className="mt-1 flex items-center gap-2 text-[11px]">
        {delta !== undefined && delta !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-mono tabular-nums",
              tone === "up" && "status-ok",
              tone === "down" && "status-down",
              tone === "flat" && "text-tertiary",
            )}
          >
            {tone === "up" ? (
              <ArrowUpRight size={11} strokeWidth={2} />
            ) : tone === "down" ? (
              <ArrowDownRight size={11} strokeWidth={2} />
            ) : (
              <Minus size={11} strokeWidth={2} />
            )}
            {formatDeltaPct(delta)}
          </span>
        )}
        {subMetric && (
          <span className="truncate font-mono text-[10.5px] text-tertiary tabular-nums">{subMetric}</span>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 pt-2">
        <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
          {stale && lastValueDate
            ? `Dernière valeur · ${formatRelativeFr(lastValueDate)}`
            : (trendCaption ?? "")}
        </div>
        <Sparkline
          values={trend ?? []}
          width={120}
          height={32}
          tone={tone === "down" ? "down" : tone === "up" ? "up" : "gold"}
        />
      </div>
    </div>
  );
}
