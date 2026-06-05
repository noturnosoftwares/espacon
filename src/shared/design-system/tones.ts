// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/design-system)
//
// Tons visuais reutilizáveis (Dark First) — mapeiam um nome semântico de tom para
// a paleta Noturno. Fonte única para badges de ícone (gradiente + ring), cor base
// (hex para sparkline/glow/acento) usada por dashboard, ajuda e demais módulos.
// NUNCA usar cores fora da paleta oficial.

export type Tone = "orange" | "green" | "blue" | "red" | "neutral";

/** Cor base (hex da paleta) para sparkline, glow e acentos inline. */
export const TONE_HEX: Record<Tone, string> = {
  orange: "#FFB621",
  green: "#00BA81",
  blue: "#21A5EE",
  red: "#FF2626",
  neutral: "#D9D9D9",
};

/** Classes de pílula/chip suave (fundo translúcido + texto na cor do tom). */
export const TONE_SOFT: Record<Tone, string> = {
  orange: "bg-noturno-orange/10 text-noturno-orange",
  green: "bg-noturno-green/10 text-noturno-green",
  blue: "bg-noturno-blue-light/10 text-noturno-blue-light",
  red: "bg-noturno-red/10 text-noturno-red",
  neutral: "bg-white/8 text-noturno-grey-light-clean",
};

/** Classes do badge de ícone (gradiente sutil + texto + ring interno). */
export const TONE_BADGE: Record<Tone, string> = {
  orange:
    "bg-gradient-to-br from-noturno-orange/30 to-noturno-orange/5 text-noturno-orange ring-1 ring-inset ring-noturno-orange/25",
  green:
    "bg-gradient-to-br from-noturno-green/30 to-noturno-green/5 text-noturno-green ring-1 ring-inset ring-noturno-green/25",
  blue: "bg-gradient-to-br from-noturno-blue-light/30 to-noturno-blue-light/5 text-noturno-blue-light ring-1 ring-inset ring-noturno-blue-light/25",
  red: "bg-gradient-to-br from-noturno-red/30 to-noturno-red/5 text-noturno-red ring-1 ring-inset ring-noturno-red/25",
  neutral:
    "bg-gradient-to-br from-white/12 to-white/[0.02] text-noturno-grey-light-clean ring-1 ring-inset ring-white/10",
};
