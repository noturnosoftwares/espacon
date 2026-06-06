<script setup lang="ts">
/**
 * ProfileMenu — área do usuário no Header: avatar + nome + cargo, com menu
 * suspenso contendo **Sair** (logout). Ver `docs/app/authentication.md` (o logout
 * vive aqui, não na navegação).
 *
 * Lê o usuário corrente da `useSessionStore` (sessão provisória — ADR-005) e, no
 * logout, limpa a sessão e volta ao login. Estado local apenas (abrir/fechar).
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/modules/auth/presentation/stores'

const router = useRouter()
const session = useSessionStore()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

function toggle(): void {
  open.value = !open.value
}

function onClickOutside(event: MouseEvent): void {
  if (root.value && !root.value.contains(event.target as Node)) {
    open.value = false
  }
}

function logout(): void {
  open.value = false
  session.logout()
  void router.replace('/')
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex items-center gap-2.5 rounded-xl border border-noturno-grey-light-clean-3 bg-noturno-black-2 py-1.5 pl-1.5 pr-3 transition-colors hover:border-noturno-orange/50 outline-none focus-visible:ring-2 focus-visible:ring-noturno-orange"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="toggle"
    >
      <span
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-noturno-orange text-sm font-bold text-noturno-black"
        aria-hidden="true"
      >
        {{ session.initials || '?' }}
      </span>
      <span class="hidden text-left leading-tight sm:block">
        <span class="block text-sm font-semibold text-noturno-white">
          {{ session.user?.name ?? 'Usuário' }}
        </span>
        <span class="block text-xs text-noturno-grey-light">{{ session.roleLabel }}</span>
      </span>
      <i
        class="pi pi-angle-down text-xs text-noturno-grey-light transition-transform"
        :class="{ 'rotate-180': open }"
        aria-hidden="true"
      ></i>
    </button>

    <!-- Menu -->
    <div
      v-if="open"
      role="menu"
      class="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-noturno-grey-light-clean-3 bg-noturno-black-2 shadow-xl"
    >
      <div class="border-b border-noturno-grey-light-clean-3 px-4 py-3 sm:hidden">
        <p class="text-sm font-semibold text-noturno-white">{{ session.user?.name ?? 'Usuário' }}</p>
        <p class="text-xs text-noturno-grey-light">{{ session.roleLabel }}</p>
      </div>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-noturno-grey-light-clean transition-colors hover:bg-noturno-black hover:text-noturno-red outline-none focus-visible:bg-noturno-black focus-visible:text-noturno-red"
        @click="logout"
      >
        <i class="pi pi-sign-out" aria-hidden="true"></i>
        Sair
      </button>
    </div>
  </div>
</template>
