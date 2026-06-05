// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/ui)
//
// Mini-gráfico de tendência (sparkline) em SVG puro — sem dependência externa.
// Recebe uma série curta de números e a desenha como linha suave com área
// preenchida por gradiente. A cor vem por prop (`stroke`), sempre da paleta
// Noturno (currentColor por padrão). Decorativo: `aria-hidden`.

"use client";

import { useId } from "react";

type SparklineProps = {
  data: number[];
  /** Cor da linha/área (currentColor herda do contexto). */
  stroke?: string;
  width?: number;
  height?: number;
  className?: string;
};

export function Sparkline({
  data,
  stroke = "currentColor",
  width = 96,
  height = 40,
  className = "",
}: SparklineProps) {
  const gradientId = useId();

  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 3;
  const stepX = (width - pad * 2) / (data.length - 1);

  const points = data.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (height - pad * 2) * (1 - (v - min) / span);
    return [x, y] as const;
  });

  const line = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  const area =
    `${line} L${points[points.length - 1][0].toFixed(1)},${height - pad} ` +
    `L${points[0][0].toFixed(1)},${height - pad} Z`;

  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ color: stroke }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={2.6} fill="currentColor" />
    </svg>
  );
}
