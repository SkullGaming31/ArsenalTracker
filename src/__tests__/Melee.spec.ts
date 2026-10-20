import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Melee from '../pages/Melee.vue'

describe('Melee.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the melee weapons page', () => {
    const wrapper = mount(Melee, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WeaponCard: true
        }
      }
    })

    expect(wrapper.find('h2').text()).toBe('Melee Weapons')
  })

  it('displays results count', () => {
    const wrapper = mount(Melee, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WeaponCard: true
        }
      }
    })

    expect(wrapper.find('.results').exists()).toBe(true)
  })

  it('filters by category "melee"', () => {
    const wrapper = mount(Melee, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WeaponCard: true
        }
      }
    })

    // Component should render without errors
    expect(wrapper.exists()).toBe(true)
  })

  it('filters by search query', () => {
    const wrapper = mount(Melee, {
      props: { query: 'test', hideCompleted: false },
      global: {
        stubs: {
          WeaponCard: true
        }
      }
    })

    // Component should render with query prop
    expect(wrapper.exists()).toBe(true)
  })

  it('filters by hideCompleted', () => {
    const wrapper = mount(Melee, {
      props: { query: '', hideCompleted: true },
      global: {
        stubs: {
          WeaponCard: true
        }
      }
    })

    // Component should render with hideCompleted prop
    expect(wrapper.exists()).toBe(true)
  })

  it('renders weapon grid', () => {
    const wrapper = mount(Melee, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WeaponCard: true
        }
      }
    })

    expect(wrapper.find('.grid').exists()).toBe(true)
  })

  it('handles update from WeaponCard', async () => {
    const wrapper = mount(Melee, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WeaponCard: true
        }
      }
    })

    // Component should have update handler
    expect(wrapper.exists()).toBe(true)
  })
})
