import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NavBar from '../components/NavBar.vue'

describe('NavBar', () => {
  it('renders navigation buttons and socials, emits navigate on click', async () => {
    const wrapper = mount(NavBar)

    // nav buttons
    const btnNames = ['nav-dashboard','nav-warframes','nav-weapons','nav-primary','nav-secondary','nav-melee']
    for (const id of btnNames) {
      const btn = wrapper.find(`button[data-testid="${id}"]`)
      expect(btn.exists()).toBe(true)
    }

    // socials
    const socials = wrapper.findAll('.nav-socials .icon-link')
    expect(socials.length).toBeGreaterThanOrEqual(3)

    // clicking a nav button emits navigate
    const dash = wrapper.find('button[data-testid="nav-dashboard"]')
    await dash.trigger('click')
    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')![0]).toEqual(['dashboard'])
  })
})
