// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/ui)
//
// Donut (rosca) em SVG puro — sem dependência externa. Cada fatia é um arco
// desenhado por `stroke-dasharray` sobre um círculo. Cores por prop (paleta
// Noturno). O conteúdo central (total) é passado como `children` para flexibilidade.

import type { ReactNode } from "react";

type DonutSlice = {
  /** Participação 0–100. */
  percent: number;
  color: string;
};

type DonutChartProps = {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  children?: ReactNode;
};

export function DonutChart({
  slices,
  size = 180,
  thickness = 22,
  children,
}: DonutChartProps) {
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;

  // Soma-prefixo (sem mutação no render): início acumulado de cada fatia.
  const starts = slices.map((_, i) =>
    slices.slice(0, i).reduce((sum, s) => sum + s.percent, 0),
  );

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={thickness}
        />
        {slices.map((s, i) => {
          const len = (s.percent / 100) * circ;
          // Pequeno vão entre fatias para separação visual.
          const seg = Math.max(0, len - 2);
          const dash = `${seg} ${circ - seg}`;
          const offset = -(starts[i] / 100) * circ;
          return (
            <circle
              key={i}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      )}
    </div>
  );
}
