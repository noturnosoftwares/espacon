// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/storage)
//
// Abstração mínima de armazenamento chave/valor. Isola o acesso ao Web Storage
// (localStorage/sessionStorage) atrás de um contrato simples — útil para sessão,
// preferências, rascunhos e qualquer estado local de qualquer módulo.
//
// SSR-safe: em ambiente sem `window` (renderização no servidor do Next.js) cai
// para um store em memória, evitando erro de acesso a `window` e mantendo a API
// estável. Toda leitura/escrita é protegida (storage pode lançar — cota cheia,
// modo privado de alguns navegadores, etc.).

/** Porta de armazenamento síncrono chave → valor (string). */
export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

/** Implementação em memória — fallback de SSR/testes (não persiste entre cargas). */
class MemoryStore implements KeyValueStore {
  private readonly data = new Map<string, string>();

  get(key: string): string | null {
    return this.data.has(key) ? (this.data.get(key) as string) : null;
  }

  set(key: string, value: string): void {
    this.data.set(key, value);
  }

  remove(key: string): void {
    this.data.delete(key);
  }
}

/**
 * Implementação sobre Web Storage. Recebe um acessor preguiçoso ao `Storage`
 * para que a escolha (local vs session) e a checagem de disponibilidade fiquem
 * no factory. Toda operação é protegida contra exceções do navegador.
 */
class BrowserStore implements KeyValueStore {
  constructor(private readonly pick: () => Storage) {}

  get(key: string): string | null {
    try {
      return this.pick().getItem(key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    try {
      this.pick().setItem(key, value);
    } catch {
      // Silencioso por design: persistência local é best-effort.
    }
  }

  remove(key: string): void {
    try {
      this.pick().removeItem(key);
    } catch {
      // idem
    }
  }
}

/** Store persistente entre sessões do navegador (localStorage). */
export function localStore(): KeyValueStore {
  if (typeof window === "undefined") return new MemoryStore();
  return new BrowserStore(() => window.localStorage);
}

/** Store válido apenas enquanto a aba estiver aberta (sessionStorage). */
export function sessionStore(): KeyValueStore {
  if (typeof window === "undefined") return new MemoryStore();
  return new BrowserStore(() => window.sessionStorage);
}
