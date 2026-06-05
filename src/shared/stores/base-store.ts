// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/stores)
//
// BaseStore — store base da hierarquia de estado da Noturno (BaseStore → store
// específica da tela). Concentra os estados comuns (loading, mensagens, erro) e
// expõe um padrão observável (snapshot imutável + subscribe) compatível com o
// `useSyncExternalStore` nativo do React — sem dependência externa.
//
// Telas que NÃO são CRUD (login, dashboard) devem estender apenas BaseStore.
// BaseCrudStore (listagem/paginação/filtros) só deve existir quando houver CRUD real.

import { useSyncExternalStore } from "react";

/** Estado comum compartilhado por todas as stores. */
export type BaseState = {
  loading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  isInitialized: boolean;
};

const INITIAL_BASE_STATE: BaseState = {
  loading: false,
  errorMessage: null,
  successMessage: null,
  isInitialized: false,
};

type Listener = () => void;

/**
 * Store base observável.
 *
 * O estado é mantido como objeto imutável: cada alteração cria uma nova
 * referência via `setState`, o que permite que o React detecte mudanças por
 * identidade. Stores específicas estendem esta classe e adicionam o próprio
 * estado em `S`.
 */
export abstract class BaseStore<S extends BaseState = BaseState> {
  // Estado privado: a presentation só lê via snapshot / getters.
  private listeners = new Set<Listener>();
  private state: S;

  protected constructor(initialState: S) {
    this.state = initialState;
  }

  /** Estado inicial base — usado pelas subclasses ao montar seu estado. */
  protected static baseState(): BaseState {
    return { ...INITIAL_BASE_STATE };
  }

  // ----- Leitura (snapshot estável para useSyncExternalStore) -----

  /** Snapshot imutável atual. Mesma referência enquanto o estado não muda. */
  getSnapshot = (): S => this.state;

  get hasError(): boolean {
    return this.state.errorMessage !== null;
  }

  // ----- Assinatura -----

  /** Registra um listener e devolve a função de cancelamento. */
  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  // ----- Escrita (apenas subclasses) -----

  /** Aplica uma alteração parcial criando uma nova referência de estado. */
  protected setState(patch: Partial<S>): void {
    this.state = { ...this.state, ...patch };
    this.emit();
  }

  protected setLoading(loading: boolean): void {
    this.setState({ loading } as Partial<S>);
  }

  protected setError(message: string | null): void {
    this.setState({ errorMessage: message } as Partial<S>);
  }

  protected setSuccess(message: string | null): void {
    this.setState({ successMessage: message } as Partial<S>);
  }

  /** Limpa mensagens de erro/sucesso (ex.: ao reabrir um formulário). */
  clearMessages(): void {
    this.setState({ errorMessage: null, successMessage: null } as Partial<S>);
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}

/**
 * Hook que liga um componente a uma store, com seletor opcional.
 *
 * Sem seletor, devolve o snapshot inteiro. Com seletor, devolve apenas a fatia
 * derivada — útil para limitar re-renderizações a partes específicas do estado.
 */
export function useStore<S extends BaseState, R>(
  store: BaseStore<S>,
  selector: (state: S) => R = (state) => state as unknown as R,
): R {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getSnapshot()),
    () => selector(store.getSnapshot()),
  );
}
