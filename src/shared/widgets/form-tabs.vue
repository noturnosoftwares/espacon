<script setup lang="ts">
/**
 * FormTabs — **sub-abas internas de formulário** (Design System §9.2). Para telas
 * grandes (ex.: Fornecedor) que dividem a aba **Cadastro** em seções navegáveis
 * (Dados Gerais, Endereço, Contato, Fiscal, Bancário, Observações).
 *
 * Controlado: `v-model` é a chave da aba ativa; o conteúdo de cada aba vem por um
 * **slot nomeado pela chave**. Abas com pendência de validação recebem um ponto
 * de alerta (`errorKeys`) — o usuário enxerga onde corrigir sem submeter às cegas.
 */
interface FormTab {
  key: string
  label: string
  icon?: string
}

withDefaults(
  defineProps<{
    modelValue: string
    tabs: FormTab[]
    /** Chaves de abas com campos inválidos (mostra alerta na aba). */
    errorKeys?: string[]
  }>(),
  { errorKeys: () => [] },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex min-w-0 flex-col">
    <!-- Barra de abas: rolável no mobile, sublinhado dourado na ativa. -->
    <div
      role="tablist"
      class="flex gap-1 overflow-x-auto border-b border-line-subtle"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        role="tab"
        :aria-selected="modelValue === tab.key"
        class="ds-focus-ring -mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
        :class="
          modelValue === tab.key
            ? 'border-accent text-content'
            : 'border-transparent text-content-muted hover:text-content'
        "
        @click="emit('update:modelValue', tab.key)"
      >
        <i v-if="tab.icon" :class="['pi', tab.icon, 'text-xs']" aria-hidden="true"></i>
        <span>{{ tab.label }}</span>
        <span
          v-if="errorKeys.includes(tab.key)"
          class="h-1.5 w-1.5 shrink-0 rounded-full bg-danger"
          title="Há campos a corrigir nesta aba"
          aria-label="Há campos a corrigir nesta aba"
        ></span>
      </button>
    </div>

    <!-- Conteúdo da aba ativa (slot nomeado pela chave). -->
    <div class="pt-5">
      <slot :name="modelValue" />
    </div>
  </div>
</template>
