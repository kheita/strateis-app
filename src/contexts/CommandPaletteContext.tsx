import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type CommandPaletteContextValue = {
  open: boolean;
  openPalette: () => void;
  closePalette: () => void;
  toggle: () => void;
};

const Ctx = createContext<CommandPaletteContextValue | undefined>(undefined);

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isModK = (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K");
      if (isModK) {
        // ⌘K should always work even from inside inputs — it's the global search shortcut.
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const value = useMemo(() => ({ open, openPalette, closePalette, toggle }), [open, openPalette, closePalette, toggle]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCommandPalette(): CommandPaletteContextValue {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  return c;
}
