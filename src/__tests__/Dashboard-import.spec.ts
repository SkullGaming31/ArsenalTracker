import { beforeEach, describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Dashboard from '../pages/Dashboard.vue'
import * as importer from '../lib/importer'
import { useCollectionStore } from '../stores/collection'

describe('Dashboard import/export interactions', () => {
  let pinia: ReturnType<typeof createPinia>
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    wrapper = mount(Dashboard, { global: { plugins: [pinia] } })
    // ensure real FileReader behavior can be mocked safely
    // clear spies
    vi.restoreAllMocks()
  })

  it('handles versioned import and shows success alert', async () => {
    const collection = useCollectionStore()
    const parsed = { type: 'versioned', payload: { version: 1, overrides: { 'X': { crafted: true } } } }

    // mock parseImportFile to return versioned payload
    const parseSpy = vi.spyOn(importer, 'parseImportFile').mockReturnValue(parsed as unknown as ReturnType<typeof importer.parseImportFile>)

    // mock FileReader to immediately call onload with the file text
    const origRead = (FileReader.prototype as unknown as { readAsText?: (b?: Blob) => void }).readAsText
    ;(FileReader.prototype as unknown as { readAsText?: (b?: Blob) => void }).readAsText = function (this: FileReader, _b?: Blob) {
      const ev = { target: { result: 'ok' } } as unknown as ProgressEvent<FileReader>
      if (this.onload) this.onload(ev)
    }

    const importSpy = vi.spyOn(collection, 'importState').mockReturnValue(true)
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    const input = wrapper.find('input[type="file"]')
    // create a fake file and set input.files
    const file = new File(['{}'], 'test.json', { type: 'application/json' })
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')

  expect(parseSpy).toHaveBeenCalledExactlyOnceWith(expect.any(String))
  expect(importSpy).toHaveBeenCalledExactlyOnceWith(JSON.stringify(parsed.payload))
    expect(alertSpy).toHaveBeenCalledExactlyOnceWith('Import successful')

    // restore FileReader
  ;(FileReader.prototype as unknown as { readAsText?: (b?: Blob) => void }).readAsText = origRead
  })

  it('shows CSV preview and applies overrides on confirm', async () => {
    const collection = useCollectionStore()
    const parsed = { type: 'csv', rows: [{ Name: 'Excalibur', Neuroptics: '1' }] }
    vi.spyOn(importer, 'parseImportFile').mockReturnValue(parsed as unknown as ReturnType<typeof importer.parseImportFile>)
    vi.spyOn(importer, 'mapRowsToOverrides').mockReturnValue({ 'Excalibur': { neuroptics_collected: true } } as unknown as ReturnType<typeof importer.mapRowsToOverrides>)

    // mock FileReader
    const origRead = (FileReader.prototype as unknown as { readAsText?: (b?: Blob) => void }).readAsText
    ;(FileReader.prototype as unknown as { readAsText?: (b?: Blob) => void }).readAsText = function (this: FileReader, _b?: Blob) {
      const ev = { target: { result: 'csv' } } as unknown as ProgressEvent<FileReader>
      if (this.onload) this.onload(ev)
    }

    const input = wrapper.find('input[type="file"]')
    const file = new File(['a,b'], 'test.csv', { type: 'text/csv' })
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')

    // wait for DOM update
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toContain('Import preview')

    const setSpy = vi.spyOn(collection, 'setOverride')
  const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    // find Confirm Import button (text match)
    const buttons = wrapper.findAll('button.tag')
    const confirm = buttons.find(b => b.text().includes('Confirm Import'))
    expect(confirm).toBeTruthy()
    await confirm!.trigger('click')

  expect(setSpy).toHaveBeenCalledExactlyOnceWith('Excalibur', { neuroptics_collected: true })
    expect(alertSpy).toHaveBeenCalledExactlyOnceWith('Import applied')

  ;(FileReader.prototype as unknown as { readAsText?: (b?: Blob) => void }).readAsText = origRead
  })

  it('clears overrides when user confirms', async () => {
    const collection = useCollectionStore()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const clearSpy = vi.spyOn(collection, 'clearOverrides').mockImplementation(() => {})
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    const clearBtn = wrapper.findAll('button.tag').find(b => b.text().includes('Clear Local Overrides'))
    expect(clearBtn).toBeTruthy()
    await clearBtn!.trigger('click')

  expect(confirmSpy).toHaveBeenCalledExactlyOnceWith('Clear all local overrides? This cannot be undone.')
  expect(clearSpy).toHaveBeenCalledExactlyOnceWith()
    expect(alertSpy).toHaveBeenCalledExactlyOnceWith('Local overrides cleared')
  })
})
