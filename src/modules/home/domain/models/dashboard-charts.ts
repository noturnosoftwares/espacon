// Scope: [M] module-home
//
// Models dos gráficos do dashboard (rodapé): Fluxo de Caixa (entradas/saídas/
// saldo por dia) e Resumo financeiro do mês (composição em donut). Dados
// financeiros — exibidos apenas com a permissão correspondente (regra no
// UseCase). Virão da API real futuramente.

import type { Tone } from "@/shared/design-system/tones";

/** Ponto diário do fluxo de caixa. */
export type CashflowPoint = {
  /** Rótulo do eixo X (ex.: "17 mai"). */
  label: string;
  /** Entradas (R$). */
  inflow: number;
  /** Saídas (R$). */
  outflow: number;
  /** Saldo acumulado/diário (R$) — desenhado como linha. */
  balance: number;
};

/** Fatia da composição financeira do mês (donut + legenda). */
export type FinancialSlice = {
  label: string;
  value: number;
  /** Participação (0–100) já calculada. */
  percent: number;
  tone: Tone;
};

export type DashboardCharts = {
  cashflowPeriodLabel: string;
  cashflow: CashflowPoint[];
  financialPeriodLabel: string;
  financialTotal: number;
  financial: FinancialSlice[];
};
