import '@/app/globals.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

import App from './App.vue'
import router from './router'
import { vCan } from '@/shared/access'

const app = createApp(App)

app.use(createPinia())
app.use(router)

/*
 * Preset Noturno (Design System §13): o Aura é remapeado para a paleta oficial
 * — `primary` no dourado da marca e `surface` na escada dark-first. Assim todo
 * componente PrimeVue (Select, ToggleSwitch, DataTable, Dialog, Tag, Toast)
 * nasce on-brand, sem estilização crua por fora.
 */
const NoturnoPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fff7e8',
      100: '#ffeec0',
      200: '#ffe195',
      300: '#ffd35f',
      400: '#ffc63f',
      500: '#ffb621',
      600: '#ff9500',
      700: '#d97a00',
      800: '#a85e00',
      900: '#804700',
      950: '#4d2a00',
    },
    // Campos PrimeVue (Select, Textarea, AutoComplete…) na mesma anatomia dos
    // campos-base: raio `radius-field`, borda discreta, foco dourado com anel suave.
    formField: {
      borderRadius: '10px',
      focusRing: {
        width: '2px',
        style: 'solid',
        color: 'color-mix(in oklab, {primary.500} 20%, transparent)',
        offset: '0',
      },
    },
    colorScheme: {
      dark: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#040404',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        highlight: {
          background: 'color-mix(in oklab, {primary.500} 14%, transparent)',
          focusBackground: 'color-mix(in oklab, {primary.500} 24%, transparent)',
          color: '{primary.500}',
          focusColor: '{primary.400}',
        },
        surface: {
          0: '#ffffff',
          50: '#f7f7f8',
          100: '#e4e4e7',
          200: '#d9d9d9',
          300: '#999999',
          400: '#71717a',
          500: '#52525b',
          600: '#3f3f47',
          700: '#27272a',
          800: '#1c1c1c',
          900: '#131417',
          950: '#040404',
        },
        formField: {
          background: '#1c1c1c',
          borderColor: 'color-mix(in oklab, #3f3f47 40%, transparent)',
          hoverBorderColor: '#3f3f47',
          focusBorderColor: '{primary.color}',
          color: '#ffffff',
          placeholderColor: '#999999',
        },
      },
    },
  },
})

// Diretiva de autorização declarativa: `v-can="{ key, action, mode? }"`
// (esconde/desabilita conforme permissão do usuário em sessão — ver shared/access).
app.directive('can', vCan)

// Design System — Dark First (ver docs/decisions). O tema escuro é ativado pela
// classe `.dark` no <html> (index.html); um modo light pode ser avaliado depois.
app.use(PrimeVue, {
  theme: {
    preset: NoturnoPreset,
    options: {
      darkModeSelector: '.dark',
      cssLayer: {
        name: 'primevue',
        order: 'tailwind-base, primevue, tailwind-utilities',
      },
    },
  },
})

// Toasts no canto superior esquerdo (Design System §8.8) — ver <Toast> em App.vue.
app.use(ToastService)

app.mount('#app')
