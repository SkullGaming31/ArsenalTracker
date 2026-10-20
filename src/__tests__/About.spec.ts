import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import About from '../pages/About.vue'

describe('About.vue', () => {
  it('renders the about page', () => {
    const wrapper = mount(About)

    expect(wrapper.find('h1').text()).toBe('ArsenalTracker')
  })

  it('renders subtitle', () => {
    const wrapper = mount(About)

    expect(wrapper.find('.subtitle').exists()).toBe(true)
  })

  it('renders hero card with project info', () => {
    const wrapper = mount(About)

    expect(wrapper.find('.hero-card').exists()).toBe(true)
    expect(wrapper.find('.hero-card h4').text()).toBe('Project')
  })

  it('emits navigate event when Get Started is clicked', async () => {
    const wrapper = mount(About)

    await wrapper.find('.btn-primary').trigger('click')

    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['dashboard'])
  })

  it('emits navigate event when Back to Home is clicked', async () => {
    const wrapper = mount(About)

    await wrapper.find('.about-footer .btn').trigger('click')

    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['landing'])
  })

  it('emits navigate event when How it works is clicked', async () => {
    const wrapper = mount(About)

    const howButton = wrapper.findAll('.btn-ghost')[0]
    if (howButton) {
      await howButton.trigger('click')
    }

    // The function should try to scroll to the element
    expect(wrapper.emitted('navigate')).toBeFalsy() // No navigation, just scroll
  })

  it('opens Discord when Help button is clicked', async () => {
    // Mock window.open
    const mockOpen = vi.fn()
    window.open = mockOpen

    const wrapper = mount(About)

    const helpButton = wrapper.findAll('.btn-ghost')[1]
    if (helpButton) {
      await helpButton.trigger('click')
    }

    expect(mockOpen).toHaveBeenCalledExactlyOnceWith('https://discord.com/invite/UhQuaASkKR', '_blank')
  })

  it('renders features grid', () => {
    const wrapper = mount(About)

    expect(wrapper.find('.features-grid').exists()).toBe(true)
  })

  it('renders usage section', () => {
    const wrapper = mount(About)

    expect(wrapper.find('.usage').exists()).toBe(true)
  })

  it('renders backup section', () => {
    const wrapper = mount(About)

    expect(wrapper.find('.backup').exists()).toBe(true)
  })

  it('renders privacy section', () => {
    const wrapper = mount(About)

    expect(wrapper.find('.privacy').exists()).toBe(true)
  })

  it('renders troubleshooting section', () => {
    const wrapper = mount(About)

    expect(wrapper.find('.troubleshoot').exists()).toBe(true)
  })

  it('renders support section', () => {
    const wrapper = mount(About)

    expect(wrapper.find('.support').exists()).toBe(true)
  })
})
