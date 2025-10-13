import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WarframeCard from '../components/WarframeCard.vue'

const sample = {
  name: 'TestFrame',
  type: 'prime',
  neuroptics_collected: false,
  chassis_collected: false,
  systems_collected: false,
  blueprint_collected: false,
  is_mastered: false,
  neuroptics_resources: [],
  chassis_resources: [],
  systems_resources: [],
  blueprint_resources: [],
}

describe('WarframeCard', () => {
  it('renders name and type', () => {
    const wrapper = mount(WarframeCard, { props: { warframe: sample } })
    expect(wrapper.text()).toContain('TestFrame')
    expect(wrapper.text()).toContain('prime')
  })
})
