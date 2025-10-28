import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCollectionStore } from '../stores/collection'

describe('collection merged views', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('mergedWeapons reflects setOverride for an existing weapon', () => {
    const store = useCollectionStore()
    // pick an existing weapon name from data
  const first = ((store as unknown) as { weapons: unknown[] }).weapons[0] as Record<string, unknown>
    expect(first).toBeTruthy()
    const name = first.name as string
    store.setOverride(name, { is_mastered: true })
  const merged = ((store as unknown) as { mergedWeapons: unknown[] }).mergedWeapons as Record<string, unknown>[]
  const found = merged.find(m => (m as Record<string, unknown>)['name'] === name) as Record<string, unknown> | undefined
    expect(found).toBeDefined()
    expect(found!['is_mastered']).toBe(true)
  })

  it('mergedWarframes reflects setOverride for an existing warframe', () => {
    const store = useCollectionStore()
  const first = ((store as unknown) as { warframes: unknown[] }).warframes[0] as Record<string, unknown>
    expect(first).toBeTruthy()
    const name = first.name as string
    store.setOverride(name, { is_mastered: true })
  const merged = ((store as unknown) as { mergedWarframes: unknown[] }).mergedWarframes as Record<string, unknown>[]
  const found = merged.find(m => (m as Record<string, unknown>)['name'] === name)
    expect(found).toBeDefined()
    expect(found!['is_mastered']).toBe(true)
  })
})
