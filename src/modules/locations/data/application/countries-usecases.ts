import type { AsyncResult } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import type { Country } from '../../domain/models'
import type { CountryRepository, ListCountriesParams } from '../../domain/repositories'
import { CountryRepositoryImpl } from '../repositories/country-repository-impl'
import { MockCountryProvider } from '../providers/mock-country-provider'

export interface CountriesUseCases {
  getCountries: (params: ListCountriesParams) => Promise<AsyncResult<PageResult<Country>>>
  getCountryById: (id: number) => Promise<AsyncResult<Country>>
  saveCountry: (country: Country) => Promise<AsyncResult<Country>>
  deleteCountry: (id: number) => Promise<AsyncResult<void>>
}

export function makeCountryRepository(): CountryRepository {
  return new CountryRepositoryImpl(new MockCountryProvider())
}

export function makeCountriesUseCases(): CountriesUseCases {
  const repository = makeCountryRepository()
  return {
    getCountries: (params) => repository.list(params),
    getCountryById: (id) => repository.getById(id),
    saveCountry: (country) => repository.save(country),
    deleteCountry: (id) => repository.remove(id),
  }
}
