import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('mounts renders properly', () => {
    const wrapper = mount(App)
    // App now renders the dashboard; assert a current dashboard string
    expect(wrapper.text()).toContain('Arsenal Overview')
  })
})
