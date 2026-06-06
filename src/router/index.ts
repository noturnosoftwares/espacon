import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'welcome',
      // Placeholder da Fase 0; será substituído pelo login (Fase 2).
      component: () => import('@/app/welcome-page.vue'),
    },
  ],
})

export default router
