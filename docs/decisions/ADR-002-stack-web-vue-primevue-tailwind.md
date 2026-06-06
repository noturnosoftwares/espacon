# ADR-002 — Stack web: Vue 3.5 + PrimeVue v4 + Tailwind v4

## Status

Aceito

## Data

2026-06-06

## Contexto

O EspaçoN precisa de uma stack web madura, produtiva e duradoura, alinhada ao
template corporativo da Noturno (Vue, Vite, TS, PrimeVue, Tailwind, Pinia, Vue
Router) e ao Design System próprio (paleta oficial, tema dark-first).

## Opções avaliadas

### Opção 1 — React/Next.js

Ecossistema grande, porém o template e a experiência da equipe apontam para Vue;
Next traria SSR/rotas de API desnecessárias (frontend é desacoplado).

### Opção 2 — Vue 3 + Vuetify

Vuetify é coeso, mas o padrão corporativo já define PrimeVue + Tailwind, com mais
controle visual para o Design System próprio.

### Opção escolhida — Vue 3.5 + Vite + PrimeVue v4 + Tailwind v4

Composition API + Pinia + Vue Router; PrimeVue v4 (preset Aura) para componentes
ricos; Tailwind v4 CSS-first (`@theme`) para tokens da paleta e utilitários.

## Decisão

- Stack: Vue 3.5, Vite, TypeScript, Pinia, Vue Router, PrimeVue v4 (`@primeuix/themes`),
  Tailwind v4 (`@tailwindcss/vite`), PrimeIcons.
- Tailwind configurado CSS-first em `src/app/globals.css`; paleta oficial exposta
  como tokens `@theme` (`--color-noturno-*`).
- Ordem de camadas CSS: `tailwind-base, primevue, tailwind-utilities` (utilitários
  Tailwind sobrepõem componentes PrimeVue).
- Tema **dark-first** via classe `.dark` no `<html>` + `darkModeSelector: '.dark'`.
- Nunca usar cores fora da paleta oficial.

## Consequências

### Benefícios

- Alta produtividade com componentes prontos + utilitários.
- Identidade visual própria garantida via tokens.
- Stack consolidada e de longa manutenção.

### Riscos

- Integração PrimeVue × Tailwind exige ordem de camadas correta → fixada acima.

### Impactos

`vite.config.ts`, `src/main.ts`, `src/app/globals.css`, `index.html`.

## Quando revisar esta decisão

Em major release incompatível de PrimeVue/Tailwind, ou se o Design System exigir
abordagem diferente.

## Relação com outros ADRs

Independente; habilita o Design System usado por todos os módulos.

## Observações

A paleta é corporativa (template); a escolha do tema dark-first é do produto EspaçoN.
