import { RefreshCw } from "lucide-react";
import { formatRelativeFr } from "../../lib/format";
import { cn } from "../../lib/cn";

type Props = {
  lastSync: Date | null;
  refreshing: boolean;
  onRefresh: () => void;
};

export function RefreshControl({ lastSync, refreshing, onRefresh }: Props) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={refreshing}
      aria-label="Rafraîchir"
      className="surface-subtle border-subtle hover:surface-hover hover:border-default group inline-flex h-9 items-center gap-2.5 rounded-md border px-2.5 transition-base disabled:opacity-60"
    >
      <RefreshCw
        size={12}
        strokeWidth={2}
        className={cn(
          "text-tertiary group-hover:text-secondary",
          refreshing && "animate-spin",
        )}
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-tertiary group-hover:text-secondary">
        Sync
      </span>
      <span className="font-mono text-[10.5px] tabular-nums text-secondary">
        {refreshing ? "…" : formatRelativeFr(lastSync)}
      </span>
    </button>
  );
}
