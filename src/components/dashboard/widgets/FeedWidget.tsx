import { useMemo, useState } from "react";
import { Newspaper, Inbox } from "lucide-react";
import { Widget } from "../Widget";
import { EmptyState } from "../EmptyState";
import { Skeleton } from "../Skeleton";
import {
  pickFeedTitle,
  pickFeedDate,
  pickFeedCategory,
  type FeedItem,
} from "../../../lib/dashboardApi";
import { formatRelativeFr } from "../../../lib/format";
import { cn } from "../../../lib/cn";

type Tab = "all" | "africa-tech" | "ai-tech" | "b2g";

const TABS: { id: Tab; label: string; match?: RegExp }[] = [
  { id: "all", label: "Tous" },
  { id: "africa-tech", label: "Africa Tech", match: /africa[\s-]?tech/i },
  { id: "ai-tech", label: "AI Tech", match: /(ai|ia)[\s-]?tech/i },
  { id: "b2g", label: "B2G", match: /b2g/i },
];

type Props = {
  items: FeedItem[];
  loading: boolean;
};

export function FeedWidget({ items, loading }: Props) {
  const [active, setActive] = useState<Tab>("all");

  const filtered = useMemo(() => {
    const tab = TABS.find((t) => t.id === active);
    if (!tab?.match) return items.slice(0, 5);
    return items
      .filter((it) => {
        const cat = pickFeedCategory(it);
        return cat ? tab.match!.test(cat) : false;
      })
      .slice(0, 5);
  }, [items, active]);

  return (
    <Widget
      icon={Newspaper}
      title="Feed Intelligence"
      caption="Dernières publications"
      right={
        <div className="flex items-center gap-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={cn(
                "rounded px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] transition-base",
                active === t.id
                  ? "surface-subtle text-primary"
                  : "text-tertiary hover:text-secondary",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      }
      noPadding
    >
      {loading ? (
        <div className="space-y-3 px-4 py-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-[85%]" />
              <Skeleton className="h-2.5 w-[40%]" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Feed en cours d'alimentation"
          description="Les premiers items remonteront dès le prochain cycle de collecte. Aucune action n'est requise."
          pastille="Collecteur en attente"
        />
      ) : (
        <ul className="divide-y divide-[rgb(var(--border-subtle))]">
          {filtered.map((it, idx) => (
            <li key={(it.id as string | number | undefined) ?? idx} className="px-4 py-2.5">
              <div className="line-clamp-2 text-[12.5px] leading-snug text-primary">
                {pickFeedTitle(it)}
              </div>
              <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-tertiary">
                <span className="truncate">{(it.source as string) ?? "—"}</span>
                <span className="text-muted">·</span>
                <span className="tabular-nums">{formatRelativeFr(pickFeedDate(it))}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Widget>
  );
}
