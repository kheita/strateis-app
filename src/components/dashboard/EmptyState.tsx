import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  pastille?: string;
  compact?: boolean;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, pastille, compact, className }: Props) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center text-center",
        compact ? "px-4 py-6" : "px-6 py-10",
        className,
      )}
    >
      <div className="surface-subtle border-subtle mb-3 flex h-9 w-9 items-center justify-center rounded-lg border">
        <Icon size={14} strokeWidth={1.6} className="text-tertiary" />
      </div>
      <div className="text-[12.5px] font-medium text-secondary">{title}</div>
      <p className="mt-1 max-w-[26ch] text-[11.5px] leading-relaxed text-tertiary">{description}</p>
      {pastille && (
        <div className="mt-3 inline-flex items-center rounded-full px-2 py-[2px] font-mono text-[9px] uppercase tracking-[0.16em] text-muted ring-1 ring-inset ring-[rgb(var(--border-subtle))]">
          {pastille}
        </div>
      )}
    </div>
  );
}
