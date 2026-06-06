# Arquitetura — EspaçoN

> Regras corporativas (camadas, mock-first, AsyncResult, mappers, stores,
> extensions/helpers, classificação de reuso) vivem no template
> `../template`. Este documento registra apenas a arquitetura
> **específica** do EspaçoN e como o template é aplicado aqui.

## Stack

- Vue.js 3.5
- Vite
- TypeScript
- PrimeVue UI
- Tailwind CSS
- Composition API
- Pinia
- Vue Router
- Tailwind v4 (configuração CSS-first via `@theme` em `src/app/globals.css`)

- Sem backend no projeto (frontend desacoplado; comunicação futura via REST)
