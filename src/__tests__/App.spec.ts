import { describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('mounts renders properly', () => {
    setActivePinia(createPinia())
    const wrapper = mount(App, { global: { plugins: [createPinia()] } })
    // App now renders the dashboard; assert a current dashboard string
    expect(wrapper.text()).toContain('Arsenal Overview')
  })
})
