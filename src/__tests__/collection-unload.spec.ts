import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCollectionStore, STORAGE_KEY } from '../stores/collection'

describe('collection store unload flush', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    // ensure non-test env so watcher debounces
    if (typeof process !== 'undefined' && process.env) process.env.NODE_ENV = 'development'
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (typeof process !== 'undefined' && process.env) process.env.NODE_ENV = 'test'
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('flushes pending debounced saves when beforeunload fires', async () => {
    const store = useCollectionStore()

    // make a change that will schedule a debounced save
    store.setOverride('UnloadWeapon', { crafted: true })

    // allow Vue's watch to enqueue the schedule
    await Promise.resolve()

    // not written yet
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    // simulate page unload — registered handler should clear timeout and call saveToStorage synchronously
    window.dispatchEvent(new Event('beforeunload'))

    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).toBeTruthy()
    if (raw) {
      const parsed = JSON.parse(raw)
      expect(parsed.overrides['UnloadWeapon']).toBeDefined()
      expect(parsed.overrides['UnloadWeapon'].crafted).toBe(true)
    }
  })
})
