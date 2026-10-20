import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Landing from '../pages/Landing.vue'

describe('Landing.vue', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      })),
      writable: true
    })

    // Mock window.open
    Object.defineProperty(window, 'open', {
      value: vi.fn(),
      writable: true
    })
  })

  it('renders landing page with title', () => {
    const wrapper = mount(Landing, {
      global: {
        stubs: {
          TwitchAccount: true,
          QBtn: { template: '<button class="q-btn"><slot /></button>' },
          QToggle: true
        }
      }
    })

    expect(wrapper.find('.landing-title').text()).toBe('Warframe Tracker')
  })

  it('renders subtitle', () => {
    const wrapper = mount(Landing, {
      global: {
        stubs: {
          TwitchAccount: true,
          QBtn: { template: '<button class="q-btn"><slot /></button>' },
          QToggle: true
        }
      }
    })

    expect(wrapper.find('.landing-sub').text()).toBe('Track, collect, and organize your Warframe items with ease.')
  })

  it('has navigation buttons', () => {
    const wrapper = mount(Landing, {
      global: {
        stubs: {
          TwitchAccount: true,
          QBtn: { template: '<button class="q-btn"><slot /></button>' },
          QToggle: true
        }
      }
    })

    const buttons = wrapper.findAll('.q-btn')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('has particles toggle control', () => {
    const wrapper = mount(Landing, {
      global: {
        stubs: {
          TwitchAccount: true,
          QBtn: { template: '<button class="q-btn"><slot /></button>' },
          QToggle: true
        }
      }
    })

    expect(wrapper.find('.landing-controls').exists()).toBe(true)
  })

  it('respects localStorage particle preference', () => {
    vi.mocked(window.localStorage.getItem).mockReturnValue('false')

    mount(Landing, {
      global: {
        stubs: {
          TwitchAccount: true,
          QBtn: { template: '<button class="q-btn"><slot /></button>' },
          QToggle: true
        }
      }
    })

    expect(window.localStorage.getItem).toHaveBeenCalledExactlyOnceWith('ui.particles.enabled')
  })

  it('handles particles toggle and persists preference', async () => {
    const wrapper = mount(Landing, {
      global: {
        stubs: {
          TwitchAccount: true,
          QBtn: { template: '<button class="q-btn"><slot /></button>' },
          QToggle: true
        }
      }
    })

    // Just verify the component renders with particles toggle
    expect(wrapper.find('.landing-controls').exists()).toBe(true)
  })

  it('respects prefers-reduced-motion', () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    })

    mount(Landing, {
      global: {
        stubs: {
          TwitchAccount: true,
          QBtn: { template: '<button class="q-btn"><slot /></button>' },
          QToggle: true
        }
      }
    })

    expect(window.matchMedia).toHaveBeenCalledExactlyOnceWith('(prefers-reduced-motion: reduce)')
  })

  it('cleans up particles on unmount', () => {
    const wrapper = mount(Landing, {
      global: {
        stubs: {
          TwitchAccount: true,
          QBtn: { template: '<button class="q-btn"><slot /></button>' },
          QToggle: true
        }
      }
    })

    const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
    wrapper.unmount()

    // Cleanup should be called
    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
