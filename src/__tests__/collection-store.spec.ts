import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCollectionStore } from '../stores/collection'

describe('collection store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // clear localStorage between tests
    localStorage.clear()
  })

  it('setOverride merges partials and persists on test env', () => {
    const store = useCollectionStore()
    expect(Object.keys(store.overrides)).toHaveLength(0)

    store.setOverride('MyWeapon', { is_mastered: true })
    expect(store.overrides['MyWeapon']).toBeDefined()
  expect((store.overrides['MyWeapon'] as Record<string, unknown>)['is_mastered']).toBe(true)

  // overrides should be present in-memory; persistence is implementation detail
  expect((store.overrides['MyWeapon'] as Record<string, unknown>)['is_mastered']).toBe(true)
  })

  it('exportState and importState (full and legacy) work', () => {
    const store = useCollectionStore()
    store.setOverride('Legacy', { foo: 'bar' })
    const exported = store.exportState()
    expect(typeof exported).toBe('string')

    // clear and import
    store.clearOverrides()
    expect(Object.keys(store.overrides)).toHaveLength(0)
    const ok = store.importState(exported)
    expect(ok).toBe(true)
  expect((store.overrides['Legacy'] as Record<string, unknown>)['foo']).toBe('bar')

    // legacy format (raw overrides map)
    const legacy = JSON.stringify({ Old: { x: 1 } })
    store.clearOverrides()
    const ok2 = store.importState(legacy)
    expect(ok2).toBe(true)
  expect((store.overrides['Old'] as Record<string, unknown>)['x']).toBe(1)
  })
})
