import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

type Props = {
  icon?: LucideIcon;
  title: string;
  caption?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
};

export function Widget({
  icon: Icon,
  title,
  caption,
  right,
  children,
  className,
  bodyClassName,
  noPadding,
}: Props) {
  return (
    <section
      className={cn(
        "surface border-subtle flex min-h-[280px] flex-col rounded-xl border shadow-elev-1",
        className,
      )}
    >
      <header className="border-subtle flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon && (
            <div className="bg-gold-soft text-gold flex h-6 w-6 shrink-0 items-center justify-center rounded-md">
              <Icon size={11.5} strokeWidth={1.75} />
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-medium text-primary">{title}</div>
            {caption && (
              <div className="truncate font-mono text-[9.5px] uppercase tracking-[0.16em] text-tertiary">
                {caption}
              </div>
            )}
          </div>
        </div>
        {right && <div className="flex shrink-0 items-center gap-1.5">{right}</div>}
      </header>
      <div className={cn("flex min-h-0 flex-1 flex-col", !noPadding && "p-4", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
