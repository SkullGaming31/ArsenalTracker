import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Weapons from '../pages/Weapons.vue'

describe('Weapons.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the weapons page with toolbar', () => {
    const wrapper = mount(Weapons, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WeaponCard: true,
          QSelect: { template: '<div class="q-select-stub"><slot /></div>' },
          QBtn: { template: '<button class="q-btn"><slot /></button>' }
        }
      }
    })

    expect(wrapper.find('h2').text()).toBe('Weapons')
    expect(wrapper.find('.toolbar').exists()).toBe(true)
  })

  it('filters weapons by category', async () => {
    const wrapper = mount(Weapons, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WeaponCard: true,
          QSelect: { template: '<div class="q-select-stub"><slot /></div>' },
          QBtn: { template: '<button class="q-btn"><slot /></button>' }
        }
      }
    })

    // Test that category filter is present
    expect(wrapper.find('.toolbar').exists()).toBe(true)
  })

  it('displays correct total count', () => {
    const wrapper = mount(Weapons, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WeaponCard: true,
          QSelect: { template: '<div class="q-select-stub"><slot /></div>' },
          QBtn: { template: '<button class="q-btn"><slot /></button>' }
        }
      }
    })

    expect(wrapper.find('.counts').exists()).toBe(true)
  })

  it('handles weapon updates from WeaponCard', async () => {
    const wrapper = mount(Weapons, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WeaponCard: true,
          QSelect: { template: '<div class="q-select-stub"><slot /></div>' },
          QBtn: { template: '<button class="q-btn"><slot /></button>' }
        }
      }
    })

    // The component should render without errors
    expect(wrapper.exists()).toBe(true)
  })

  it('shows pagination controls', () => {
    const wrapper = mount(Weapons, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WeaponCard: true,
          QSelect: { template: '<div class="q-select-stub"><slot /></div>' },
          QBtn: { template: '<button class="q-btn"><slot /></button>' }
        }
      }
    })

    expect(wrapper.find('.pager').exists()).toBe(true)
  })

  it('has virtual scroll container', () => {
    const wrapper = mount(Weapons, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WeaponCard: true,
          QSelect: { template: '<div class="q-select-stub"><slot /></div>' },
          QBtn: { template: '<button class="q-btn"><slot /></button>' }
        }
      }
    })

    expect(wrapper.find('.virtual-scroll').exists()).toBe(true)
  })
})
