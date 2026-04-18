import { cn } from "../../lib/cn";

type Variant = "neutral" | "gold" | "soon";

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-[1px] font-mono text-[9.5px] uppercase tracking-[0.12em] font-medium",
        variant === "neutral" && "surface-subtle text-tertiary border border-subtle",
        variant === "gold" && "bg-gold-soft text-gold border border-gold/30",
        variant === "soon" && "surface-subtle text-tertiary border border-default/60",
        className,
      )}
    >
      {children}
    </span>
  );
}
