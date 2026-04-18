import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const computeCoords = useCallback(() => {
    const trigger = wrapperRef.current;
    const tip = tooltipRef.current;
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    const tw = tip?.offsetWidth ?? 0;
    const th = tip?.offsetHeight ?? 0;
    const gap = 8;
    let top = 0;
    let left = 0;
    switch (side) {
      case "right":
        top = r.top + r.height / 2 - th / 2;
        left = r.right + gap;
        break;
      case "left":
        top = r.top + r.height / 2 - th / 2;
        left = r.left - tw - gap;
        break;
      case "top":
        top = r.top - th - gap;
        left = r.left + r.width / 2 - tw / 2;
        break;
      case "bottom":
        top = r.bottom + gap;
        left = r.left + r.width / 2 - tw / 2;
        break;
    }
    // Clamp horizontally inside viewport.
    const maxLeft = window.innerWidth - tw - 4;
    if (left < 4) left = 4;
    if (tw && left > maxLeft) left = maxLeft;
    setCoords({ top, left });
  }, [side]);

  const show = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setOpen(true);
      // Compute on next frame after the tooltip mounts so we know its size.
      requestAnimationFrame(() => computeCoords());
    }, delay);
  };

  const hide = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setOpen(false);
    setCoords(null);
  };

  // Recompute on scroll/resize while visible
  useEffect(() => {
    if (!open) return;
    const onUpdate = () => computeCoords();
    window.addEventListener("scroll", onUpdate, true);
    window.addEventListener("resize", onUpdate);
    return () => {
      window.removeEventListener("scroll", onUpdate, true);
      window.removeEventListener("resize", onUpdate);
    };
  }, [open, computeCoords]);

  return (
    <span
      ref={wrapperRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      className={cn("relative inline-flex", className)}
    >
      {children}
      {open &&
        createPortal(
          <span
            ref={tooltipRef}
            role="tooltip"
            style={{
              position: "fixed",
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
              opacity: coords ? 1 : 0,
            }}
            className="pointer-events-none z-[100] flex items-center gap-2 whitespace-nowrap rounded-md border border-default surface-elevated px-2 py-1 text-[11.5px] text-primary shadow-elev-2 animate-fade-in"
          >
            {label}
            {shortcut && (
              <span className="font-mono text-[10px] text-tertiary">{shortcut}</span>
            )}
          </span>,
          document.body,
        )}
    </span>
  );
}
