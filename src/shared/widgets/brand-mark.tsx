// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/design-system)
//
// Wordmark da Noturno Softwares. Não há asset de logo no repositório, então a
// marca é tipográfica usando a paleta oficial. O glifo "N" é um SVG próprio.

type BrandMarkProps = {
  /** Subtítulo opcional ao lado da marca (ex.: "HelpDesk"). */
  product?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

const SIZES = {
  sm: { glyph: 28, title: "text-lg", product: "text-[11px]" },
  md: { glyph: 36, title: "text-2xl", product: "text-xs" },
  lg: { glyph: 44, title: "text-3xl", product: "text-sm" },
  // xl: ~+40% de área em relação ao lg (44px → 52px, fator linear ≈ 1,18).
  xl: { glyph: 52, title: "text-4xl", product: "text-base" },
} as const;

export function BrandMark({ product, size = "md" }: BrandMarkProps) {
  const s = SIZES[size];
  return (
    <div className="flex items-center gap-3">
      <svg
        width={s.glyph}
        height={s.glyph}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="48" height="48" rx="12" fill="#FFB621" />
        <path
          d="M15 34V14l18 20V14"
          stroke="#040404"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex flex-col leading-none">
        <span className={`font-semibold tracking-tight text-white ${s.title}`}>
          Noturno
          {product && <span className="text-noturno-orange"> {product}</span>}
        </span>
        <span
          className={`mt-1 font-medium uppercase tracking-[0.28em] text-noturno-grey-light ${s.product}`}
        >
          Softwares
        </span>
      </div>
    </div>
  );
}
