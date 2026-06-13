import type { SupplierJson } from '../../domain/models'
import { MOCK_SUPPLIERS } from '../mocks/mock-suppliers'

/**
 * MockSupplierProvider — CRUD em memória do fornecedor (spec §13/§16). Latência
 * simulada; estado mutável. `inactivate` faz **inativação soft** (`situacao =
 * INATIVO`); `remove` é exclusão física (no mock, sem rastreio de referências).
 * Unicidade de documento é do backend (D7) — não enforçada aqui.
 *
 * TROCA POR API REAL: `RestSupplierProvider` (`/suppliers`).
 */
const MOCK_LATENCY_MS = 350

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

const store: SupplierJson[] = clone(MOCK_SUPPLIERS)

export class MockSupplierProvider {
  async list(): Promise<SupplierJson[]> {
    await delay(MOCK_LATENCY_MS)
    return clone(store)
  }

  async getById(id: number): Promise<SupplierJson | null> {
    await delay(MOCK_LATENCY_MS)
    const found = store.find((s) => s.codigo === id)
    return found ? clone(found) : null
  }

  async save(supplier: SupplierJson): Promise<SupplierJson> {
    await delay(MOCK_LATENCY_MS)
    if (supplier.codigo && supplier.codigo > 0) {
      const index = store.findIndex((s) => s.codigo === supplier.codigo)
      if (index === -1) throw new Error('NOT_FOUND')
      store[index] = clone(supplier)
      return clone(supplier)
    }
    const nextId = store.reduce((max, s) => Math.max(max, s.codigo ?? 0), 0) + 1
    const created = { ...clone(supplier), codigo: nextId }
    store.push(created)
    return clone(created)
  }

  /** Inativação soft (spec §4.6): marca `situacao = INATIVO`. */
  async inactivate(id: number): Promise<void> {
    await delay(MOCK_LATENCY_MS)
    const found = store.find((s) => s.codigo === id)
    if (!found) throw new Error('NOT_FOUND')
    found.situacao = 'INATIVO'
  }

  /** Exclusão física (só quando nunca referenciado — no mock, sempre permitida). */
  async remove(id: number): Promise<void> {
    await delay(MOCK_LATENCY_MS)
    const index = store.findIndex((s) => s.codigo === id)
    if (index === -1) throw new Error('NOT_FOUND')
    store.splice(index, 1)
  }

  async totals(): Promise<SupplierJson[]> {
    await delay(MOCK_LATENCY_MS)
    return clone(store)
  }
}
