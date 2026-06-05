// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/ui)
//
// Rodapé institucional discreto da tela de autenticação. Texto sutil, dentro da
// paleta Noturno, ancorado ao pé da coluna sem deslocar o conteúdo central.

type AuthFooterProps = {
  className?: string;
};

export function AuthFooter({ className = "" }: AuthFooterProps) {
  return (
    <footer
      className={
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-noturno-grey-light/60 " +
        className
      }
    >
      <span>© 2026 Noturno Softwares</span>
      <span aria-hidden="true" className="text-noturno-grey-light/30">
        ·
      </span>
      <a href="#" className="transition-opacity hover:opacity-80">
        Privacidade
      </a>
      <span aria-hidden="true" className="text-noturno-grey-light/30">
        ·
      </span>
      <a href="#" className="transition-opacity hover:opacity-80">
        Suporte
      </a>
    </footer>
  );
}
