import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCollectionStore, STORAGE_KEY } from '../stores/collection'

describe('collection store load from versioned storage', () => {
  beforeEach(() => {
    // prepare a versioned payload in localStorage
    localStorage.clear()
    const payload = { version: 1, overrides: { 'Versioned': { crafted: true } } }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    setActivePinia(createPinia())
  })

  it('loads versioned payload on initialization', () => {
    const store = useCollectionStore()
    expect(store.overrides['Versioned']).toBeDefined()
    expect((store.overrides['Versioned'] as Record<string, unknown>).crafted).toBe(true)
  })
})
