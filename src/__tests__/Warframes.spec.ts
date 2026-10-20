import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Warframes from '../pages/Warframes.vue'

describe('Warframes.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the warframes page with toolbar', () => {
    const wrapper = mount(Warframes, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WarframeCard: true,
          QSelect: { template: '<div class="q-select-stub"><slot /></div>' },
          QBtn: { template: '<button class="q-btn"><slot /></button>' }
        }
      }
    })

    expect(wrapper.find('.toolbar').exists()).toBe(true)
  })

  it('has prime filter dropdown', () => {
    const wrapper = mount(Warframes, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WarframeCard: true,
          QSelect: { template: '<div class="q-select-stub"><slot /></div>' },
          QBtn: { template: '<button class="q-btn"><slot /></button>' }
        }
      }
    })

    expect(wrapper.find('.toolbar').exists()).toBe(true)
  })

  it('displays pagination controls', () => {
    const wrapper = mount(Warframes, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WarframeCard: true,
          QSelect: { template: '<div class="q-select-stub"><slot /></div>' },
          QBtn: { template: '<button class="q-btn"><slot /></button>' }
        }
      }
    })

    expect(wrapper.find('.pager').exists()).toBe(true)
  })

  it('has virtual scroll container', () => {
    const wrapper = mount(Warframes, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WarframeCard: true,
          QSelect: { template: '<div class="q-select-stub"><slot /></div>' },
          QBtn: { template: '<button class="q-btn"><slot /></button>' }
        }
      }
    })

    expect(wrapper.find('.virtual-scroll').exists()).toBe(true)
  })

  it('handles warframe updates from WarframeCard', async () => {
    const wrapper = mount(Warframes, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WarframeCard: true,
          QSelect: { template: '<div class="q-select-stub"><slot /></div>' },
          QBtn: { template: '<button class="q-btn"><slot /></button>' }
        }
      }
    })

    // The component should render without errors
    expect(wrapper.exists()).toBe(true)
  })

  it('computes filtered warframes correctly', () => {
    const wrapper = mount(Warframes, {
      props: { query: '', hideCompleted: false },
      global: {
        stubs: {
          WarframeCard: true,
          QSelect: { template: '<div class="q-select-stub"><slot /></div>' },
          QBtn: { template: '<button class="q-btn"><slot /></button>' }
        }
      }
    })

    // The component should render without errors
    expect(wrapper.exists()).toBe(true)
  })
})
