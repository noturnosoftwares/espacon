// Scope: [M] module-home
//
// Grade do dashboard central. Renderiza as seções na ordem (contadores →
// contratos → financeiro), cada uma com sua grade responsiva que ocupa toda a
// largura disponível. O tamanho do widget cria a hierarquia visual: `sm` =
// contador compacto; `lg` = destaque que ocupa duas colunas. Exibe os widgets já
// filtrados por permissão pela store; trata loading e estado vazio.

import { BaseCard } from "@/shared/widgets/base-card";
import { ChartIcon } from "@/shared/design-system/icons";
import type {
  DashboardSection,
  DashboardWidget,
} from "../../domain/models/dashboard-widget";
import { DashboardWidgetCard } from "./dashboard-widget-card";

type DashboardGridProps = {
  widgets: DashboardWidget[];
  loading: boolean;
};

const SECTIONS: {
  id: DashboardSection;
  title: string | null;
  grid: string;
}[] = [
  { id: "counters", title: null, grid: "grid-cols-2 lg:grid-cols-4" },
  {
    id: "contracts",
    title: "Contratos",
    grid: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  },
  {
    id: "financial",
    title: "Financeiro",
    grid: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
  },
];

/** Cards `lg` ocupam duas colunas (destaque). */
function spanClass(widget: DashboardWidget): string {
  return widget.size === "lg" ? "sm:col-span-2" : "";
}

export function DashboardGrid({ widgets, loading }: DashboardGridProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <BaseCard
              key={i}
              className="h-[104px] animate-pulse bg-white/[0.04]"
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <BaseCard
              key={i}
              className="h-[196px] animate-pulse bg-white/[0.04]"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <BaseCard className="flex flex-col items-center gap-3 p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-white/5 text-noturno-grey-light">
          <ChartIcon size={24} />
        </span>
        <p className="text-sm text-noturno-grey-light">
          Nenhum indicador disponível para o seu perfil.
        </p>
      </BaseCard>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {SECTIONS.map((section) => {
        const items = widgets.filter((w) => w.section === section.id);
        if (items.length === 0) return null;

        return (
          <section key={section.id} className="flex flex-col gap-4">
            {section.title && (
              <h2 className="text-sm font-semibold uppercase tracking-wider text-noturno-grey-light">
                {section.title}
              </h2>
            )}
            <div className={"grid gap-4 " + section.grid}>
              {items.map((widget) => (
                <DashboardWidgetCard
                  key={widget.id}
                  widget={widget}
                  className={spanClass(widget)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
