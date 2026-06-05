// Scope: [M] module-home
//
// Seção de gráficos do dashboard (rodapé): Fluxo de Caixa (barras + linha) e
// Resumo financeiro do mês (donut + legenda). Apenas apresentação — recebe o
// model já pronto da store. Espelha docs/screens/home_screen.png.

import { BaseCard } from "@/shared/widgets/base-card";
import { BarLineChart } from "@/shared/widgets/bar-line-chart";
import { DonutChart } from "@/shared/widgets/donut-chart";
import { TONE_HEX } from "@/shared/design-system/tones";
import { formatCurrencyBRL } from "@/shared/helpers/format";
import { ChevronDownIcon } from "@/shared/design-system/icons";
import type { DashboardCharts } from "../../domain/models/dashboard-charts";

function PeriodChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-noturno-black/40 px-2.5 py-1 text-xs text-noturno-grey-light-clean">
      {label}
      <ChevronDownIcon size={13} className="text-noturno-grey-light" />
    </span>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-noturno-grey-light">
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

export function DashboardChartsSection({ charts }: { charts: DashboardCharts }) {
  const green = TONE_HEX.green;
  const red = TONE_HEX.red;
  const orange = TONE_HEX.orange;

  const series = charts.cashflow.map((p) => ({
    label: p.label,
    bars: [
      { value: p.inflow, color: green },
      { value: p.outflow, color: red },
    ],
    line: p.balance,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {/* Fluxo de caixa. */}
      <BaseCard className="flex flex-col gap-4 p-5 xl:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-white">Fluxo de Caixa</h3>
            <span className="text-xs text-noturno-grey-light">
              Entradas, saídas e saldo do período
            </span>
          </div>
          <PeriodChip label={charts.cashflowPeriodLabel} />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <LegendDot color={green} label="Entradas" />
          <LegendDot color={red} label="Saídas" />
          <LegendDot color={orange} label="Saldo" />
        </div>

        <BarLineChart data={series} lineColor={orange} />
      </BaseCard>

      {/* Resumo financeiro. */}
      <BaseCard className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">
            Resumo financeiro do mês
          </h3>
          <PeriodChip label={charts.financialPeriodLabel} />
        </div>

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <DonutChart
            slices={charts.financial.map((s) => ({
              percent: s.percent,
              color: TONE_HEX[s.tone],
            }))}
          >
            <span className="text-[11px] uppercase tracking-wider text-noturno-grey-light">
              Total
            </span>
            <span className="text-base font-semibold text-white">
              {formatCurrencyBRL(charts.financialTotal)}
            </span>
          </DonutChart>

          <ul className="flex flex-1 flex-col gap-2.5">
            {charts.financial.map((s) => (
              <li key={s.label} className="flex items-center gap-2 text-sm">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: TONE_HEX[s.tone] }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-noturno-grey-light-clean">
                  {s.label}
                </span>
                <span className="text-white">{formatCurrencyBRL(s.value)}</span>
                <span className="w-9 text-right text-xs text-noturno-grey-light">
                  {s.percent}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </BaseCard>
    </div>
  );
}
