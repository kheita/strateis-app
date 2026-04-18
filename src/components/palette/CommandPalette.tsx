import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, CornerDownLeft } from "lucide-react";
import { useCommandPalette } from "../../contexts/CommandPaletteContext";
import { NAVIGATION, type NavModule } from "../../config/navigation";
import { Kbd } from "../common/Kbd";
import { cn } from "../../lib/cn";

type FlatItem = { module: NavModule; sectionLabel: string };

const ALL_FLAT: FlatItem[] = NAVIGATION.flatMap((s) =>
  s.modules.map((m) => ({ module: m, sectionLabel: s.label })),
);

function matches(query: string, m: NavModule, sectionLabel: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  return (
    m.label.toLowerCase().includes(q) ||
    sectionLabel.toLowerCase().includes(q) ||
    m.subtitle.toLowerCase().includes(q)
  );
}

export function CommandPalette() {
  const { open, closePalette } = useCommandPalette();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => ALL_FLAT.filter((it) => matches(query, it.module, it.sectionLabel)),
    [query],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, FlatItem[]>();
    for (const it of filtered) {
      const arr = map.get(it.sectionLabel) ?? [];
      arr.push(it);
      map.set(it.sectionLabel, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      // Focus input after mount
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setActiveIndex(0), [query]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePalette();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const target = filtered[activeIndex];
        if (target) {
          e.preventDefault();
          navigate(target.module.path);
          closePalette();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, activeIndex, navigate, closePalette]);

  // Auto-scroll active row into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
        >
          <div
            className="absolute inset-0 bg-[rgb(var(--bg-app))]/65 backdrop-blur-md"
            onClick={closePalette}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Palette de commandes"
            className="surface-elevated border-default relative z-10 w-full max-w-[560px] overflow-hidden rounded-xl border shadow-elev-3"
          >
            <div className="border-subtle flex items-center gap-3 border-b px-4 py-3">
              <Search size={15} className="text-tertiary shrink-0" strokeWidth={1.75} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un module…"
                className="flex-1 bg-transparent text-[14px] text-primary placeholder:text-muted focus:outline-none"
              />
              <Kbd>esc</Kbd>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-tertiary">
                    Aucun résultat
                  </div>
                  <div className="mt-1 text-[12.5px] text-secondary">
                    Aucun module ne correspond à <span className="text-primary">"{query}"</span>.
                  </div>
                </div>
              ) : (
                grouped.map(([sectionLabel, items]) => (
                  <div key={sectionLabel} className="mb-1">
                    <div className="px-4 pb-1 pt-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-tertiary">
                      {sectionLabel}
                    </div>
                    {items.map((it) => {
                      const idx = filtered.indexOf(it);
                      const Icon = it.module.icon;
                      const isActive = idx === activeIndex;
                      return (
                        <button
                          key={it.module.id}
                          data-idx={idx}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => {
                            navigate(it.module.path);
                            closePalette();
                          }}
                          className={cn(
                            "group mx-1 flex w-[calc(100%-8px)] items-center gap-3 rounded-md px-3 py-2 text-left transition-base",
                            isActive ? "surface-hover" : "hover:surface-subtle",
                          )}
                        >
                          <Icon
                            size={15}
                            strokeWidth={1.6}
                            className={cn(
                              "shrink-0",
                              isActive ? "text-gold" : "text-tertiary group-hover:text-secondary",
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] text-primary">{it.module.label}</div>
                            <div className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-tertiary">
                              {sectionLabel} · {it.module.path}
                            </div>
                          </div>
                          {it.module.badge && (
                            <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
                              {it.module.badge}
                            </span>
                          )}
                          {isActive && (
                            <CornerDownLeft size={12} className="text-tertiary" strokeWidth={2} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="border-subtle flex items-center justify-between border-t px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                  naviguer
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>↵</Kbd>
                  ouvrir
                </span>
              </div>
              <span>{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
