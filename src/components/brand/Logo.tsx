import { cn } from "../../lib/cn";

type Props = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

export function Logo({ size = 28, showWordmark = true, className }: Props) {
  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <LogoMark size={size} />
      {showWordmark && (
        <div className="leading-tight">
          <div className="text-primary text-[14.5px] font-semibold tracking-[-0.01em]">
            Strateis<span className="text-gold">.</span>
          </div>
          <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-tertiary">
            Cockpit
          </div>
        </div>
      )}
    </div>
  );
}

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Strateis"
      className="shrink-0"
    >
      <rect width="64" height="64" rx="14" fill="#0B1121" />
      <rect
        x="20"
        y="18"
        width="24"
        height="34"
        rx="3"
        stroke="#D4A853"
        strokeWidth="1.25"
        fill="none"
        opacity="0.45"
      />
      <path
        d="M22 20h20a4 4 0 0 1 0 8H30a4 4 0 0 0 0 8h8a8 8 0 0 1 0 16H22"
        stroke="#D4A853"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
