// Scope: [M] module-home
//
// Model de widget do dashboard. Cada card é tratado como componente independente
// e possui sua própria permissão (ver home-layout.md). Estende a estrutura
// sugerida na especificação (id, title, permission, order) com os dados de
// exibição que o backend fornecerá futuramente (valor, dica, tom, ícone).

import type { IconKey } from "@/shared/design-system/icon-key";

/** Tom visual do widget (mapeado para a paleta Noturno na apresentação). */
export type WidgetTone = "orange" | "green" | "blue" | "red" | "neutral";

/**
 * Seção do dashboard (ordena o conteúdo): contadores compactos no topo, depois
 * contratos, depois financeiro. A grade renderiza as seções nesta ordem.
 */
export type DashboardSection = "counters" | "contracts" | "financial";

/**
 * Tamanho do card na grade (cria a hierarquia visual — os mais relevantes ficam
 * maiores): `sm` = contador compacto; `md` = card padrão; `lg` = destaque que
 * ocupa duas colunas.
 */
export type WidgetSize = "sm" | "md" | "lg";

/**
 * Variação/tendência exibida como "pílula" abaixo do valor (ex.: "+12,5% vs
 * ontem"). `direction` define a cor (alta = verde, baixa = vermelho) e o sentido
 * da seta — `positive` permite que uma queda seja "boa" (ex.: inadimplência).
 */
export type WidgetTrend = {
  label: string;
  direction: "up" | "down";
  /** Se `false`, o sentido é tratado como negativo mesmo subindo. Padrão: true. */
  positive?: boolean;
};

export type DashboardWidget = {
  id: string;
  title: string;
  /** Permissão exigida para exibir o widget. */
  permission: string;
  /** Ordem de exibição no grid. */
  order: number;
  /** Valor principal já formatado para exibição (ex.: "128", "R$ 42.300"). */
  value: string;
  /** Subtítulo curto sob o título (ex.: "Este mês", "Pendentes"). */
  subtitle?: string;
  /** Texto auxiliar adicional (ex.: "8 em atraso"). */
  hint?: string;
  /** Tendência/variação exibida como pílula colorida. */
  trend?: WidgetTrend;
  /** Série curta (7 pontos) para o mini-gráfico (sparkline). */
  spark?: number[];
  /** Card em destaque: acento de cor no topo + leve brilho de fundo. */
  featured?: boolean;
  /** Seção do dashboard (agrupa e ordena). Padrão: "counters". */
  section: DashboardSection;
  /** Tamanho/peso visual do card. Padrão: "md". */
  size: WidgetSize;
  /** Rota de detalhe ("Ver detalhes"). Ausente = sem ação de navegação. */
  detailHref?: string;
  /** Rótulo do link de detalhe (padrão: "Ver detalhes"). */
  detailLabel?: string;
  tone: WidgetTone;
  icon: IconKey;
};
