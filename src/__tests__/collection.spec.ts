import { setActivePinia, createPinia } from 'pinia'
import { useCollectionStore } from '../stores/collection'
import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'

describe('collection store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // clear localStorage
    localStorage.clear()
  })

  it('exports and imports state', () => {
    const store = useCollectionStore()
    // set an override
    store.setOverride('Excalibur', { is_mastered: true })
    const exported = store.exportState()
    expect(typeof exported).toBe('string')
    const store2 = useCollectionStore()
    // import into new store instance
    const ok = store2.importState(exported)
    expect(ok).toBe(true)
    expect(store2.overrides['Excalibur']?.is_mastered).toBe(true)
  })

  it('persists to localStorage on change and loads on init', async () => {
    const store = useCollectionStore()
    store.setOverride('Frost', { is_crafted: true })
    // wait for watcher to flush
    await nextTick()
    // localStorage should have the key
    const raw = localStorage.getItem('arsenaltracker.v1')
    expect(raw).toBeTruthy()
    // simulate new session
    const store2 = useCollectionStore()
    expect(store2.overrides['Frost']?.is_crafted).toBe(true)
  })
})
