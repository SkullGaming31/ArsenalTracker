import { describe, it, expect } from 'vitest'
import type { Warframe } from '../types/warframe'
import type { Weapon } from '../types/weapon'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Dashboard from '../pages/Dashboard.vue'
import { useCollectionStore } from '../stores/collection'

describe('Dashboard', () => {
  it('renders totals for warframes and weapons', () => {
    setActivePinia(createPinia())
    const wrapper = mount(Dashboard, { global: { plugins: [createPinia()] } })

  // Use the collection store merged views to match component behavior (deduped)
  setActivePinia(createPinia())
  const collection = useCollectionStore()

  const totalWarframes = String(collection.mergedWarframes.length)
  const totalWarframesMastered = String((collection.mergedWarframes as unknown as Warframe[]).filter(w => Boolean(w.is_mastered)).length)

    // assert the rendered text contains the totals
    const text = wrapper.text()
    expect(text).toContain(totalWarframes)
    expect(text).toContain(totalWarframesMastered)

    // check weapon totals present (primary/secondary/melee)
  const totalPrimary = String((collection.mergedWeapons as unknown as Weapon[]).filter(w => w.category === 'primary').length)
  const totalSecondary = String((collection.mergedWeapons as unknown as Weapon[]).filter(w => w.category === 'secondary').length)
  const totalMelee = String((collection.mergedWeapons as unknown as Weapon[]).filter(w => w.category === 'melee').length)

    expect(text).toContain(totalPrimary)
    expect(text).toContain(totalSecondary)
    expect(text).toContain(totalMelee)
  })
})
