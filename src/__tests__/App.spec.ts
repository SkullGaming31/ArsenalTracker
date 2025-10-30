import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, it, expect } from 'vitest'
import App from '../App.vue'

describe('App.vue', () => {
  it('renders dashboard by default and toggles views via NavBar event', async () => {
    const wrapper = shallowMount(App)

    // Dashboard should be rendered initially
    expect(wrapper.findComponent({ name: 'Dashboard' }).exists()).toBe(true)

    // Simulate NavBar navigate -> warframes
    const nav = wrapper.findComponent({ name: 'NavBar' })
    expect(nav.exists()).toBe(true)
    await nav.vm.$emit('navigate', 'warframes')
    await nextTick()

    // Warframes component should be rendered
    expect(wrapper.findComponent({ name: 'Warframes' }).exists()).toBe(true)

    // AppHeader should receive showControls true and proper subtitle
    const header = wrapper.findComponent({ name: 'AppHeader' })
    expect(header.exists()).toBe(true)
    expect(header.props('showControls')).toBe(true)
    expect(header.props('pageSubtitle')).toBe('Track your collection progress across all warframes')
  })

  it('renders fallback when view is unknown', async () => {
    const wrapper = shallowMount(App)

    // Force an unknown view value (simulate unexpected state)
    // script-setup exposes view on the vm
    // @ts-expect-error - test harness modifying internal state
    wrapper.vm.view = 'unknown'
    await nextTick()

    expect(wrapper.find('.fallback').exists()).toBe(true)
    expect(wrapper.find('.fallback').text()).toContain('Nothing to display')
  })
})
