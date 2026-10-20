import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '../components/AppFooter.vue'

describe('AppFooter.vue', () => {
  it('renders the footer', () => {
    const wrapper = mount(AppFooter, {
      global: {
        stubs: {
          QFooter: true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('accepts centered prop', () => {
    const wrapper = mount(AppFooter, {
      props: { centered: true },
      global: {
        stubs: {
          QFooter: true
        }
      }
    })

    expect(wrapper.props('centered')).toBe(true)
  })

  it('has default centered prop as false', () => {
    const wrapper = mount(AppFooter, {
      global: {
        stubs: {
          QFooter: true
        }
      }
    })

    expect(wrapper.props('centered')).toBe(false)
  })
})
