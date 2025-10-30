import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSearchStore } from '../stores/search'
import type { Warframe } from '../types/warframe'

describe('search store branches', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('returns empty results when fuse is not initialized', () => {
    const store = useSearchStore()
    // do not call createFuse()
    store.search('anything')
    expect(store.results.length).toBe(0)
  })

  it('returns empty results for blank or whitespace query', () => {
    const store = useSearchStore()
    const list = [
      { name: 'Excalibur', type: 'prime', description: 'Starter' },
    ] as unknown as Warframe[]
    store.createFuse(list)

    store.search('')
    expect(store.results.length).toBe(0)

    store.search('   ')
    expect(store.results.length).toBe(0)
  })
})
