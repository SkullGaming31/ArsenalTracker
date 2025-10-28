import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCollectionStore, STORAGE_KEY } from '../stores/collection'

describe('collection store - edge cases', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  afterEach(() => {
    // restore any env modifications
    if (typeof process !== 'undefined' && process.env) process.env.NODE_ENV = 'test'
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('handles corrupt persisted payload gracefully (does not throw)', () => {
    // write invalid JSON into storage
    localStorage.setItem(STORAGE_KEY, '<<not-json>>')

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // creating the store should not throw even with bad JSON
    const store = useCollectionStore()
    expect(store).toBeTruthy()

    // we should have logged an error during load
    expect(spy).toHaveBeenCalled()
  })

  it('importState returns false for invalid JSON and logs error', () => {
    const store = useCollectionStore()
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const ok = store.importState('this is not json')
    expect(ok).toBe(false)
    expect(spy).toHaveBeenCalled()
  })

  it('debounced save writes to localStorage after delay when not in test env', async () => {
    // ensure we run in a non-test environment so the watcher will debounce
    if (typeof process !== 'undefined' && process.env) process.env.NODE_ENV = 'development'

    // switch to fake timers to control the debounce
    vi.useFakeTimers()

    const store = useCollectionStore()

    // ensure storage is empty initially
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

  // make a change to overrides which triggers the watch
  store.setOverride('EdgeWeapon', { crafted: true })

  // Vue's watch runs in the reactive flush queue (microtask) — ensure it has a chance to run
  await Promise.resolve()

  // immediately, the debounced save should not have fired yet
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    // advance timers just less than the delay
    vi.advanceTimersByTime(199)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    // advance past the debounce delay (200ms) to flush the save
    vi.advanceTimersByTime(5)

    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).toBeTruthy()
    if (raw) {
      const parsed = JSON.parse(raw)
      expect(parsed.version).toBeDefined()
      expect(parsed.overrides['EdgeWeapon']).toBeDefined()
      expect(parsed.overrides['EdgeWeapon'].crafted).toBe(true)
    }
  })
})
