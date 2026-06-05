// Scope: [M] module-home
//
// Model de notificação da central de notificações (ver home-layout.md). O tipo
// classifica a origem (novo chamado, boleto vencido, etc.) e define o tom/ícone
// na apresentação. `createdAtLabel` é um rótulo relativo já pronto para exibição
// (ex.: "há 5 min") — a formatação real de data virá com o contrato da API.

export type NotificationType =
  | "ticket-new"
  | "ticket-overdue"
  | "invoice-overdue"
  | "contract-expiring"
  | "license-expiring"
  | "admin-notice";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAtLabel: string;
  read: boolean;
};
