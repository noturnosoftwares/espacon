// Scope: [M] module-help
//
// Item de FAQ em acordeão. Estado de aberto/fechado é UI local (useState).
// Acessível: usa <button> com aria-expanded controlando a região de resposta.

"use client";

import { useState } from "react";
import { BaseCard } from "@/shared/widgets/base-card";
import { ChevronDownIcon } from "@/shared/design-system/icons";
import type { HelpFaq } from "../../domain/models/help-content";

export function HelpFaqItem({ faq }: { faq: HelpFaq }) {
  const [open, setOpen] = useState(false);

  return (
    <BaseCard className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04]"
      >
        <span className="text-sm font-medium text-white">{faq.question}</span>
        <span
          aria-hidden="true"
          className={
            "shrink-0 text-noturno-grey-light transition-transform duration-300 " +
            (open ? "rotate-180" : "")
          }
        >
          <ChevronDownIcon size={18} />
        </span>
      </button>

      <div
        className={
          "grid transition-all duration-300 ease-out " +
          (open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
        }
      >
        <div className="overflow-hidden">
          <p className="px-4 pb-4 text-sm leading-relaxed text-noturno-grey-light">
            {faq.answer}
          </p>
        </div>
      </div>
    </BaseCard>
  );
}
