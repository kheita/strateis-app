import { cn } from "../../lib/cn";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[4px] border border-default surface-subtle px-1.5 font-mono text-[10px] font-medium text-secondary",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export function getModKeyLabel(): string {
  if (typeof navigator === "undefined") return "Ctrl";
  return /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";
}
