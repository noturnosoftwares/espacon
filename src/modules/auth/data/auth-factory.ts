// Scope: [M] module-auth
//
// Composição explícita do módulo de autenticação (sem container global de DI).
// Liga provider → repository → usecase. Trocar o mock pela API real significa
// substituir o provider instanciado aqui (e adicionar o mapper correspondente).

import { localStore, sessionStore } from "@/shared/storage/key-value-store";
import { LoginUseCase } from "./application/login-usecase";
import { RecoverPasswordUseCase } from "./application/recover-password-usecase";
import { MockAuthProvider } from "./providers/mock-auth-provider";
import { AuthRepositoryImpl } from "./repositories/auth-repository-impl";
import { SessionRepositoryImpl } from "./repositories/session-repository-impl";
import type { SessionRepository } from "../domain/repositories/session-repository";

/** Monta o LoginUseCase com o provider mock atual. */
export function makeLoginUseCase(): LoginUseCase {
  const provider = new MockAuthProvider();
  const repository = new AuthRepositoryImpl(provider);
  return new LoginUseCase(repository);
}

/** Monta o RecoverPasswordUseCase com o provider mock atual. */
export function makeRecoverPasswordUseCase(): RecoverPasswordUseCase {
  const provider = new MockAuthProvider();
  const repository = new AuthRepositoryImpl(provider);
  return new RecoverPasswordUseCase(repository);
}

/**
 * Monta o SessionRepository provisório (ADR-005), sobre o armazenamento local do
 * navegador. Trocar por sessão real (token/cookie via API) = nova implementação
 * deste contrato, sem impacto nas camadas acima.
 */
export function makeSessionRepository(): SessionRepository {
  return new SessionRepositoryImpl(localStore(), sessionStore());
}
