import { useCallback, useEffect, useRef, useState } from "react";
import { fetchDashboardSnapshot, type DashboardSnapshot } from "../lib/dashboardApi";

const POLL_MS = 60_000;

type State = {
  snapshot: DashboardSnapshot | null;
  loading: boolean; // true on initial load only
  refreshing: boolean; // true on subsequent loads
  /** Network-level error (everything failed). */
  error: string | null;
  /** Partial errors: at least one view succeeded, but some failed. */
  partialError: string | null;
  lastSync: Date | null;
};

export function useDashboardData() {
  const [state, setState] = useState<State>({
    snapshot: null,
    loading: true,
    refreshing: false,
    error: null,
    partialError: null,
    lastSync: null,
  });
  const inflight = useRef<AbortController | null>(null);

  const load = useCallback(async (isInitial: boolean) => {
    inflight.current?.abort();
    const ac = new AbortController();
    inflight.current = ac;
    setState((s) => ({
      ...s,
      loading: isInitial && !s.snapshot,
      refreshing: !isInitial || !!s.snapshot,
    }));
    try {
      const snap = await fetchDashboardSnapshot(ac.signal);
      if (ac.signal.aborted) return;
      const failedViews = Object.keys(snap.viewErrors);
      // If every view failed, treat as a global error (and keep the previous
      // snapshot in cache so widgets can still render their last known values).
      const allFailed = failedViews.length === 5;
      setState((prev) => ({
        snapshot: allFailed && prev.snapshot ? prev.snapshot : snap,
        loading: false,
        refreshing: false,
        error: allFailed ? formatGlobalError(snap.viewErrors) : null,
        partialError:
          !allFailed && failedViews.length > 0
            ? `Sources indisponibles : ${failedViews.join(", ")}`
            : null,
        lastSync: allFailed && prev.snapshot ? prev.lastSync : new Date(),
      }));
    } catch (err) {
      if (ac.signal.aborted) return;
      const msg = err instanceof Error ? err.message : "Erreur réseau";
      setState((s) => ({
        ...s,
        loading: false,
        refreshing: false,
        error: msg,
      }));
    }
  }, []);

  useEffect(() => {
    void load(true);
    const id = window.setInterval(() => void load(false), POLL_MS);
    return () => {
      window.clearInterval(id);
      inflight.current?.abort();
    };
  }, [load]);

  const refresh = useCallback(() => void load(false), [load]);

  return { ...state, refresh };
}

function formatGlobalError(errors: Record<string, string>): string {
  const first = Object.values(errors)[0];
  return first ?? "Synchronisation impossible";
}
