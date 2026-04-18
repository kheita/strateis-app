import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, RefreshCw, X } from "lucide-react";
import { MONITORED_SOURCES, type MonitoredSource, type SourceStatus } from "../../config/sources";
import { cn } from "../../lib/cn";

type Mode = "dropdown" | "sheet";

type Props = {
  open: boolean;
  onClose: () => void;
  /** "dropdown" anchors below a topbar trigger; "sheet" is a centered modal for mobile. */
  mode?: Mode;
  /** Required only in dropdown mode: clicking the anchor itself shouldn't close the panel. */
  anchorRef?: React.RefObject<HTMLElement | null>;
};

const STATUS_LABELS: Record<SourceStatus, string> = {
  ok: "Stable",
  stale: "Obsolète",
  down: "Indisponible",
};

const STATUS_DOT_BG: Record<SourceStatus, string> = {
  ok: "bg-status-ok",
  stale: "bg-status-warn",
  down: "bg-status-down",
};

const STATUS_TEXT: Record<SourceStatus, string> = {
  ok: "status-ok",
  stale: "status-warn",
  down: "status-down",
};

function relativeFr(min: number): string {
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

export function StatusPanel({ open, onClose, mode = "dropdown", anchorRef }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Dropdown mode uses outside click detection (no backdrop).
  useEffect(() => {
    if (!open || mode !== "dropdown") return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef?.current?.contains(target)) return;
      onClose();
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open, mode, onClose, anchorRef]);

  const grouped = useMemo(() => {
    const map = new Map<string, MonitoredSource[]>();
    for (const s of MONITORED_SOURCES) {
      const arr = map.get(s.category) ?? [];
      arr.push(s);
      map.set(s.category, arr);
    }
    return Array.from(map.entries());
  }, []);

  const counts = useMemo(() => {
    const ok = MONITORED_SOURCES.filter((s) => s.status === "ok").length;
    const stale = MONITORED_SOURCES.filter((s) => s.status === "stale").length;
    const down = MONITORED_SOURCES.filter((s) => s.status === "down").length;
    return { ok, stale, down, total: MONITORED_SOURCES.length };
  }, []);

  const card = (
    <div className="surface-elevated border-default overflow-hidden rounded-xl border shadow-elev-3">
      <div className="border-subtle flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Activity size={14} className="text-gold" strokeWidth={1.75} />
          <div>
            <div className="text-[12.5px] font-medium text-primary">Statut système</div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-tertiary">
              Transparence radicale
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="surface-subtle hover:surface-hover text-tertiary hover:text-primary rounded-md p-1 transition-base"
        >
          <X size={13} strokeWidth={2} />
        </button>
      </div>

      <div className="border-subtle grid grid-cols-3 border-b">
        <Counter label="Stables" value={counts.ok} variant="ok" />
        <Counter label="Obsolètes" value={counts.stale} variant="stale" divider />
        <Counter label="Indispo." value={counts.down} variant="down" divider />
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {grouped.map(([category, sources]) => (
          <div key={category}>
            <div className="border-subtle surface-subtle/60 sticky top-0 z-[1] border-b px-4 py-1.5 backdrop-blur">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-tertiary">
                {category}
              </div>
            </div>
            {sources.map((src) => (
              <SourceRow key={src.id} src={src} />
            ))}
          </div>
        ))}
      </div>

      <div className="border-subtle flex items-center justify-between border-t px-4 py-2.5">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-tertiary">
          <RefreshCw size={10} strokeWidth={2} />
          Mock · données simulées
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">v0.1</span>
      </div>
    </div>
  );

  if (mode === "sheet") {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-label="Statut système"
          >
            <div
              className="absolute inset-0"
              style={{
                background: "rgba(6, 11, 20, 0.65)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
              onClick={onClose}
            />
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-[420px] px-4 pb-4 sm:p-0"
            >
              {card}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-[calc(100%+8px)] z-40 w-[380px] origin-top-right"
          role="dialog"
          aria-label="Statut système"
        >
          {card}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Counter({
  label,
  value,
  variant,
  divider,
}: {
  label: string;
  value: number;
  variant: SourceStatus;
  divider?: boolean;
}) {
  return (
    <div className={cn("px-4 py-3", divider && "border-subtle border-l")}>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-mono text-[18px] font-medium tracking-[-0.01em]",
            STATUS_TEXT[variant],
          )}
        >
          {value}
        </span>
      </div>
      <div className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-tertiary">
        {label}
      </div>
    </div>
  );
}

function SourceRow({ src }: { src: MonitoredSource }) {
  return (
    <div className="hover:surface-subtle group flex items-center justify-between px-4 py-2.5 transition-base">
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative flex h-2 w-2 shrink-0">
          {src.status === "ok" && (
            <span
              className={cn(
                "absolute inset-0 animate-pulse-soft rounded-full",
                STATUS_DOT_BG[src.status],
                "opacity-50",
              )}
            />
          )}
          <span className={cn("relative h-2 w-2 rounded-full", STATUS_DOT_BG[src.status])} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[12.5px] text-primary">{src.name}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-tertiary">
            {src.cadence}
          </div>
        </div>
      </div>
      <div className="ml-3 flex flex-col items-end">
        <div className={cn("text-[11px] font-medium", STATUS_TEXT[src.status])}>
          {STATUS_LABELS[src.status]}
        </div>
        <div className="font-mono text-[10px] text-tertiary">
          {relativeFr(src.lastUpdateMinutes)} · {src.uptime7d.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
