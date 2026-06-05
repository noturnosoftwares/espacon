// Scope: [M] module-home
//
// Monta o menu lateral visível ao usuário, aplicando a REGRA de exibição por
// permissão (ver home-layout.md): um grupo só aparece se o usuário tiver a
// permissão do grupo; itens com permissão própria também são filtrados. É regra
// de aplicação (não de apresentação) — por isso vive em data/application.
//
// Síncrono e local (o menu é configuração de produto, não vem da API), portanto
// não usa AsyncResult.

import { PermissionExt } from "@/shared/extensions/permission-ext";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import type { NavGroup } from "../../domain/models/nav";
import { MOCK_NAV } from "../mocks/mock-nav";

export function buildNavigation(user: AuthenticatedUser): NavGroup[] {
  const granted = user.permissions;

  return MOCK_NAV.filter((group) =>
    PermissionExt.has(granted, group.permission),
  ).map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      PermissionExt.has(granted, item.permission),
    ),
  }));
}
