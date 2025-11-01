import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Weapons from '../pages/Weapons.vue'
import WeaponCard from '../components/WeaponCard.vue'
import { useCollectionStore } from '../stores/collection'
import { nextTick } from 'vue'

describe('Weapons page (virtualized)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders a windowed subset of WeaponCard components instead of all items', async () => {
    const store = useCollectionStore()
    // create a large weapons list
    const weapons = Array.from({ length: 200 }).map((_, i) => ({ name: `Weapon ${i}`, category: 'primary', type: 'standard' }))
    // assign into the store (Pinia unwraps refs for returned state)
  // @ts-expect-error - test helper assignment to pinia state
  store.weapons = weapons

    const wrapper = mount(Weapons)
    await nextTick()

  // only count WeaponCard components rendered inside the virtualized "All weapons" scroller
  const scroller = wrapper.find('.virtual-scroll')
  const cards = scroller.exists() ? scroller.findAllComponents(WeaponCard) : wrapper.findAllComponents(WeaponCard)
    // should render some cards
    expect(cards.length).toBeGreaterThan(0)
    // but not render all 200 at once thanks to virtualization
    expect(cards.length).toBeLessThan(weapons.length)
  })
})
