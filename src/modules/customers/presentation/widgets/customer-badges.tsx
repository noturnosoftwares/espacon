// Scope: [M] module-customers
//
// Pílulas de status do cliente (situação, assinatura) e do tipo de pessoa.
// Apenas apresentação — mapeiam enum → rótulo + tom (paleta Noturno).

import { TONE_SOFT } from "@/shared/design-system/tones";
import type { CustomerStatus } from "../../domain/enums/customer-status";
import type { ContractSignStatus } from "../../domain/enums/contract-sign-status";
import type { PersonType } from "../../domain/enums/person-type";
import type { FinancialStatus } from "../../domain/models/customer";
import {
  FINANCIAL_LABEL,
  FINANCIAL_TONE,
  PERSON_TYPE_SHORT,
  SIGN_LABEL,
  SIGN_TONE,
  STATUS_LABEL,
  STATUS_TONE,
} from "../customer-labels";

const PILL =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium";

export function StatusBadge({ status }: { status: CustomerStatus }) {
  const tone = STATUS_TONE[status];
  return (
    <span className={PILL + " " + TONE_SOFT[tone]}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function FinancialBadge({ status }: { status: FinancialStatus }) {
  return (
    <span className={PILL + " " + TONE_SOFT[FINANCIAL_TONE[status]]}>
      {FINANCIAL_LABEL[status]}
    </span>
  );
}

export function SignBadge({ status }: { status: ContractSignStatus }) {
  return (
    <span className={PILL + " " + TONE_SOFT[SIGN_TONE[status]]}>
      {SIGN_LABEL[status]}
    </span>
  );
}

export function TypeBadge({ type }: { type: PersonType }) {
  return (
    <span className="inline-flex items-center rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-noturno-grey-light-clean">
      {PERSON_TYPE_SHORT[type]}
    </span>
  );
}
