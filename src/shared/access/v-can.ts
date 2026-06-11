import type { Directive, DirectiveBinding } from 'vue'
import type { PermissionAction } from './permission-action'
import { useAccess } from './use-access'

/**
 * Valor da diretiva `v-can`. `mode` controla o efeito quando o acesso é negado:
 * - `hide` (padrão): remove o elemento do fluxo (`display: none`);
 * - `disable`: mantém visível, porém inerte (`disabled` + aparência apagada).
 */
export interface CanBinding {
  key: string
  action: PermissionAction
  mode?: 'hide' | 'disable'
}

function apply(el: HTMLElement, binding: DirectiveBinding<CanBinding>): void {
  const { key, action, mode = 'hide' } = binding.value
  const { can } = useAccess()
  const allowed = can(key, action)

  if (mode === 'disable') {
    el.toggleAttribute('disabled', !allowed)
    el.classList.toggle('opacity-50', !allowed)
    el.classList.toggle('pointer-events-none', !allowed)
    el.style.removeProperty('display')
  } else {
    el.style.display = allowed ? '' : 'none'
  }
}

/**
 * Diretiva `v-can="{ key, action, mode? }"` — esconde ou desabilita qualquer
 * elemento conforme a permissão do usuário em sessão. Reavalia em `updated` para
 * acompanhar mudanças de binding/estado.
 *
 * Registrada globalmente em `main.ts` como `can`.
 */
export const vCan: Directive<HTMLElement, CanBinding> = {
  mounted: apply,
  updated: apply,
}
