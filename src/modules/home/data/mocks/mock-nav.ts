// Scope: [M] module-home
//
// Estrutura inicial do menu lateral (ver home-layout.md). É configuração de
// PRODUTO (local, não vem da API) — o backend fornece apenas as permissões do
// usuário, e cada grupo/item declara a permissão que o torna visível.
//
// `href` é definido apenas para destinos que já existem. Itens de módulos ainda
// não implementados ficam sem `href` (placeholder) — a apresentação os exibe,
// mas sem navegação, evitando rotas 404. Todo item tem `icon` próprio.

import type { NavGroup } from "../../domain/models/nav";

export const MOCK_NAV: NavGroup[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "chart",
    permission: "dashboard.view",
    items: [
      {
        id: "dashboard-main",
        label: "Dashboard Principal",
        icon: "chart",
        href: "/dashboard",
      },
    ],
  },
  {
    id: "clients",
    label: "Clientes",
    icon: "users",
    permission: "clients.view",
    items: [
      {
        id: "clients-register",
        label: "Cadastro de Clientes",
        icon: "users",
        href: "/clientes",
      },
      { id: "clients-contracts", label: "Contratos", icon: "fileText" },
      { id: "clients-licenses", label: "Licenças", icon: "key" },
      { id: "clients-phones", label: "Telefones", icon: "phone" },
      { id: "clients-financial", label: "Situação Financeira", icon: "wallet" },
    ],
  },
  {
    id: "support",
    label: "Atendimento",
    icon: "headset",
    permission: "support.view",
    items: [
      { id: "support-tickets", label: "Chamados", icon: "headset" },
      { id: "support-history", label: "Histórico", icon: "clock" },
      { id: "support-schedules", label: "Agendamentos", icon: "calendar" },
    ],
  },
  {
    id: "financial",
    label: "Financeiro",
    icon: "wallet",
    permission: "financial.view",
    items: [
      {
        id: "financial-receivable",
        label: "Contas a Receber",
        icon: "arrowDownCircle",
      },
      {
        id: "financial-payable",
        label: "Contas a Pagar",
        icon: "arrowUpCircle",
      },
      { id: "financial-bankslips", label: "Boletos", icon: "receipt" },
      { id: "financial-pix", label: "PIX", icon: "zap" },
      { id: "financial-cashflow", label: "Fluxo de Caixa", icon: "chart" },
    ],
  },
  {
    id: "admin",
    label: "Administração",
    icon: "shield",
    permission: "users.manage",
    items: [
      { id: "admin-users", label: "Usuários", icon: "user" },
      { id: "admin-profiles", label: "Perfis", icon: "shield" },
      { id: "admin-permissions", label: "Permissões", icon: "key" },
      { id: "admin-settings", label: "Configurações", icon: "settings" },
    ],
  },
  {
    id: "help",
    label: "Ajuda",
    icon: "book",
    // Sempre visível (sem permissão) — Base de Conhecimento é universal.
    // Cada item aponta para a aba correspondente via hash (ver help-page).
    items: [
      {
        id: "help-knowledge",
        label: "Base de Conhecimento",
        icon: "book",
        href: "/ajuda",
      },
      {
        id: "help-tutorials",
        label: "Tutoriais",
        icon: "graduation",
        href: "/ajuda#tutoriais",
      },
      {
        id: "help-news",
        label: "Novidades",
        icon: "sparkles",
        href: "/ajuda#novidades",
      },
      {
        id: "help-support",
        label: "Suporte",
        icon: "lifebuoy",
        href: "/ajuda#suporte",
      },
    ],
  },
];
