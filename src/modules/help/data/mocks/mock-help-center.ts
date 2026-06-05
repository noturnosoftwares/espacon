// Scope: [M] module-help
//
// Conteúdo mockado da Central de Ajuda (mock-first). Ilustrativo enquanto não
// existe API real de conhecimento. Quando a API entrar, criar ApiHelpProvider +
// mapper e trocar o provider no factory — sem impacto nas camadas acima.

import type { HelpCenter } from "../../domain/models/help-content";

export const MOCK_HELP_CENTER: HelpCenter = {
  categories: [
    {
      id: "getting-started",
      title: "Primeiros passos",
      description: "Configure sua conta e conheça a estrutura do HelpDesk.",
      icon: "rocket",
      tone: "orange",
      articleCount: 8,
    },
    {
      id: "clients",
      title: "Clientes e contratos",
      description: "Cadastro de clientes, contratos, licenças e situação financeira.",
      icon: "users",
      tone: "blue",
      articleCount: 14,
    },
    {
      id: "support",
      title: "Atendimento e chamados",
      description: "Abertura, triagem, SLA e histórico de chamados.",
      icon: "headset",
      tone: "orange",
      articleCount: 11,
    },
    {
      id: "financial",
      title: "Financeiro",
      description: "Contas a receber e pagar, boletos, PIX e fluxo de caixa.",
      icon: "wallet",
      tone: "green",
      articleCount: 17,
    },
    {
      id: "admin",
      title: "Administração",
      description: "Usuários, perfis, permissões e configurações da operação.",
      icon: "shield",
      tone: "blue",
      articleCount: 9,
    },
    {
      id: "multicompany",
      title: "Matriz e franquias",
      description: "Escopos de acesso, franquias, representantes e técnicos.",
      icon: "building",
      tone: "neutral",
      articleCount: 6,
    },
  ],
  popularArticles: [
    {
      id: "a-permissions",
      categoryId: "admin",
      title: "Como funcionam as permissões e os perfis de acesso",
      excerpt:
        "Entenda o modelo de permissões granulares, coringas e como o escopo (matriz/franquia) filtra os dados.",
      readingTimeLabel: "5 min de leitura",
      updatedAtLabel: "Atualizado em 28 mai 2026",
      tags: ["permissões", "perfis", "acesso"],
    },
    {
      id: "a-new-ticket",
      categoryId: "support",
      title: "Abrindo e acompanhando um chamado",
      excerpt:
        "Passo a passo para registrar um chamado, definir prioridade e acompanhar o SLA até a resolução.",
      readingTimeLabel: "4 min de leitura",
      updatedAtLabel: "Atualizado em 22 mai 2026",
      tags: ["chamados", "atendimento"],
    },
    {
      id: "a-contract",
      categoryId: "clients",
      title: "Cadastrando um cliente e vinculando contratos",
      excerpt:
        "Como cadastrar um cliente, anexar contratos, licenças e acompanhar a situação financeira.",
      readingTimeLabel: "6 min de leitura",
      updatedAtLabel: "Atualizado em 19 mai 2026",
      tags: ["clientes", "contratos", "licenças"],
    },
    {
      id: "a-billing",
      categoryId: "financial",
      title: "Gerando boletos e conciliando recebíveis",
      excerpt:
        "Fluxo completo de emissão de boletos, baixa automática e conciliação no contas a receber.",
      readingTimeLabel: "7 min de leitura",
      updatedAtLabel: "Atualizado em 14 mai 2026",
      tags: ["financeiro", "boletos", "recebíveis"],
    },
    {
      id: "a-franchise",
      categoryId: "multicompany",
      title: "Configurando franquias e escopos de acesso",
      excerpt:
        "Como o accessScope separa os dados entre matriz, franquias, representantes e técnicos.",
      readingTimeLabel: "5 min de leitura",
      updatedAtLabel: "Atualizado em 10 mai 2026",
      tags: ["franquias", "multiempresa", "escopo"],
    },
    {
      id: "a-onboarding",
      categoryId: "getting-started",
      title: "Visão geral do painel e da navegação",
      excerpt:
        "Conheça a navbar, o menu lateral e como os indicadores do dashboard mudam conforme o seu perfil.",
      readingTimeLabel: "3 min de leitura",
      updatedAtLabel: "Atualizado em 30 mai 2026",
      tags: ["dashboard", "navegação"],
    },
  ],
  tutorials: [
    {
      id: "t-tour",
      title: "Tour guiado pelo HelpDesk",
      description: "Um passeio de 5 minutos pelas áreas principais do sistema.",
      durationLabel: "5 min",
      level: "Iniciante",
      icon: "playCircle",
      tone: "orange",
    },
    {
      id: "t-first-client",
      title: "Cadastrando seu primeiro cliente",
      description: "Do cadastro ao primeiro contrato, passo a passo.",
      durationLabel: "8 min",
      level: "Iniciante",
      icon: "users",
      tone: "blue",
    },
    {
      id: "t-tickets",
      title: "Gerenciando a fila de chamados",
      description: "Triagem, prioridades, SLA e encerramento de chamados.",
      durationLabel: "10 min",
      level: "Intermediário",
      icon: "headset",
      tone: "orange",
    },
    {
      id: "t-financial",
      title: "Fechamento financeiro do mês",
      description: "Conciliação de recebíveis, pagáveis e fluxo de caixa.",
      durationLabel: "12 min",
      level: "Avançado",
      icon: "wallet",
      tone: "green",
    },
    {
      id: "t-permissions",
      title: "Modelando perfis e permissões",
      description: "Crie perfis por área e controle granular de acesso.",
      durationLabel: "9 min",
      level: "Intermediário",
      icon: "shield",
      tone: "blue",
    },
    {
      id: "t-franchise",
      title: "Operando matriz e franquias",
      description: "Configuração de escopos e visão consolidada da rede.",
      durationLabel: "11 min",
      level: "Avançado",
      icon: "building",
      tone: "neutral",
    },
  ],
  news: [
    {
      id: "n-dashboard",
      title: "Novo dashboard com indicadores e tendências",
      description:
        "Cards do dashboard agora trazem variação, mini-gráficos e destaque por área de negócio.",
      dateLabel: "05 jun 2026",
      kind: "Novo",
    },
    {
      id: "n-help",
      title: "Central de Ajuda disponível",
      description:
        "Base de conhecimento, tutoriais, novidades e suporte reunidos em um só lugar.",
      dateLabel: "05 jun 2026",
      kind: "Novo",
    },
    {
      id: "n-notifications",
      title: "Central de notificações aprimorada",
      description: "Agrupamento por tipo e marcação em massa como lidas.",
      dateLabel: "28 mai 2026",
      kind: "Melhoria",
    },
    {
      id: "n-perf",
      title: "Carregamento mais rápido do menu lateral",
      description: "Otimização na montagem da navegação filtrada por permissão.",
      dateLabel: "21 mai 2026",
      kind: "Melhoria",
    },
    {
      id: "n-fix-login",
      title: "Correção no redirecionamento pós-login",
      description: "Ajuste no guard de sessão que, em casos raros, voltava ao login.",
      dateLabel: "16 mai 2026",
      kind: "Correção",
    },
  ],
  faqs: [
    {
      id: "f-access",
      question: "Não vejo um módulo no menu. O que fazer?",
      answer:
        "O menu é filtrado por permissão. Se um módulo não aparece, seu perfil ainda não tem a permissão correspondente. Solicite ao administrador da sua franquia ou da matriz.",
    },
    {
      id: "f-password",
      question: "Como altero minha senha?",
      answer:
        "Abra o menu de perfil no canto superior direito e escolha “Alterar Senha”. Em caso de esquecimento, use “Recuperar senha” na tela de login.",
    },
    {
      id: "f-scope",
      question: "Por que vejo dados diferentes de outro usuário?",
      answer:
        "O HelpDesk é multiempresa: o accessScope (matriz, franquia, representante, técnico ou cliente) determina quais dados cada usuário enxerga.",
    },
    {
      id: "f-ticket-sla",
      question: "Como o SLA de um chamado é calculado?",
      answer:
        "O SLA considera a prioridade do chamado e o horário comercial configurado. Chamados em atraso são destacados no dashboard e na fila de atendimento.",
    },
    {
      id: "f-support",
      question: "Preciso de ajuda que não está aqui. Como falo com o suporte?",
      answer:
        "Use o botão “Abrir chamado de suporte” nesta página ou os canais de contato (chat, e-mail e telefone) listados na aba Suporte.",
    },
  ],
};
