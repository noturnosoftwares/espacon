// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/design-system)
//
// Paleta oficial da Noturno Softwares — fonte única de cores para uso em TS/JS.
// Os mesmos valores estão espelhados como tokens CSS em src/app/globals.css
// (`--color-noturno-*`) para uso via Tailwind. NUNCA usar cores fora desta paleta.

export const NoturnoColors = {
  orange: "#FFB621",
  orangeDark: "#FF9500",

  white: "#FFFFFF",

  greyLight: "#999999",
  greyLightClean: "#D9D9D9",
  greyLightClean2: "#27272A",
  greyLightClean3: "#3F3F47",
  greyDark: "#2E2F36",

  black: "#040404",
  black2: "#1C1C1C",
  black3: "#111820",
  blackSecondary: "#131417",

  red: "#FF2626",
  yellow: "#FFDA0C",

  green: "#00BA81",
  greenLight: "#96D544",

  transparent: "transparent",

  blue: "#036AE3",
  blueDark: "#3FA5EE",
  blueLight: "#21A5EE",
} as const;

export type NoturnoColor = keyof typeof NoturnoColors;
