import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSearchStore } from '../stores/search'
import type { Warframe } from '../types/warframe'

describe('search store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('createFuse and search produce results', () => {
    const store = useSearchStore()
    const list = [
      { name: 'Excalibur', type: 'prime', description: 'A starter warframe' },
      { name: 'Volt', type: 'standard', description: 'Electric' },
    ] as unknown as Warframe[]
    store.createFuse(list)
    store.search('exc')
    expect(store.results.length).toBeGreaterThan(0)
    const first = store.results[0]
    expect(first).toBeDefined()
    expect(first!.item.name).toBe('Excalibur')
  })
})
