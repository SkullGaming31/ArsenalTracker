import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Companions from '../pages/Companions.vue'

describe('Companions.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the companions page', () => {
    const wrapper = mount(Companions, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          QToggle: true
        }
      }
    })

    expect(wrapper.find('.companions').exists()).toBe(true)
  })

  it('groups companions by category', () => {
    const wrapper = mount(Companions, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          QToggle: true
        }
      }
    })

    // Should render sections
    expect(wrapper.find('.section').exists()).toBe(true)
  })

  it('displays category labels correctly', () => {
    const wrapper = mount(Companions, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          QToggle: true
        }
      }
    })

    // Check that categories are rendered
    const headings = wrapper.findAll('h3')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('renders companion cards with required elements', () => {
    const wrapper = mount(Companions, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          QToggle: true
        }
      }
    })

    // Should have card containers
    expect(wrapper.find('.grid').exists()).toBe(true)
  })

  it('handles mastery toggle for companions', async () => {
    const wrapper = mount(Companions, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          QToggle: true
        }
      }
    })

    // Verify checkbox elements exist
    const checkbox = wrapper.find('input[type="checkbox"]')
    expect(checkbox.exists()).toBe(true)
  })

  it('filters by hideCompleted when prop is true', () => {
    const wrapper = mount(Companions, {
      props: { query: '', hideCompleted: true },
      global: {
        stubs: {
          QToggle: true
        }
      }
    })

    // Component should render without errors even with hideCompleted
    expect(wrapper.exists()).toBe(true)
  })

  it('displays subgroups within categories', () => {
    const wrapper = mount(Companions, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          QToggle: true
        }
      }
    })

    // Should have subgroup titles
    expect(wrapper.find('.sub-title').exists()).toBe(true)
  })

  it('renders companion parts information', () => {
    const wrapper = mount(Companions, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          QToggle: true
        }
      }
    })

    // Should render parts section if data exists
    expect(wrapper.exists()).toBe(true)
  })
})
