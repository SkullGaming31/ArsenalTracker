import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSearchStore } from '../stores/search'
import type { Warframe } from '../types/warframe'

describe('search store advanced matches', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('returns matches metadata when includeMatches is enabled', () => {
    const store = useSearchStore()
    const list = [
      { name: 'Excalibur', type: 'prime', description: 'Starter frame' },
      { name: 'Excalibur Prime', type: 'prime', description: 'Prime frame' },
      { name: 'Volt', type: 'standard', description: 'Electric' }
    ] as unknown as Warframe[]

    store.createFuse(list)
    store.search('prime')

    expect(store.results.length).toBeGreaterThan(0)
    const first = store.results.find(r => r.item.name.includes('Prime'))
    expect(first).toBeDefined()
    // matches should be present and have indices describing matched ranges
    if (first) {
      expect(Array.isArray(first.matches)).toBe(true)
      expect(first.matches!.length).toBeGreaterThan(0)
      const m = first.matches![0]
      expect(m).toBeDefined()
      expect(m).toHaveProperty('indices')
      expect(Array.isArray(m!.indices)).toBe(true)
    }
  })
})
