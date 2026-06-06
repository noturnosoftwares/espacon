import type { AsyncResult } from '@/shared/result'
import type { HomeDashboard } from '../../domain/models'
import type { HomeRepository } from '../../domain/repositories'
import { HomeRepositoryImpl } from '../repositories/home-repository-impl'
import { MockHomeProvider } from '../providers/mock-home-provider'

export type GetHomeDashboardUseCase = () => Promise<AsyncResult<HomeDashboard>>

/**
 * makeGetHomeDashboardUseCase — compõe o carregamento do painel inicial por
 * factory explícita: UseCase → HomeRepository → MockHomeProvider.
 *
 * TROCA POR API REAL: trocar `MockHomeProvider` por `RestHomeProvider` aqui.
 */
export function makeGetHomeDashboardUseCase(): GetHomeDashboardUseCase {
  const provider = new MockHomeProvider()
  const repository: HomeRepository = new HomeRepositoryImpl(provider)
  return () => repository.getDashboard()
}
