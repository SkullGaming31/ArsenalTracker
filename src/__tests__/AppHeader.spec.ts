import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '../components/AppHeader.vue'

describe('AppHeader', () => {
  it('renders subtitle and controls when showControls=true', async () => {
    const wrapper = mount(AppHeader, {
      props: {
        query: 'test',
        hideCompleted: false,
        pageSubtitle: 'Sub text here',
        showControls: true,
      },
    })

    // subtitle present
    expect(wrapper.text()).toContain('Sub text here')

    // input value
    const input = wrapper.find('input.header-search')
    expect((input.element as HTMLInputElement).value).toBe('test')

    // typing emits update:query
    await input.setValue('new')
    expect(wrapper.emitted('update:query')).toBeTruthy()
    expect(wrapper.emitted('update:query')![0]).toEqual(['new'])

    // toggle emits update:hideCompleted
  const checkbox = wrapper.find('input[type="checkbox"]')
  await checkbox.setValue(true)
    expect(wrapper.emitted('update:hideCompleted')).toBeTruthy()
    expect(wrapper.emitted('update:hideCompleted')![0]).toEqual([true])
  })

  it('hides controls when showControls=false', () => {
    const wrapper = mount(AppHeader, {
      props: { showControls: false, pageSubtitle: 'X' },
    })
    expect(wrapper.find('.header-controls').exists()).toBe(false)
  })
})
