// Scope: [M] module-customers
//
// Aba "Integrações" do detalhe: servidores/ambientes do cliente (hostname, porta,
// banco, versão instalada, atualização) e credenciais de API (segredos sempre
// mascarados). Mock-first (gerador determinístico). Integrações só existem quando
// o contrato está assinado (chaves liberadas).

import {
  BuildingIcon,
  CheckCircleIcon,
  KeyIcon,
  ZapIcon,
} from "@/shared/design-system/icons";
import { CustomerRules } from "../../domain/models/customer-rules";
import type { Customer } from "../../domain/models/customer";
import { ENVIRONMENT_LABEL, ENVIRONMENT_TONE } from "../customer-labels";
import { EmptyHint, Field, Section, TonePill } from "./customer-detail-ui";

export function CustomerIntegrationsTab({ customer }: { customer: Customer }) {
  const integrations = customer.integrations ?? [];
  const apis = customer.apiCredentials ?? [];
  const released = CustomerRules.canReleaseKeys(customer.contract.signStatus);

  if (!released) {
    return (
      <Section title="Integrações" icon={ZapIcon}>
        <EmptyHint icon={KeyIcon}>
          As integrações e credenciais só são liberadas após a assinatura do
          contrato (D4Sign). Status atual: contrato não assinado.
        </EmptyHint>
      </Section>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Section title="Servidores" icon={BuildingIcon} className="lg:col-span-2">
        {integrations.length === 0 ? (
          <EmptyHint icon={BuildingIcon}>
            Nenhum servidor/integração configurado.
          </EmptyHint>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {integrations.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.02] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white">{s.name}</span>
                  <TonePill tone={ENVIRONMENT_TONE[s.environment]}>
                    {ENVIRONMENT_LABEL[s.environment]}
                  </TonePill>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Hostname" value={s.hostname} />
                  <Field label="Porta" value={String(s.port)} />
                  <Field label="Banco de dados" value={s.database} />
                  <Field label="Versão instalada" value={s.installedVersion} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <TonePill tone={s.autoUpdate ? "green" : "neutral"}>
                    <CheckCircleIcon size={12} />
                    {s.autoUpdate ? "Atualização automática" : "Atualização manual"}
                  </TonePill>
                  {s.updateOnNextCheck && (
                    <TonePill tone="orange">Atualizar na próxima checagem</TonePill>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="APIs" icon={KeyIcon} className="lg:col-span-2">
        {apis.length === 0 ? (
          <EmptyHint icon={KeyIcon}>Nenhuma credencial de API cadastrada.</EmptyHint>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {apis.map((api) => (
              <li
                key={api.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/[0.03] p-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-white">{api.name}</span>
                  <span className="font-mono text-xs text-noturno-grey-light">
                    ClientId: {api.clientId}
                  </span>
                </div>
                <span className="font-mono text-xs text-noturno-grey-light/70">
                  Secret: {api.secretMasked}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
