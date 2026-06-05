// Scope: [M] module-home
//
// Modelos de navegação do menu lateral. A estrutura do menu é configuração de
// produto (local), e cada item/grupo pode exigir uma permissão para ser exibido
// (controle por permissão — ver home-layout.md). O ícone é referenciado por uma
// chave estável (`IconKey`), mantendo o domain livre de componentes de UI.

import type { IconKey } from "@/shared/design-system/icon-key";

/** Item de menu (folha). `href` ausente = ainda não implementado (placeholder). */
export type NavItem = {
  id: string;
  label: string;
  /** Ícone do item (chave estável). Todos os itens têm ícone próprio. */
  icon: IconKey;
  /** Permissão exigida para exibir o item (ausente = sempre visível). */
  permission?: string;
  /** Rota de destino (ausente enquanto o módulo não existir). */
  href?: string;
};

/** Grupo de menu com itens. A visibilidade do grupo respeita sua permissão. */
export type NavGroup = {
  id: string;
  label: string;
  icon: IconKey;
  /** Permissão exigida para exibir o grupo (ausente = sempre visível). */
  permission?: string;
  items: NavItem[];
};
