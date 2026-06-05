// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/helpers)
//
// Helpers de formatação para exibição (pt-BR). Sem dono de tipo específico —
// usados pela presentation de qualquer módulo. Centralizam moeda e datas para
// não repetir Intl em cada tela.

/** Formata um número como moeda brasileira (ex.: 1234.5 → "R$ 1.234,50"). */
export function formatCurrencyBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Formata uma data ISO (YYYY-MM-DD) como "dd/mm/aaaa". */
export function formatDateBR(iso: string): string {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

/** Formata uma Date por extenso em pt-BR (ex.: "5 de junho de 2026"). */
export function formatDateLong(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Converte uma Date para ISO local "YYYY-MM-DD" (sem fuso UTC). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** true se as duas datas caem no mesmo dia (local). */
export function isSameDay(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}
