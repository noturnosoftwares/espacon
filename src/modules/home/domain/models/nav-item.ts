/**
 * Navegação da Home (EspaçoN).
 *
 * Estrutura de menus do sistema (ver `docs/specifications/home/README.md` e
 * `docs/app/navigation.md`). É **configuração de frontend** (não vem de API):
 * fica em `data/mocks/mock-nav.ts` e cresce sem refatoração estrutural.
 *
 * Models em inglês (padrão corporativo). `status` permite exibir itens de módulos
 * ainda não implementados como **inertes** ("em breve"), sem navegação — evita
 * 404 e atende à regra de navegação. A exibição por permissão segue o ADR-006.
 */
export type NavStatus = 'available' | 'soon'

/** Item de menu (folha) — uma tela/ação dentro de um grupo. */
export interface NavItem {
  id: string
  label: string
  /** Chave de ícone (PrimeIcons sem o prefixo, ex.: `user`). Opcional em folhas. */
  icon?: string
  /** Rota de destino quando `available`. Ausente quando `soon`. */
  route?: string
  status: NavStatus
}

/** Grupo de navegação da sidebar (cabeçalho com ícone + rótulo + sub-itens). */
export interface NavGroup {
  id: string
  label: string
  /** Chave de ícone (PrimeIcons sem o prefixo, ex.: `cog`). */
  icon: string
  /** Rota direta (ex.: Início → `/dashboard`); ausente quando o grupo só agrupa. */
  route?: string
  status: NavStatus
  items: NavItem[]
}
