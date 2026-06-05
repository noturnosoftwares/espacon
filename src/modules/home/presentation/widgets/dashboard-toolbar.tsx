// Scope: [M] module-home
//
// Barra de ações do dashboard: seletor de data (com calendário para escolher
// outras datas) e botão de filtros (período). Estado é UI local — com mock os
// indicadores não variam por data/período; com API real, a seleção dispararia o
// recarregamento (lift state + refetch). Popovers fecham ao clicar fora/Esc.

"use client";

import { useRef, useState } from "react";
import { BaseCard } from "@/shared/widgets/base-card";
import { useClickOutside } from "@/shared/hooks/use-click-outside";
import {
  formatDateLong,
  isSameDay,
  toISODate,
} from "@/shared/helpers/format";
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  FilterIcon,
} from "@/shared/design-system/icons";

type Period = "today" | "7d" | "30d" | "90d";

const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Hoje" },
  { id: "7d", label: "Últimos 7 dias" },
  { id: "30d", label: "Últimos 30 dias" },
  { id: "90d", label: "Últimos 90 dias" },
];

export function DashboardToolbar() {
  const today = new Date();
  const [date, setDate] = useState<Date>(today);
  const [period, setPeriod] = useState<Period>("today");

  const [dateOpen, setDateOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const dateRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  useClickOutside(dateRef, () => setDateOpen(false), dateOpen);
  useClickOutside(filterRef, () => setFilterOpen(false), filterOpen);

  const label = isSameDay(date, today)
    ? `Hoje: ${formatDateLong(date)}`
    : formatDateLong(date);

  const periodLabel = PERIODS.find((p) => p.id === period)?.label ?? "Filtros";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Seletor de data. */}
      <div ref={dateRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setDateOpen((v) => !v);
            setFilterOpen(false);
          }}
          aria-expanded={dateOpen}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-noturno-black-secondary px-3.5 text-sm text-noturno-grey-light-clean transition-colors hover:border-white/20 hover:text-white"
        >
          <CalendarIcon size={16} className="text-noturno-orange" />
          <span className="whitespace-nowrap">{label}</span>
          <ChevronDownIcon
            size={14}
            className={
              "text-noturno-grey-light transition-transform " +
              (dateOpen ? "rotate-180" : "")
            }
          />
        </button>

        {dateOpen && (
          <BaseCard className="absolute right-0 z-30 mt-2 flex w-64 flex-col gap-3 p-4">
            <span className="text-xs font-medium uppercase tracking-wider text-noturno-grey-light">
              Selecionar data
            </span>
            <input
              type="date"
              value={toISODate(date)}
              onChange={(e) => {
                const [y, m, d] = e.target.value.split("-").map(Number);
                if (y && m && d) setDate(new Date(y, m - 1, d));
              }}
              className="h-10 w-full rounded-lg border border-white/10 bg-noturno-black/40 px-3 text-sm text-white outline-none focus:border-noturno-orange/60 [color-scheme:dark]"
            />
            <button
              type="button"
              onClick={() => {
                setDate(new Date());
                setDateOpen(false);
              }}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-white/5 text-sm text-noturno-grey-light-clean transition-colors hover:bg-white/10 hover:text-white"
            >
              Voltar para hoje
            </button>
          </BaseCard>
        )}
      </div>

      {/* Filtros (período). */}
      <div ref={filterRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setFilterOpen((v) => !v);
            setDateOpen(false);
          }}
          aria-expanded={filterOpen}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-noturno-black-secondary px-3.5 text-sm text-noturno-grey-light-clean transition-colors hover:border-white/20 hover:text-white"
        >
          <FilterIcon size={16} className="text-noturno-orange" />
          <span className="whitespace-nowrap">Filtros</span>
          <span className="hidden text-noturno-grey-light sm:inline">·</span>
          <span className="hidden text-noturno-grey-light sm:inline">
            {periodLabel}
          </span>
        </button>

        {filterOpen && (
          <BaseCard className="absolute right-0 z-30 mt-2 flex w-56 flex-col gap-1 p-2">
            <span className="px-2 py-1 text-xs font-medium uppercase tracking-wider text-noturno-grey-light">
              Período
            </span>
            {PERIODS.map((p) => {
              const active = p.id === period;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPeriod(p.id);
                    setFilterOpen(false);
                  }}
                  className={
                    "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors " +
                    (active
                      ? "bg-noturno-orange/10 text-noturno-orange"
                      : "text-noturno-grey-light-clean hover:bg-white/5 hover:text-white")
                  }
                >
                  {p.label}
                  {active && <CheckCircleIcon size={16} />}
                </button>
              );
            })}
          </BaseCard>
        )}
      </div>
    </div>
  );
}
