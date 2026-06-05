// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/extensions)
//
// Extension de permissões (namespaced, sem prototype augmentation). Centraliza a
// verificação de acesso usada para exibir menus, botões e widgets conforme as
// permissões do usuário autenticado (fornecidas pelo backend). Suporta o coringa
// global "*" (acesso total — ex.: admin de matriz) e o coringa por prefixo
// (ex.: "clients.*" cobre "clients.view", "clients.edit", ...).

const WILDCARD = "*";

export const PermissionExt = {
  /**
   * Indica se o conjunto de permissões concede a permissão exigida.
   *
   * - `required` ausente/vazio → liberado (item sem restrição);
   * - `"*"` nas concedidas → libera tudo;
   * - correspondência exata libera;
   * - coringa por prefixo `"area.*"` libera qualquer `"area.x"`.
   */
  has(granted: readonly string[], required?: string): boolean {
    if (!required) return true;
    if (granted.includes(WILDCARD)) return true;
    if (granted.includes(required)) return true;

    return granted.some((permission) => {
      if (!permission.endsWith(`.${WILDCARD}`)) return false;
      const prefix = permission.slice(0, -1); // mantém o ponto: "area."
      return required.startsWith(prefix);
    });
  },
} as const;
