// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/helpers)
//
// Helper global sem dono de tipo. Usado para simular latência em providers mock
// durante o desenvolvimento mock-first.

/** Aguarda `ms` milissegundos. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
