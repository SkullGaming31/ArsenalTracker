import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import TwitchAccount from '../components/TwitchAccount.vue'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('TwitchAccount', () => {
  it('shows the signed-in user and signs out', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          configured: true,
          user: { id: '123', login: 'arsenal_user', displayName: 'arsenal_user' },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(TwitchAccount)
    await flushPromises()

    expect(wrapper.text()).toContain('arsenal_user')
    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenLastCalledWith('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
    })
    expect(wrapper.text()).toContain('Login with Twitch')
  })
})