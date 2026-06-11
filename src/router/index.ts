import { createRouter, createWebHistory } from 'vue-router'
import { makeSessionRepository } from '@/modules/auth/data/application'

/**
 * Rotas do EspaçoN.
 *
 * Fase 2: a rota `/` é a tela de login (acesso + vitrine). `/dashboard` e
 * `/recuperar-senha` têm specs próprias (home e password-recovery) ainda não
 * implementadas — apontam, **provisoriamente**, para o placeholder de fundação
 * para que o fluxo de login (redirecionamento e link) funcione sem 404. Serão
 * substituídas quando suas specs forem implementadas.
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
      // Placeholder até a spec `docs/specifications/auth/password-recovery.md`.
      component: () => import('@/app/welcome-page.vue'),
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
