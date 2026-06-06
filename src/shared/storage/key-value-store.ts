/**
 * KeyValueStore — abstração de armazenamento chave/valor.
 *
 * Isola o restante do app de `localStorage`/`sessionStorage` diretos, permitindo
 * trocar a implementação (ex.: storage seguro/criptografado, memória em testes)
 * sem alterar quem consome.
 *
 * Os valores são serializados em JSON.
 */
export interface KeyValueStore {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
  clear(): void
}

/** Implementação sobre a Web Storage API (`localStorage`/`sessionStorage`). */
export class BrowserKeyValueStore implements KeyValueStore {
  constructor(private readonly storage: Storage) {}

  get<T>(key: string): T | null {
    const raw = this.storage.getItem(key)
    if (raw === null) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      // Valor corrompido/legado: remove para não quebrar leituras futuras.
      this.storage.removeItem(key)
      return null
    }
  }

  set<T>(key: string, value: T): void {
    this.storage.setItem(key, JSON.stringify(value))
  }

  remove(key: string): void {
    this.storage.removeItem(key)
  }

  clear(): void {
    this.storage.clear()
  }
}

/** Persistência entre sessões do navegador (ex.: "manter acesso"). */
export const localKeyValueStore: KeyValueStore = new BrowserKeyValueStore(localStorage)

/** Persistência apenas durante a aba/sessão atual. */
export const sessionKeyValueStore: KeyValueStore = new BrowserKeyValueStore(sessionStorage)
