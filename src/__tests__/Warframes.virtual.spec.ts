import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Warframes from '../pages/Warframes.vue'
import WarframeCard from '../components/WarframeCard.vue'
import { useCollectionStore } from '../stores/collection'
import { nextTick } from 'vue'

describe('Warframes page (virtualized)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders a windowed subset of WarframeCard components instead of all items', async () => {
    const store = useCollectionStore()
    // create a large warframes list
    const warframes = Array.from({ length: 120 }).map((_, i) => ({ name: `Frame ${i}`, type: 'prime' }))
    // @ts-expect-error assign test data into store
    store.warframes = warframes

    const wrapper = mount(Warframes)
    await nextTick()

    const cards = wrapper.findAllComponents(WarframeCard)
    expect(cards.length).toBeGreaterThan(0)
    expect(cards.length).toBeLessThan(warframes.length)
  })
})
