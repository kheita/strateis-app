import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "../../lib/cn";

type Side = "right" | "bottom" | "top" | "left";

export function Tooltip({
  label,
  children,
  side = "right",
  delay = 350,
  shortcut,
  className,
}: {
  label: string;
  children: ReactNode;
  side?: Side;
  delay?: number;
  shortcut?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const t = useRef<number | null>(null);

  useEffect(() => () => { if (t.current) window.clearTimeout(t.current); }, []);

  const show = () => {
    if (t.current) window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    if (t.current) window.clearTimeout(t.current);
    setOpen(false);
  };

  const sideStyles: Record<Side, string> = {
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  };

  return (
    <span
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      className={cn("relative inline-flex", className)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 flex items-center gap-2 whitespace-nowrap rounded-md border border-default surface-elevated px-2 py-1 text-[11.5px] text-primary shadow-elev-2 animate-fade-in",
            sideStyles[side],
          )}
        >
          {label}
          {shortcut && (
            <span className="font-mono text-[10px] text-tertiary">{shortcut}</span>
          )}
        </span>
      )}
    </span>
  );
}
