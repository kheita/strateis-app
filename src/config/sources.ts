export type SourceStatus = "ok" | "stale" | "down";

export type MonitoredSource = {
  id: string;
  name: string;
  category: string;
  status: SourceStatus;
  /** Minutes since last successful update. */
  lastUpdateMinutes: number;
  /** Human-readable expected cadence in French. */
  cadence: string;
  /** Recent uptime as a percentage 0–100. */
  uptime7d: number;
};

export const MONITORED_SOURCES: MonitoredSource[] = [
  {
    id: "seo-monitor",
    name: "SEO Monitor",
    category: "Visibilité",
    status: "ok",
    lastUpdateMinutes: 18,
    cadence: "Toutes les heures",
    uptime7d: 99.8,
  },
  {
    id: "b2g-pipeline",
    name: "B2G Pipeline",
    category: "Veille",
    status: "ok",
    lastUpdateMinutes: 42,
    cadence: "Toutes les 2 heures",
    uptime7d: 99.4,
  },
  {
    id: "africatech-feed",
    name: "AfricaTech Feed",
    category: "Veille",
    status: "ok",
    lastUpdateMinutes: 9,
    cadence: "Toutes les 30 min",
    uptime7d: 99.9,
  },
  {
    id: "ia-tech-watch",
    name: "IA & Tech Watch",
    category: "Veille",
    status: "stale",
    lastUpdateMinutes: 184,
    cadence: "Toutes les 30 min",
    uptime7d: 97.1,
  },
  {
    id: "veille-reglementaire",
    name: "Veille réglementaire",
    category: "Réglementaire",
    status: "ok",
    lastUpdateMinutes: 73,
    cadence: "4 fois par jour",
    uptime7d: 99.6,
  },
  {
    id: "concurrence-radar",
    name: "Radar concurrence",
    category: "Concurrence",
    status: "ok",
    lastUpdateMinutes: 121,
    cadence: "2 fois par jour",
    uptime7d: 98.7,
  },
  {
    id: "news-wire",
    name: "News Wire",
    category: "Veille",
    status: "down",
    lastUpdateMinutes: 412,
    cadence: "Continu",
    uptime7d: 92.3,
  },
  {
    id: "supabase-core",
    name: "Supabase Core",
    category: "Infrastructure",
    status: "ok",
    lastUpdateMinutes: 1,
    cadence: "Continu",
    uptime7d: 100,
  },
];

export function getOverallHealth(sources: MonitoredSource[]): SourceStatus {
  if (sources.some((s) => s.status === "down")) return "down";
  if (sources.some((s) => s.status === "stale")) return "stale";
  return "ok";
}
