type Props = {
  values: number[];
  width?: number;
  height?: number;
  /** Tone influences stroke color */
  tone?: "neutral" | "up" | "down" | "gold";
  className?: string;
  strokeWidth?: number;
};

const TONE_CLASS: Record<NonNullable<Props["tone"]>, string> = {
  neutral: "stroke-current text-tertiary",
  up: "stroke-current status-ok",
  down: "stroke-current status-down",
  gold: "stroke-current text-gold",
};

export function Sparkline({
  values,
  width = 120,
  height = 32,
  tone = "neutral",
  className,
  strokeWidth = 1.25,
}: Props) {
  if (values.length < 2) {
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className={className}
        aria-hidden="true"
      >
        <line
          x1={0}
          x2={width}
          y1={height / 2}
          y2={height / 2}
          stroke="currentColor"
          strokeWidth={1}
          className="text-muted opacity-40"
          strokeDasharray="2 3"
        />
      </svg>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  // Build a closed path for fill
  const fillPath = `M0,${height} L${points
    .split(" ")
    .map((p) => p.replace(",", " "))
    .join(" L")} L${width},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={fillPath} className={TONE_CLASS[tone]} fill="currentColor" opacity={0.08} stroke="none" />
      <polyline
        points={points}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        className={TONE_CLASS[tone]}
      />
    </svg>
  );
}

type BarsProps = {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
  tone?: "neutral" | "gold";
};

export function VerticalBars({
  values,
  width = 180,
  height = 56,
  className,
  tone = "gold",
}: BarsProps) {
  if (values.length === 0) {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={className} aria-hidden="true">
        <line x1={0} x2={width} y1={height - 1} y2={height - 1} stroke="currentColor" className="text-muted opacity-40" strokeWidth={1} />
      </svg>
    );
  }
  const max = Math.max(...values, 1);
  const gap = 2;
  const barW = Math.max(2, (width - gap * (values.length - 1)) / values.length);
  const colorClass = tone === "gold" ? "text-gold" : "text-tertiary";
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {values.map((v, i) => {
        const h = (v / max) * (height - 2);
        const x = i * (barW + gap);
        const y = height - h;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={Math.max(1, h)}
            rx={1}
            className={colorClass}
            fill="currentColor"
            opacity={i === values.length - 1 ? 0.95 : 0.55}
          />
        );
      })}
    </svg>
  );
}
