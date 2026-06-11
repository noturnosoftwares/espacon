import { createRouter, createWebHistory } from 'vue-router'
import { makeSessionRepository } from '@/modules/auth/data/application'

/**
 * Rotas do EspaçoN.
 *
 * Fase 2: `/` é o login (acesso + vitrine), `/recuperar-senha` a recuperação de
 * senha (spec `auth/password-recovery`) e `/dashboard` a home — todas
 * implementadas. As telas logadas vivem dentro do `AppShell` (`/app`).
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/modules/auth/presentation/pages/login-page.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/recuperar-senha',
      name: 'password-recovery',
      component: () =>
        import('@/modules/auth/presentation/pages/password-recovery-page.vue'),
      meta: { guestOnly: true },
    },

    /*
     * Casca da aplicação autenticada (Design System §8.9): toda tela logada
     * renderiza dentro do `AppShell` (sidebar + topbar). Os filhos usam caminhos
     * absolutos, então a URL fica limpa (`/dashboard`, `/usuarios`) — o `/app` do
     * pai não aparece na barra de endereço.
     */
    {
      path: '/app',
      component: () => import('@/modules/home/presentation/widgets/app-shell.vue'),
      meta: { requiresAuth: true },
      redirect: { name: 'dashboard' },
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          // Home — tela principal (ver `docs/specifications/home/README.md`).
          component: () => import('@/modules/home/presentation/pages/home-page.vue'),
          meta: { requiresAuth: true },
        },

        // Usuários, Perfis e Permissões (ver spec `users-and-permissions` / ADR-008).
        {
          path: '/usuarios',
          name: 'users',
          component: () => import('@/modules/users/presentation/pages/users-page.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/usuarios/novo',
          name: 'user-new',
          component: () => import('@/modules/users/presentation/pages/user-form-page.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/usuarios/:id',
          name: 'user-edit',
          component: () => import('@/modules/users/presentation/pages/user-form-page.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/perfis',
          name: 'user-profiles',
          component: () => import('@/modules/users/presentation/pages/user-profiles-page.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/perfis/novo',
          name: 'user-profile-new',
          component: () => import('@/modules/users/presentation/pages/user-profile-form-page.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/perfis/:id',
          name: 'user-profile-edit',
          component: () => import('@/modules/users/presentation/pages/user-profile-form-page.vue'),
          meta: { requiresAuth: true },
        },

        // Operadores de Caixa (ver spec `financial/cash-operator`). Registro
        // mestre referenciado por usuários e pelo Financeiro; abre em modo
        // seleção (`?mode=select`) a partir do bloco "Caixa" do usuário.
        {
          path: '/operadores-de-caixa',
          name: 'cash-operators',
          component: () => import('@/modules/cash-operators/presentation/pages/cash-operators-page.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/operadores-de-caixa/novo',
          name: 'cash-operator-new',
          component: () => import('@/modules/cash-operators/presentation/pages/cash-operator-form-page.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/operadores-de-caixa/:id',
          name: 'cash-operator-edit',
          component: () => import('@/modules/cash-operators/presentation/pages/cash-operator-form-page.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
  ],
})

/**
 * Guard de sessão (ver ADR-005 / spec do login):
 * - sessão salva válida + rota `guestOnly` (login) → vai direto ao `/dashboard`;
 * - rota `requiresAuth` sem sessão → volta ao login.
 *
 * A leitura da sessão usa a factory do módulo auth (persistência provisória),
 * mantendo o router desacoplado da implementação de storage.
 */
const sessionRepository = makeSessionRepository()

router.beforeEach((to) => {
  const hasSession = sessionRepository.read() !== null

  if (to.meta.requiresAuth && !hasSession) {
    return { name: 'login' }
  }
  if (to.meta.guestOnly && hasSession && to.name === 'login') {
    return { name: 'dashboard' }
  }
  return true
})

export default router
