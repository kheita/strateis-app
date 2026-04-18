import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, Sun, Moon, Bell, ChevronRight } from "lucide-react";
import { findModuleByPath, findSectionById } from "../../config/navigation";
import { useTheme } from "../../contexts/ThemeContext";
import { useUtcClock } from "../../hooks/useUtcClock";
import { useCommandPalette } from "../../contexts/CommandPaletteContext";
import { MONITORED_SOURCES, getOverallHealth, type SourceStatus } from "../../config/sources";
import { Tooltip } from "../common/Tooltip";
import { Kbd, getModKeyLabel } from "../common/Kbd";
import { StatusPanel } from "../status/StatusPanel";
import { cn } from "../../lib/cn";

const HEALTH_LABEL: Record<SourceStatus, string> = {
  ok: "Tous systèmes opérationnels",
  stale: "Sources obsolètes détectées",
  down: "Source(s) indisponible(s)",
};

const HEALTH_SHORT: Record<SourceStatus, string> = {
  ok: "stable",
  stale: "dégradé",
  down: "incident",
};

const HEALTH_DOT: Record<SourceStatus, string> = {
  ok: "bg-status-ok",
  stale: "bg-status-warn",
  down: "bg-status-down",
};

const HEALTH_TEXT: Record<SourceStatus, string> = {
  ok: "status-ok",
  stale: "status-warn",
  down: "status-down",
};

export function TopBar() {
  const { pathname } = useLocation();
  const { theme, toggle: toggleTheme } = useTheme();
  const clock = useUtcClock();
  const { openPalette } = useCommandPalette();

  const moduleEntry = findModuleByPath(pathname);
  const section = moduleEntry ? findSectionById(moduleEntry.section) : undefined;

  const [statusOpen, setStatusOpen] = useState(false);
  const statusBtnRef = useRef<HTMLButtonElement>(null);

  const overallHealth = getOverallHealth(MONITORED_SOURCES);

  return (
    <header className="surface border-subtle relative z-30 flex h-[56px] shrink-0 items-center gap-3 border-b px-3 sm:px-4">
      <Breadcrumb sectionLabel={section?.label} moduleLabel={moduleEntry?.label} />

      <div className="mx-auto hidden w-full max-w-[420px] md:block">
        <button
          type="button"
          onClick={openPalette}
          className="surface-subtle border-subtle hover:surface-hover hover:border-default group flex h-9 w-full items-center gap-2.5 rounded-md border px-3 text-left transition-base"
        >
          <Search size={13.5} strokeWidth={1.75} className="text-tertiary shrink-0" />
          <span className="text-[12.5px] text-tertiary group-hover:text-secondary">
            Rechercher un module…
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Kbd>{getModKeyLabel()}</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <div className="relative">
          <button
            ref={statusBtnRef}
            type="button"
            onClick={() => setStatusOpen((v) => !v)}
            aria-label="Statut système"
            className={cn(
              "surface-subtle border-subtle hover:surface-hover flex h-9 items-center gap-2 rounded-md border px-2.5 transition-base",
              statusOpen && "surface-hover",
            )}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className={cn("absolute inset-0 animate-pulse-soft rounded-full", HEALTH_DOT[overallHealth], "opacity-50")} />
              <span className={cn("relative h-1.5 w-1.5 rounded-full", HEALTH_DOT[overallHealth])} />
            </span>
            <span className={cn("hidden font-mono text-[10.5px] uppercase tracking-[0.14em] sm:inline", HEALTH_TEXT[overallHealth])}>
              {HEALTH_SHORT[overallHealth]}
            </span>
          </button>
          <StatusPanel
            open={statusOpen}
            onClose={() => setStatusOpen(false)}
            anchorRef={statusBtnRef}
          />
        </div>

        <UtcClockDisplay date={clock.date} time={clock.time} healthLabel={HEALTH_LABEL[overallHealth]} />

        <Tooltip label="Notifications" side="bottom">
          <button
            type="button"
            aria-label="Notifications"
            className="hover:surface-subtle text-tertiary hover:text-primary relative flex h-9 w-9 items-center justify-center rounded-md transition-base"
          >
            <Bell size={14.5} strokeWidth={1.75} />
            <span className="bg-gold absolute right-2 top-2 h-1.5 w-1.5 rounded-full" />
          </button>
        </Tooltip>

        <Tooltip label={theme === "dark" ? "Mode clair" : "Mode sombre"} side="bottom">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Basculer le thème"
            className="hover:surface-subtle text-tertiary hover:text-primary flex h-9 w-9 items-center justify-center rounded-md transition-base"
          >
            {theme === "dark" ? (
              <Sun size={14.5} strokeWidth={1.75} />
            ) : (
              <Moon size={14.5} strokeWidth={1.75} />
            )}
          </button>
        </Tooltip>
      </div>
    </header>
  );
}

function Breadcrumb({
  sectionLabel,
  moduleLabel,
}: {
  sectionLabel?: string;
  moduleLabel?: string;
}) {
  if (!moduleLabel) {
    return (
      <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-tertiary">
        <span>Strateis</span>
      </div>
    );
  }
  return (
    <div className="flex min-w-0 items-center gap-1.5 truncate">
      {sectionLabel && (
        <>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-tertiary">
            {sectionLabel}
          </span>
          <ChevronRight size={11} strokeWidth={2} className="text-muted shrink-0" />
        </>
      )}
      <span className="truncate text-[13px] font-medium text-primary">{moduleLabel}</span>
    </div>
  );
}

function UtcClockDisplay({
  date,
  time,
  healthLabel,
}: {
  date: string;
  time: string;
  healthLabel: string;
}) {
  return (
    <Tooltip label={healthLabel} side="bottom">
      <div className="border-subtle ml-1 hidden flex-col items-end border-l pl-3 lg:flex">
        <div className="font-mono text-[11px] tracking-[0.04em] text-primary tabular-nums">
          {time}
          <span className="ml-1 text-[9px] uppercase tracking-[0.18em] text-tertiary">UTC</span>
        </div>
        <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-tertiary tabular-nums">
          {date}
        </div>
      </div>
    </Tooltip>
  );
}
