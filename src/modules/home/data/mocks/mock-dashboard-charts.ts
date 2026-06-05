// Scope: [M] module-home
//
// Mock dos gráficos do dashboard (mock-first). Valores ilustrativos do Fluxo de
// Caixa (7 dias) e do Resumo financeiro do mês, espelhando o desenho de
// docs/screens/home_screen.png.

import type { DashboardCharts } from "../../domain/models/dashboard-charts";

export const MOCK_DASHBOARD_CHARTS: DashboardCharts = {
  cashflowPeriodLabel: "7 dias",
  cashflow: [
    { label: "17 mai", inflow: 18200, outflow: 9800, balance: 8400 },
    { label: "18 mai", inflow: 24500, outflow: 12100, balance: 12400 },
    { label: "19 mai", inflow: 21000, outflow: 15600, balance: 5400 },
    { label: "20 mai", inflow: 42000, outflow: 18900, balance: 23100 },
    { label: "21 mai", inflow: 33500, outflow: 21300, balance: 12200 },
    { label: "22 mai", inflow: 28900, outflow: 16400, balance: 12500 },
    { label: "23 mai", inflow: 28450, outflow: 19230, balance: 9220 },
  ],
  financialPeriodLabel: "Maio/2025",
  financialTotal: 589780.5,
  financial: [
    { label: "Recebido", value: 248680.0, percent: 45, tone: "green" },
    { label: "A Receber", value: 142680.5, percent: 26, tone: "blue" },
    { label: "Pago", value: 198420.0, percent: 18, tone: "orange" },
    { label: "A Pagar", value: 87420.3, percent: 11, tone: "red" },
  ],
};
