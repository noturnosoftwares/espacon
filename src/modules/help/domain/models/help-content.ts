// Scope: [M] module-help
//
// Models da Central de Ajuda (Base de Conhecimento, Tutoriais, Novidades,
// Suporte). Conteúdo de produto que futuramente virá de uma API de conhecimento;
// por ora é mock-first. O domain referencia ícones por chave estável (`IconKey`)
// e cores por tom semântico (`Tone`), mantendo-se livre de componentes de UI.

import type { IconKey } from "@/shared/design-system/icon-key";
import type { Tone } from "@/shared/design-system/tones";

/** Categoria da base de conhecimento (agrupa artigos por assunto). */
export type HelpCategory = {
  id: string;
  title: string;
  description: string;
  icon: IconKey;
  tone: Tone;
  articleCount: number;
};

/** Artigo da base de conhecimento. */
export type HelpArticle = {
  id: string;
  categoryId: string;
  title: string;
  excerpt: string;
  readingTimeLabel: string;
  updatedAtLabel: string;
  tags?: string[];
};

/** Trilha/tutorial guiado (vídeo ou passo a passo). */
export type HelpTutorial = {
  id: string;
  title: string;
  description: string;
  durationLabel: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  icon: IconKey;
  tone: Tone;
};

/** Item de "Novidades" (changelog do produto). */
export type HelpNewsKind = "Novo" | "Melhoria" | "Correção";
export type HelpNews = {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  kind: HelpNewsKind;
};

/** Pergunta frequente (FAQ) da área de suporte. */
export type HelpFaq = {
  id: string;
  question: string;
  answer: string;
};

/** Agregado completo da Central de Ajuda (uma única carga). */
export type HelpCenter = {
  categories: HelpCategory[];
  popularArticles: HelpArticle[];
  tutorials: HelpTutorial[];
  news: HelpNews[];
  faqs: HelpFaq[];
};
