// Rota "/dashboard" — placeholder temporário.
// Destino do login mockado. O dashboard real será implementado posteriormente.

"use client";

import { BaseCard } from "@/shared/widgets/base-card";
import { BrandMark } from "@/shared/widgets/brand-mark";
import { ChartIcon } from "@/shared/design-system/icons";
import { SignOutButton } from "@/modules/auth/presentation/widgets/sign-out-button";

export default function DashboardPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <BaseCard className="flex w-full max-w-lg flex-col items-center gap-6 p-10 text-center animate-fade-in">
        <BrandMark product="HelpDesk" size="md" />

        <span className="flex size-14 items-center justify-center rounded-2xl bg-noturno-orange/10 text-noturno-orange">
          <ChartIcon size={26} />
        </span>

        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Dashboard em desenvolvimento
          </h1>
          <p className="text-sm leading-relaxed text-noturno-grey-light">
            Login realizado com sucesso. O painel de indicadores e os módulos de
            gestão serão implementados em breve.
          </p>
        </div>

        <SignOutButton className="text-sm font-medium text-noturno-orange transition-opacity hover:opacity-80" />
      </BaseCard>
    </main>
  );
}
