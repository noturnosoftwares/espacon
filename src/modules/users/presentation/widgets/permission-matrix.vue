<script setup lang="ts">
/**
 * PermissionMatrix — widget reutilizado por **Usuário** e **Perfil** para editar
 * permissões por recurso × ação (ver spec `users-and-permissions`).
 *
 * - Linhas = recursos do **catálogo** agrupados por sessão (catálogo ≠ menu).
 * - Colunas = as 9 ações; células não suportadas pelo recurso aparecem como "—".
 * - Toggles **individual** (célula), **por sessão** (cabeçalho do grupo) e
 *   **por ação/coluna** (cabeçalho da tabela).
 * - **9 contadores ao vivo** no rodapé, atualizados a cada alteração.
 *
 * Estado imutável para fora: emite `update:modelValue` com o `Permission[]`
 * derivado (recursos com ao menos uma ação ligada). O catálogo é a fonte das
 * linhas; o `modelValue` define quais ações estão ligadas.
 */
import { computed, ref, watch } from 'vue'
import {
  type Permission,
  type PermissionActions,
  type PermissionAction,
  ACTION_LABELS,
  ALL_ACTIONS,
  emptyActions,
} from '@/shared/access'
import type { CatalogSection } from '../stores'
import type { PermissionCatalogEntry } from '../../domain/models'

const props = defineProps<{
  sections: CatalogSection[]
  modelValue: Permission[]
}>()

const emit = defineEmits<{ 'update:modelValue': [permissions: Permission[]] }>()

/** Estado de trabalho: chave do recurso → ações ligadas. */
const state = ref<Record<string, PermissionActions>>({})

/** (Re)constrói o estado a partir do catálogo + permissões recebidas. */
function rebuildState(): void {
  const granted = new Map(props.modelValue.map((p) => [p.key, p.actions]))
  const next: Record<string, PermissionActions> = {}
  for (const section of props.sections) {
    for (const entry of section.entries) {
      next[entry.key] = { ...emptyActions(), ...granted.get(entry.key) }
    }
  }
  state.value = next
}

watch(() => [props.sections, props.modelValue], rebuildState, { immediate: true, deep: false })

/** Uma célula só é editável se o recurso suportar a ação (default: todas). */
function isSupported(entry: PermissionCatalogEntry, action: PermissionAction): boolean {
  return !entry.supportedActions || entry.supportedActions.includes(action)
}

function isOn(entry: PermissionCatalogEntry, action: PermissionAction): boolean {
  return state.value[entry.key]?.[action] === true
}

/** Converte o estado em `Permission[]` e emite (apenas recursos com ação ligada). */
function emitChange(): void {
  const permissions: Permission[] = []
  for (const section of props.sections) {
    for (const entry of section.entries) {
      const actions = state.value[entry.key] ?? emptyActions()
      if (ALL_ACTIONS.some((action) => actions[action])) {
        permissions.push({
          code: entry.code,
          key: entry.key,
          label: entry.label,
          section: entry.section,
          actions: { ...actions },
        })
      }
    }
  }
  emit('update:modelValue', permissions)
}

// Toggles
function toggleCell(entry: PermissionCatalogEntry, action: PermissionAction): void {
  if (!isSupported(entry, action)) return
  const current = state.value[entry.key] ?? emptyActions()
  state.value[entry.key] = { ...current, [action]: !current[action] }
  emitChange()
}

/** Liga/desliga uma ação em todos os recursos suportados de uma sessão. */
function toggleSection(section: CatalogSection, action: PermissionAction): void {
  const target = !sectionAllOn(section, action)
  for (const entry of section.entries) {
    if (!isSupported(entry, action)) continue
    const current = state.value[entry.key] ?? emptyActions()
    state.value[entry.key] = { ...current, [action]: target }
  }
  emitChange()
}

/** Liga/desliga uma ação em todos os recursos de todas as sessões (coluna). */
function toggleColumn(action: PermissionAction): void {
  const target = !columnAllOn(action)
  for (const section of props.sections) {
    for (const entry of section.entries) {
      if (!isSupported(entry, action)) continue
      const current = state.value[entry.key] ?? emptyActions()
      state.value[entry.key] = { ...current, [action]: target }
    }
  }
  emitChange()
}

// Helpers de "todos ligados?" (para alternância e destaque)
function sectionAllOn(section: CatalogSection, action: PermissionAction): boolean {
  const supported = section.entries.filter((entry) => isSupported(entry, action))
  return supported.length > 0 && supported.every((entry) => isOn(entry, action))
}

function columnAllOn(action: PermissionAction): boolean {
  const supported = props.sections.flatMap((s) => s.entries).filter((e) => isSupported(e, action))
  return supported.length > 0 && supported.every((entry) => isOn(entry, action))
}

// Contadores ao vivo (uma por ação)
const counters = computed<Record<PermissionAction, number>>(() => {
  const result = Object.fromEntries(ALL_ACTIONS.map((a) => [a, 0])) as Record<
    PermissionAction,
    number
  >
  for (const actions of Object.values(state.value)) {
    for (const action of ALL_ACTIONS) {
      if (actions[action]) result[action] += 1
    }
  }
  return result
})

const actions = ALL_ACTIONS
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-line">
    <table class="w-full border-collapse text-sm">
      <!-- Cabeçalho: rótulo + 9 ações (clique no rótulo da ação alterna a coluna) -->
      <thead>
        <tr class="bg-surface-1 text-content-muted">
          <th class="sticky left-0 z-10 bg-surface-1 px-3 py-2 text-left font-medium">
            Recurso
          </th>
          <th v-for="action in actions" :key="action" class="px-1 py-2 text-center font-medium">
            <button
              type="button"
              class="rounded px-1.5 py-0.5 text-xs uppercase tracking-wide transition-colors hover:text-accent outline-none"
              :class="columnAllOn(action) ? 'text-accent' : 'text-content-muted'"
              :title="`Alternar coluna ${ACTION_LABELS[action]}`"
              @click="toggleColumn(action)"
            >
              {{ ACTION_LABELS[action] }}
            </button>
          </th>
        </tr>
      </thead>

      <tbody>
        <template v-for="section in sections" :key="section.section">
          <!-- Cabeçalho da sessão: toggles por ação para o grupo -->
          <tr class="bg-surface-2/60">
            <th
              class="sticky left-0 z-10 bg-surface-2 px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-accent"
            >
              {{ section.section }}
            </th>
            <td v-for="action in actions" :key="action" class="px-1 py-1.5 text-center">
              <button
                type="button"
                class="inline-flex h-4 w-4 items-center justify-center rounded-sm border transition-colors outline-none"
                :class="
                  sectionAllOn(section, action)
                    ? 'border-accent bg-accent text-on-accent'
                    : 'border-line text-transparent hover:border-accent'
                "
                :title="`Marcar/desmarcar ${ACTION_LABELS[action]} em ${section.section}`"
                @click="toggleSection(section, action)"
              >
                <i class="pi pi-check text-[9px]" aria-hidden="true"></i>
              </button>
            </td>
          </tr>

          <!-- Recursos da sessão -->
          <tr
            v-for="entry in section.entries"
            :key="entry.code"
            class="border-t border-line-subtle hover:bg-surface-2/30"
          >
            <td class="sticky left-0 z-10 bg-surface-canvas px-3 py-1.5 text-content">
              <span>{{ entry.label }}</span>
              <span class="ml-2 text-xs text-content-muted">{{ entry.code }}</span>
            </td>
            <td v-for="action in actions" :key="action" class="px-1 py-1.5 text-center">
              <button
                v-if="isSupported(entry, action)"
                type="button"
                class="inline-flex h-5 w-5 items-center justify-center rounded-sm border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                :class="
                  isOn(entry, action)
                    ? 'border-accent bg-accent text-on-accent'
                    : 'border-line text-transparent hover:border-accent'
                "
                :aria-pressed="isOn(entry, action)"
                :aria-label="`${ACTION_LABELS[action]} — ${entry.label}`"
                @click="toggleCell(entry, action)"
              >
                <i class="pi pi-check text-[10px]" aria-hidden="true"></i>
              </button>
              <span v-else class="text-content-muted" title="Não se aplica">—</span>
            </td>
          </tr>
        </template>
      </tbody>

      <!-- Rodapé: 9 contadores ao vivo -->
      <tfoot>
        <tr class="border-t-2 border-line bg-surface-1">
          <th class="sticky left-0 z-10 bg-surface-1 px-3 py-2 text-left text-xs text-content-muted">
            Contadores
          </th>
          <td
            v-for="action in actions"
            :key="action"
            class="px-1 py-2 text-center text-sm font-semibold"
            :class="counters[action] > 0 ? 'text-accent' : 'text-content-muted'"
          >
            {{ counters[action] }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
