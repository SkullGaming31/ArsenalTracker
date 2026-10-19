import { describe, it, expect, vi, afterEach } from 'vitest'
import type { Warframe } from '../types/warframe'
import type { Weapon } from '../types/weapon'
import { flushPromises, mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Dashboard from '../pages/Dashboard.vue'
import { useCollectionStore } from '../stores/collection'

describe('Dashboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders totals for warframes and weapons', () => {
    setActivePinia(createPinia())
    const wrapper = mount(Dashboard, { global: { plugins: [createPinia()] } })

    // Use the collection store merged views to match component behavior (deduped)
    setActivePinia(createPinia())
    const collection = useCollectionStore()

    const totalWarframes = String(collection.mergedWarframes.length)
    const totalWarframesMastered = String((collection.mergedWarframes as unknown as Warframe[]).filter(w => Boolean(w.is_mastered)).length)

    // assert the rendered text contains the totals
    const text = wrapper.text()
    expect(text).toContain(totalWarframes)
    expect(text).toContain(totalWarframesMastered)

    // check weapon totals present (primary/secondary/melee)
    const hasCategory = (w: Weapon, cat: string) => {
      const c = (w as unknown as { category?: string | string[] }).category
      if (Array.isArray(c)) return c.includes(cat)
      return String(c || '') === cat
    }

    const totalPrimary = String((collection.mergedWeapons as unknown as Weapon[]).filter(w => hasCategory(w, 'primary')).length)
    const totalSecondary = String((collection.mergedWeapons as unknown as Weapon[]).filter(w => hasCategory(w, 'secondary')).length)
    const totalMelee = String((collection.mergedWeapons as unknown as Weapon[]).filter(w => hasCategory(w, 'melee')).length)

    expect(text).toContain(totalPrimary)
    expect(text).toContain(totalSecondary)
    expect(text).toContain(totalMelee)
  })

  it('syncs all collection categories for the signed-in Twitch account', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ configured: true, user: { id: '123', login: 'tenno', displayName: 'Tenno' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, syncedAt: '2026-10-19T00:00:00.000Z' }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(Dashboard, { global: { plugins: [pinia] } })
    await flushPromises()

    const syncButton = wrapper.findAll('button').find(button => button.text() === 'Sync now')
    expect(syncButton?.attributes('disabled')).toBeUndefined()
    await syncButton?.trigger('click')
    await flushPromises()

    const [url, options] = fetchMock.mock.calls[1] as [string, RequestInit]
    const payload = JSON.parse(String(options.body)) as {
      version: number
      collections: {
        warframes: unknown[]
        weapons: unknown[]
        companions: unknown[]
      }
    }
    expect(url).toBe('/api/collection/sync')
    expect(payload.version).toBe(1)
    expect(payload.collections.warframes.length).toBeGreaterThan(0)
    expect(payload.collections.weapons.length).toBeGreaterThan(0)
    expect(payload.collections.companions.length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('Collection synced at')
  })
})
