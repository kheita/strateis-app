// French-locale formatters for the Intelligence dashboard.
// Use a non-breaking space as the thousands separator (cabinet style).

const NBSP = "\u202F"; // narrow no-break space

export function formatFcfa(value: number | null | undefined, opts?: { compact?: boolean }): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (opts?.compact && abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2).replace(".", ",")}${NBSP}Mds`;
  }
  if (opts?.compact && abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(".", ",")}${NBSP}M`;
  }
  if (opts?.compact && abs >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(".", ",")}${NBSP}k`;
  }
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\u00A0/g, NBSP);
}

export function formatInt(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("fr-FR").format(value).replace(/\u00A0/g, NBSP);
}

export type Delta = {
  value: number; // signed difference
  pct: number | null; // signed percentage, null if base is 0
};

export function computeDelta(current: number | null, previous: number | null): Delta | null {
  if (current === null || previous === null) return null;
  const value = current - previous;
  const pct = previous === 0 ? null : (value / Math.abs(previous)) * 100;
  return { value, pct };
}

export function formatDeltaPct(d: Delta | null | undefined): string {
  if (!d) return "—";
  if (d.pct === null) return d.value === 0 ? "±0" : d.value > 0 ? "nouveau" : "—";
  const sign = d.pct > 0 ? "+" : d.pct < 0 ? "−" : "±";
  const v = Math.abs(d.pct).toFixed(1).replace(".", ",");
  return `${sign}${v}${NBSP}%`;
}

export function deltaTone(d: Delta | null | undefined): "up" | "down" | "flat" {
  if (!d) return "flat";
  const v = d.pct ?? d.value;
  if (v > 0.05) return "up";
  if (v < -0.05) return "down";
  return "flat";
}

export function formatRelativeFr(date: Date | string | number | null | undefined): string {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin}${NBSP}min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}${NBSP}h`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) {
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    return `hier ${hh}:${mm}`;
  }
  if (diffD < 7) return `il y a ${diffD}${NBSP}j`;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(d);
}

export function formatTimeUtc(date: Date | string | number | null | undefined): string {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Returns true if the given timestamp is older than `maxAgeMs`. */
export function isStale(
  date: Date | string | number | null | undefined,
  maxAgeMs = 24 * 60 * 60 * 1000,
): boolean {
  if (!date) return false;
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  return Date.now() - d.getTime() > maxAgeMs;
}
