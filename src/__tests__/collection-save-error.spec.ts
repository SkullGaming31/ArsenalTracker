import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCollectionStore } from '../stores/collection'

describe('collection store save error handling', () => {
  let origSetItem: typeof localStorage.setItem

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    origSetItem = localStorage.setItem
  })

  afterEach(() => {
    // restore
    localStorage.setItem = origSetItem
    vi.restoreAllMocks()
  })

  it('logs error when saveToStorage fails', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

  // prepare payload string BEFORE mocking JSON.stringify
  const payload = JSON.stringify({ version: 1, overrides: { ErrorKey: { crafted: true } } })
  // make JSON.stringify throw to exercise saveToStorage catch (stringify is easier to mock)
  const jsonSpy = vi.spyOn(JSON, 'stringify').mockImplementation(() => { throw new Error('boom') })

  const store = useCollectionStore()

  const ok = store.importState(payload)

  // saveToStorage should have attempted to stringify the payload and then logged the error
  expect(spy).toHaveBeenCalledExactlyOnceWith('[collection] failed to save persistence', expect.any(Error))
  // since saveToStorage swallows the error, importState will still return true
  expect(ok).toBe(true)
  jsonSpy.mockRestore()
  })
})
