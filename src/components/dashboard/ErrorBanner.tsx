import { AlertCircle, AlertTriangle, RefreshCw } from "lucide-react";

type Props = {
  message: string;
  onRetry: () => void;
  variant?: "error" | "partial";
};

export function ErrorBanner({ message, onRetry, variant = "error" }: Props) {
  const isPartial = variant === "partial";
  return (
    <div
      className="border-subtle mb-5 flex items-center gap-3 rounded-lg border px-3.5 py-2.5"
      style={{
        background: isPartial ? "rgba(224, 187, 94, 0.07)" : "rgba(235, 110, 110, 0.06)",
      }}
      role="alert"
    >
      {isPartial ? (
        <AlertTriangle size={13} strokeWidth={1.75} className="status-warn shrink-0" />
      ) : (
        <AlertCircle size={13} strokeWidth={1.75} className="status-down shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-medium text-secondary">
          {isPartial ? "Synchronisation partielle" : "Synchronisation indisponible"}
        </div>
        <div className="truncate font-mono text-[10.5px] text-tertiary">{message}</div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="hover:surface-subtle text-secondary inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-base hover:text-primary"
      >
        <RefreshCw size={10.5} strokeWidth={2} />
        Réessayer
      </button>
    </div>
  );
}
