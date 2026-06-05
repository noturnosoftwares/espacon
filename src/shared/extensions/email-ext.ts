// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/extensions)
//
// Extension de e-mail (namespaced por domínio de valor, sem prototype
// augmentation). Centraliza validação e normalização de e-mail, evitando regex
// duplicada em cada UseCase/formulário (ex.: login e recuperação de senha).

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EmailExt = {
  /** Valida o formato do e-mail (ignora espaços nas pontas). */
  isValid(value: string): boolean {
    return EMAIL_PATTERN.test(value.trim());
  },

  /** Normaliza para comparação/armazenamento (sem espaços, minúsculas). */
  normalize(value: string): string {
    return value.trim().toLowerCase();
  },
} as const;
