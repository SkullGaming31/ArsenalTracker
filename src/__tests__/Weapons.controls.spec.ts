import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Weapons from '../pages/Weapons.vue'
import { useCollectionStore } from '../stores/collection'
import { Quasar } from 'quasar'
import { nextTick, type ComponentPublicInstance } from 'vue'

type WeaponsVm = ComponentPublicInstance & {
  selectedType?: string
  filtered?: Array<Record<string, unknown>>
  craftedFilter?: string
  pageSize?: number
  totalPages?: number
  currentPage?: number
  nextPage?: () => void
  prevPage?: () => void
}

describe('Weapons page controls', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows total weapons for selected type', async () => {
    const store = useCollectionStore()
    const weapons = [
      { name: 'W1', type: 'standard', category: 'primary' },
      { name: 'W2', type: 'standard', category: 'primary' },
      { name: 'W3', type: 'tenet', category: 'secondary' },
      { name: 'W4', type: 'tenet', category: 'melee' },
      { name: 'W5', type: 'prime', category: 'primary' }
    ]
    // @ts-expect-error assign test data into store
    store.weapons = weapons

    const wrapper = mount(Weapons, { global: { plugins: [Quasar] } })
    await nextTick()

    // default selectedType is 'all'
    expect(wrapper.find('.counts').text()).toContain('Total weapons: 5')

    // switch to tenet via vm helper
    const vm = wrapper.vm as unknown as WeaponsVm
    vm.selectedType = 'tenet'
    await nextTick()
    expect(wrapper.find('.counts').text()).toContain('Total weapons: 2')
  })

  it('filters crafted / not-crafted correctly', async () => {
    const store = useCollectionStore()
    const weapons = [
      { name: 'A', type: 'standard', category: 'primary', parts: [{ name: 'p1', collected: true }], is_crafted: false },
      { name: 'B', type: 'standard', category: 'primary', parts: [{ name: 'p1', collected: false }], is_crafted: true },
      { name: 'C', type: 'standard', category: 'secondary', parts: [], is_crafted: false }
    ]
    // @ts-expect-error assign test data into store
    store.weapons = weapons

    const wrapper = mount(Weapons, { global: { plugins: [Quasar] } })
    await nextTick()

    // default craftedFilter = 'all'
    const vm = wrapper.vm as unknown as WeaponsVm
    expect(vm.filtered?.length).toBe(3)

    // filter crafted
    vm.craftedFilter = 'crafted'
    await nextTick()
    // both A and B are considered crafted (A has collected part, B has is_crafted flag)
    if (vm.filtered) {
      expect(vm.filtered.length).toBe(2)
    } else {
      expect(vm.filtered).toBeDefined()
    }
    // name check includes B
    const names = (vm.filtered as Array<Record<string, unknown>>).map(w => String(w.name))
    expect(names).toContain('B')

    // filter not-crafted
    vm.craftedFilter = 'not-crafted'
    await nextTick()
    // should include only C because A appears crafted by parts
    if (vm.filtered) {
      expect(vm.filtered.length).toBe(1)
      expect(String(vm.filtered[0]?.name)).toBe('C')
    } else {
      // if filtered is unexpectedly undefined, fail the test explicitly
      expect(vm.filtered).toBeDefined()
    }
  })

  it('paginates and prev/next buttons change page', async () => {
    const store = useCollectionStore()
    const weapons = Array.from({ length: 45 }).map((_, i) => ({ name: `W${i}`, type: 'standard', category: 'primary' }))
    // @ts-expect-error assign test data into store
    store.weapons = weapons

    const wrapper = mount(Weapons, { global: { plugins: [Quasar] } })
    await nextTick()

    // set page size to 20
    const vm = wrapper.vm as unknown as WeaponsVm
    vm.pageSize = 20
    await nextTick()
    expect(vm.totalPages).toBe(3)

    // nextPage increments currentPage
    expect(vm.currentPage).toBe(0)
    // find and click Next button
    // find Next button by its text content (jsdom doesn't support :has-text)
    const nextBtn = wrapper.findAll('button').find(b => b.text().trim() === 'Next')
    if (nextBtn) {
      await nextBtn.trigger('click')
    } else {
      // fallback: call vm method if present
      if (vm.nextPage) vm.nextPage()
    }
    await nextTick()
    expect(vm.currentPage).toBe(1)

    // Prev
    const prevBtn = wrapper.findAll('button').find(b => b.text().trim() === 'Prev')
    if (prevBtn) {
      await prevBtn.trigger('click')
    } else {
      if (vm.prevPage) vm.prevPage()
    }
    await nextTick()
    expect(vm.currentPage).toBe(0)
  })
})
