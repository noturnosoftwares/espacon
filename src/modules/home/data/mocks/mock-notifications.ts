// Scope: [M] module-home
//
// Notificações mockadas da central (ver home-layout.md). Rótulos de data são
// relativos e fixos enquanto não há API real.

import type { AppNotification } from "../../domain/models/notification";

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "ntf-1",
    type: "ticket-new",
    title: "Novo chamado",
    description: "Cliente Aurora Ltda abriu o chamado #4821.",
    createdAtLabel: "há 5 min",
    read: false,
  },
  {
    id: "ntf-2",
    type: "ticket-overdue",
    title: "Chamado em atraso",
    description: "O chamado #4790 ultrapassou o prazo de atendimento.",
    createdAtLabel: "há 40 min",
    read: false,
  },
  {
    id: "ntf-3",
    type: "invoice-overdue",
    title: "Boleto vencido",
    description: "Boleto da Nimbus Systems venceu há 3 dias.",
    createdAtLabel: "há 2 h",
    read: false,
  },
  {
    id: "ntf-4",
    type: "contract-expiring",
    title: "Contrato vencendo",
    description: "Contrato da Vega Tech vence em 7 dias.",
    createdAtLabel: "ontem",
    read: true,
  },
  {
    id: "ntf-5",
    type: "license-expiring",
    title: "Licença vencendo",
    description: "12 licenças expiram nos próximos 15 dias.",
    createdAtLabel: "há 2 dias",
    read: true,
  },
];
