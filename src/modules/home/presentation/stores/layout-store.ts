// Scope: [M] module-home
//
// Store de estado de LAYOUT do shell (UI, não negócio): controla o menu lateral
// expandido/recolhido (desktop) e o drawer aberto/fechado (mobile). Vive como
// instância por tela porque navbar e menu lateral são componentes irmãos que
// compartilham esse estado — evita prop drilling e re-render da árvore inteira.
//
// Estende BaseStore apenas pelo padrão observável (snapshot + subscribe); os
// campos de loading/erro do BaseState não são usados aqui.

import { BaseStore, type BaseState } from "@/shared/stores/base-store";

/** Limites da largura ajustável do menu (desktop, expandido). */
export const MENU_MIN_WIDTH = 220;
export const MENU_MAX_WIDTH = 360;
const MENU_DEFAULT_WIDTH = 264;

type LayoutState = BaseState & {
  /** Desktop: menu expandido (com rótulos) vs recolhido (apenas ícones). */
  expanded: boolean;
  /** Mobile: drawer do menu aberto sobre o conteúdo. */
  drawerOpen: boolean;
  /** Largura do menu expandido (px), ajustável por arrasto no desktop. */
  menuWidth: number;
};

export class LayoutStore extends BaseStore<LayoutState> {
  constructor(expanded = true) {
    super({
      ...BaseStore.baseState(),
      expanded,
      drawerOpen: false,
      menuWidth: MENU_DEFAULT_WIDTH,
    });
  }

  /** Define a largura do menu, limitada a [MIN, MAX]. */
  setMenuWidth(width: number): void {
    const clamped = Math.min(MENU_MAX_WIDTH, Math.max(MENU_MIN_WIDTH, width));
    this.setState({ menuWidth: clamped });
  }

  /**
   * Alterna o menu. Um único botão atende aos dois layouts: em desktop só o
   * `expanded` tem efeito visual; em mobile só o `drawerOpen`. Alternar ambos
   * mantém cada breakpoint coerente sem o store precisar conhecer o viewport.
   */
  toggle(): void {
    const { expanded, drawerOpen } = this.getSnapshot();
    this.setState({ expanded: !expanded, drawerOpen: !drawerOpen });
  }

  /** Fecha o drawer mobile (ex.: ao navegar ou clicar no backdrop). */
  closeDrawer(): void {
    this.setState({ drawerOpen: false });
  }
}
