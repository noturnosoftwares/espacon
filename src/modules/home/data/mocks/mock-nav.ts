import type { NavGroup, NavItem } from '../../domain/models'

/**
 * mock-nav — configuração de navegação da Home (mock-first / config de frontend).
 *
 * Reflete a estrutura de negócio de `docs/specifications/home/README.md`, na
 * ordem definida pelo produto: Início, Sistema, Atendimento, Financeiro, Compra,
 * Frota, Pessoal, Imobiliário, Ajuda. Os módulos ainda não implementados ficam
 * com `status: 'soon'` (inertes, "em breve") — atende à regra de navegação (sem
 * 404) e ao ADR-006 (permissão aplicada por cima quando os módulos existirem).
 *
 * "Sair" (logout) **não** é um item de navegação: vive no menu de perfil do
 * Header (ver `docs/app/authentication.md`).
 *
 * Para liberar um módulo: defina `route` no grupo/itens e mude `status` para
 * `'available'` quando a tela existir.
 */

/** Atalho para declarar itens "em breve" (sem rota), cada um com seu ícone. */
function soon(id: string, label: string, icon: string): NavItem {
  return { id, label, icon, status: 'soon' }
}

/** Tile de Início — único destino navegável nesta fase (a própria Home). */
export const homeNavTile: NavGroup = {
  id: 'home',
  label: 'Início',
  icon: 'home',
  route: '/dashboard',
  status: 'available',
  items: [],
}

/** Grupos de negócio (na ordem do produto). */
export const navGroups: NavGroup[] = [
  {
    id: 'sistema',
    label: 'Sistema',
    icon: 'cog',
    status: 'available',
    items: [
      soon('agenda-telefonica', 'Agenda Telefônica', 'phone'),
      { id: 'perfil-usuario', label: 'Perfil de Usuário', icon: 'id-card', route: '/perfis', status: 'available' },
      { id: 'usuario', label: 'Usuário', icon: 'user', route: '/usuarios', status: 'available' },
      soon('baixar-arquivo', 'Baixar Arquivo', 'download'),
      soon('enviar-contrato', 'Enviar Contrato', 'upload'),
      soon('itoken', 'iToken', 'key'),
      soon('noturnomaps', 'NoturnoMAPS', 'map'),
      soon('relatorios', 'Relatórios', 'chart-bar'),
      soon('validar-versoes', 'Validar Versões', 'verified'),
    ],
  },
  {
    id: 'atendimento',
    label: 'Atendimento',
    icon: 'comments',
    status: 'soon',
    items: [
      soon('atendimento', 'Atendimento', 'headphones'),
      soon('suporte-remoto', 'Suporte Remoto', 'desktop'),
      soon('agendar-cancelamento', 'Agendar Cancelamento', 'calendar-times'),
      soon('cadastro-cliente', 'Cadastro de Cliente', 'user-plus'),
      soon('chamado-rede', 'Chamado REDE', 'ticket'),
      soon('membro-rede', 'Membro.REDE', 'users'),
      soon('comunicado', 'Comunicado', 'megaphone'),
      soon('enquete', 'Enquete', 'chart-pie'),
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: 'wallet',
    status: 'soon',
    items: [
      { id: 'operador-caixa', label: 'Operador de Caixa', icon: 'wallet', route: '/operadores-de-caixa', status: 'available' },
      soon('caixa', 'Caixa', 'money-bill'),
      soon('contas-a-pagar', 'Contas a Pagar', 'arrow-circle-up'),
      soon('contas-a-receber', 'Contas a Receber', 'arrow-circle-down'),
      soon('controle-de-cheque', 'Controle de Cheque', 'file-check'),
      soon('recibo', 'Recibo', 'receipt'),
      soon('credito-de-cliente', 'Crédito de Cliente', 'credit-card'),
      soon('comissao-representante', 'Comissão de Representante', 'percentage'),
      soon('carregar-contas-a-receber', 'Carregar Contas a Receber', 'cloud-upload'),
      soon('exportar-contatos', 'Exportar Contatos', 'file-export'),
      soon('faturar-nfse', 'Faturar NFS-e', 'file-edit'),
    ],
  },
  {
    id: 'compra',
    label: 'Compra',
    icon: 'shopping-cart',
    status: 'soon',
    items: [soon('fornecedor', 'Fornecedor', 'box')],
  },
  {
    id: 'frota',
    label: 'Frota',
    icon: 'truck',
    status: 'soon',
    items: [soon('veiculo', 'Veículo', 'car')],
  },
  {
    id: 'pessoal',
    label: 'Pessoal',
    icon: 'users',
    status: 'soon',
    items: [
      soon('funcionario', 'Funcionário', 'user'),
      soon('conta-corrente-vales', 'Conta Corrente (Vales)', 'wallet'),
    ],
  },
  {
    id: 'imobiliario',
    label: 'Imobiliário',
    icon: 'building',
    status: 'soon',
    items: [],
  },
  {
    id: 'ajuda',
    label: 'Ajuda',
    icon: 'question-circle',
    status: 'soon',
    items: [],
  },
]

/** Lista completa exibida na sidebar: Início + grupos de negócio. */
export const primaryNav: NavGroup[] = [homeNavTile, ...navGroups]
