import type { AsyncResult } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import type { State } from '../../domain/models'
import type { ListStatesParams, StateRepository } from '../../domain/repositories'
import { StateRepositoryImpl } from '../repositories/state-repository-impl'
import { MockStateProvider } from '../providers/mock-state-provider'

export interface StatesUseCases {
  getStates: (params: ListStatesParams) => Promise<AsyncResult<PageResult<State>>>
  getStateById: (id: number) => Promise<AsyncResult<State>>
  saveState: (state: State) => Promise<AsyncResult<State>>
  deleteState: (id: number) => Promise<AsyncResult<void>>
}

export function makeStateRepository(): StateRepository {
  return new StateRepositoryImpl(new MockStateProvider())
}

export function makeStatesUseCases(): StatesUseCases {
  const repository = makeStateRepository()
  return {
    getStates: (params) => repository.list(params),
    getStateById: (id) => repository.getById(id),
    saveState: (state) => repository.save(state),
    deleteState: (id) => repository.remove(id),
  }
}
