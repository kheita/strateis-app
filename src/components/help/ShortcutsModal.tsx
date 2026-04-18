import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Keyboard, X, ExternalLink } from "lucide-react";
import { Kbd, getModKeyLabel } from "../common/Kbd";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Shortcut = {
  keys: React.ReactNode;
  label: string;
};

export function ShortcutsModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const mod = getModKeyLabel();

  const navigation: Shortcut[] = [
    {
      keys: (
        <>
          <Kbd>{mod}</Kbd>
          <Kbd>K</Kbd>
        </>
      ),
      label: "Ouvrir la palette de commandes",
    },
    {
      keys: (
        <>
          <Kbd>{mod}</Kbd>
          <Kbd>\</Kbd>
        </>
      ),
      label: "Replier / déployer la sidebar",
    },
    { keys: <Kbd>Esc</Kbd>, label: "Fermer les overlays" },
  ];

  const palette: Shortcut[] = [
    {
      keys: (
        <>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
        </>
      ),
      label: "Naviguer dans la palette",
    },
    { keys: <Kbd>Enter</Kbd>, label: "Ouvrir le module sélectionné" },
  ];

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
          aria-label="Aide & raccourcis"
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
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.985 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[480px] px-4 pb-4 sm:p-0"
          >
            <div className="surface-elevated border-default overflow-hidden rounded-xl border shadow-elev-3">
              <div className="border-subtle flex items-center justify-between border-b px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <Keyboard size={14} className="text-gold" strokeWidth={1.75} />
                  <div>
                    <div className="text-[13px] font-medium text-primary">Aide & raccourcis</div>
                    <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-tertiary">
                      Naviguer plus vite
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

              <Section title="Navigation" rows={navigation} />
              <Section title="Palette de commandes" rows={palette} />

              <div className="border-subtle flex items-center justify-between border-t px-5 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-tertiary">
                  Strateis Cockpit · v0.1
                </span>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="group inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-tertiary transition-base hover:text-secondary"
                >
                  Documentation
                  <ExternalLink size={10} strokeWidth={2} className="opacity-60 group-hover:opacity-100" />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, rows }: { title: string; rows: Shortcut[] }) {
  return (
    <div className="border-subtle border-b last:border-b-0">
      <div className="px-5 pt-4 pb-2">
        <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-tertiary">
          {title}
        </div>
      </div>
      <div className="px-2 pb-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-md px-3 py-2 text-[12.5px] text-secondary"
          >
            <span>{row.label}</span>
            <span className="flex items-center gap-1">{row.keys}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
