import type { AsyncResult } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import type { City } from '../../domain/models'
import type { CityRepository, ListCitiesParams } from '../../domain/repositories'
import { CityRepositoryImpl } from '../repositories/city-repository-impl'
import { MockCityProvider } from '../providers/mock-city-provider'

export interface CitiesUseCases {
  getCities: (params: ListCitiesParams) => Promise<AsyncResult<PageResult<City>>>
  getCityById: (id: number) => Promise<AsyncResult<City>>
  saveCity: (city: City) => Promise<AsyncResult<City>>
  deleteCity: (id: number) => Promise<AsyncResult<void>>
}

export function makeCityRepository(): CityRepository {
  return new CityRepositoryImpl(new MockCityProvider())
}

export function makeCitiesUseCases(): CitiesUseCases {
  const repository = makeCityRepository()
  return {
    getCities: (params) => repository.list(params),
    getCityById: (id) => repository.getById(id),
    saveCity: (city) => repository.save(city),
    deleteCity: (id) => repository.remove(id),
  }
}
