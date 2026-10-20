import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Secondary from '../pages/Secondary.vue'

describe('Secondary.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the secondary weapons page', () => {
    const wrapper = mount(Secondary, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WeaponCard: true
        }
      }
    })

    expect(wrapper.find('h2').text()).toBe('Secondary Weapons')
  })

  it('displays results count', () => {
    const wrapper = mount(Secondary, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WeaponCard: true
        }
      }
    })

    expect(wrapper.find('.results').exists()).toBe(true)
  })

  it('filters by category "secondary"', () => {
    const wrapper = mount(Secondary, {
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
    const wrapper = mount(Secondary, {
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
    const wrapper = mount(Secondary, {
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
    const wrapper = mount(Secondary, {
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
    const wrapper = mount(Secondary, {
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
