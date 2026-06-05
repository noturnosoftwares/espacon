// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/ui)
//
// Gráfico de barras agrupadas (duas séries) + linha (terceira série), em SVG
// puro — sem dependência externa, seguindo a decisão dos demais gráficos
// (Sparkline). Responsivo via viewBox (escala com a largura do container). Cores
// vêm por prop (paleta Noturno). Decorativo a nível visual; os valores ficam na
// legenda/tabela do card que o usa.

type Series = {
  label: string;
  bars: { value: number; color: string }[];
  line: number;
};

type BarLineChartProps = {
  data: Series[];
  /** Cor da linha (saldo). */
  lineColor: string;
};

const W = 600;
const H = 240;
const PAD = { top: 12, right: 10, bottom: 26, left: 46 };

function niceMax(max: number): number {
  if (max <= 0) return 100;
  const step = 20000;
  return Math.ceil(max / step) * step;
}

function compactBRL(value: number): string {
  if (value >= 1000) return `R$ ${value / 1000}k`;
  return `R$ ${value}`;
}

export function BarLineChart({ data, lineColor }: BarLineChartProps) {
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const max = niceMax(
    Math.max(...data.flatMap((d) => [...d.bars.map((b) => b.value), d.line])),
  );
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);

  const y = (v: number) => PAD.top + plotH * (1 - v / max);
  const slot = plotW / data.length;
  const center = (i: number) => PAD.left + slot * (i + 0.5);

  const barW = Math.min(14, slot * 0.18);

  const linePoints = data
    .map((d, i) => `${center(i).toFixed(1)},${y(d.line).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Gráfico de fluxo de caixa"
    >
      {/* Grade + rótulos do eixo Y. */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(t)}
            y2={y(t)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 8}
            y={y(t) + 3}
            textAnchor="end"
            className="fill-noturno-grey-light/60"
            fontSize={10}
          >
            {compactBRL(t)}
          </text>
        </g>
      ))}

      {/* Barras agrupadas. */}
      {data.map((d, i) => {
        const groupCenter = center(i);
        const totalBarsW = d.bars.length * barW + (d.bars.length - 1) * 3;
        let bx = groupCenter - totalBarsW / 2;
        return (
          <g key={i}>
            {d.bars.map((b, bi) => {
              const bh = (b.value / max) * plotH;
              const rect = (
                <rect
                  key={bi}
                  x={bx}
                  y={PAD.top + plotH - bh}
                  width={barW}
                  height={Math.max(2, bh)}
                  rx={3}
                  fill={b.color}
                  opacity={0.9}
                />
              );
              bx += barW + 3;
              return rect;
            })}
            <text
              x={groupCenter}
              y={H - 8}
              textAnchor="middle"
              className="fill-noturno-grey-light/70"
              fontSize={10}
            >
              {d.label}
            </text>
          </g>
        );
      })}

      {/* Linha do saldo. */}
      <polyline
        points={linePoints}
        fill="none"
        stroke={lineColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, i) => (
        <circle
          key={i}
          cx={center(i)}
          cy={y(d.line)}
          r={3.5}
          fill={lineColor}
          stroke="var(--color-noturno-black-secondary)"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}
