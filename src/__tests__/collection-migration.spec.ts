import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useCollectionStore, STORAGE_KEY } from '../stores/collection'

describe('collection store migration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('migrates legacy overrides object into versioned payload on load', () => {
    // simulate legacy persisted overrides (no version, direct map)
    const legacy = {
      'Excalibur Prime': { crafted: true },
      'Lato Prime': { parts: ['barrel'] }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy))

    const store = useCollectionStore()

    // the store loads on initialization; overrides should be populated
    expect(store.overrides['Excalibur Prime']).toBeDefined()
    expect(store.overrides['Excalibur Prime']!.crafted).toBe(true)

    // and localStorage should now contain the versioned payload
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).toBeTruthy()
    if (raw) {
      const parsed = JSON.parse(raw)
      expect(parsed.version).toBe(1)
      expect(parsed.overrides['Lato Prime']).toBeDefined()
    }
  })
})
