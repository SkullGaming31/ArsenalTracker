import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Dashboard from '../pages/Dashboard.vue'
import warframes from '../data/warframes.json'
import weapons from '../data/weapons.json'

describe('Dashboard', () => {
  it('renders totals for warframes and weapons', () => {
    setActivePinia(createPinia())
    const wrapper = mount(Dashboard, { global: { plugins: [createPinia()] } })

    const wf = (warframes as any[])
    const wp = (weapons as any[])

    const totalWarframes = String(wf.length)
    const totalWarframesMastered = String(wf.filter(w => w.is_mastered).length)

    // assert the rendered text contains the totals
    const text = wrapper.text()
    expect(text).toContain(totalWarframes)
    expect(text).toContain(totalWarframesMastered)

    // check weapon totals present (primary/secondary/melee)
    const totalPrimary = String(wp.filter(w => w.category === 'primary').length)
    const totalSecondary = String(wp.filter(w => w.category === 'secondary').length)
    const totalMelee = String(wp.filter(w => w.category === 'melee').length)

    expect(text).toContain(totalPrimary)
    expect(text).toContain(totalSecondary)
    expect(text).toContain(totalMelee)
  })
})
