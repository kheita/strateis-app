import { cn } from "../../lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "block animate-pulse-soft rounded-md",
        className,
      )}
      style={{ backgroundColor: "rgb(var(--bg-subtle))" }}
      aria-hidden="true"
    />
  );
}
