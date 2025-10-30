import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCollectionStore } from '../stores/collection'

describe('collection store duplicates and import negative', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('merges duplicates in mergedWarframes when overrides exist', () => {
    const store = useCollectionStore()

    // provide duplicate warframe entries with the same name
    store.warframes = [
      { name: 'DupeFrame', type: 'prime', description: 'first' },
      { name: 'DupeFrame', type: 'prime', description: 'second' }
    ] as unknown as import('../types/warframe').Warframe[]

    // set an override for the duplicated name
    store.setOverride('DupeFrame', { crafted: true, neuroptics_collected: true })

    const merged = store.mergedWarframes
    expect(merged.length).toBeGreaterThan(0)
  const item = merged.find((i: unknown) => (i as Record<string, unknown>).name === 'DupeFrame') as Record<string, unknown>
    expect(item).toBeDefined()
    expect(item.crafted).toBe(true)
    expect(item.neuroptics_collected).toBe(true)
  })

  it('merges duplicates in mergedWeapons when overrides exist', () => {
    const store = useCollectionStore()

    store.weapons = [
      { name: 'DupeWeapon', type: 'primary' },
      { name: 'DupeWeapon', type: 'primary' }
    ] as unknown as import('../types/weapon').Weapon[]

    store.setOverride('DupeWeapon', { is_mastered: true })

    const merged = store.mergedWeapons
    expect(merged.length).toBeGreaterThan(0)
  const item = merged.find((i: unknown) => (i as Record<string, unknown>).name === 'DupeWeapon') as Record<string, unknown>
    expect(item).toBeDefined()
    expect(item.is_mastered).toBe(true)
  })

  it('importState returns false for versioned payload missing overrides', () => {
    const store = useCollectionStore()
    const payload = JSON.stringify({ version: 999 })
    const ok = store.importState(payload)
    expect(ok).toBe(false)
  })
})
