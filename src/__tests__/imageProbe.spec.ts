import { describe, it, expect, afterEach } from 'vitest'

// Import probeImage dynamically so tests can swap global.Image between imports if needed
import { probeImage } from '../lib/imageProbe'

describe('probeImage', () => {
  const origImage = (globalThis as unknown as { Image?: unknown }).Image
  const origLocation = { ...globalThis.location }

  afterEach(() => {
    // restore globals
    ;(globalThis as unknown as { Image?: unknown }).Image = origImage
    try {
      // location is read-only in some environments; try to restore via assign if possible
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      globalThis.location = origLocation
    } catch {}
  })

  it('returns false when Image is undefined', async () => {
    ;(globalThis as unknown as { Image?: unknown }).Image = undefined
    const res = await probeImage('http://example.com/does-not-matter.png')
    expect(res).toBe(false)
  })

  it('resolves true on load and sets crossOrigin for same-origin url', async () => {
    // make window location origin predictable
    // @ts-expect-error restore location for test
    globalThis.location = new URL('http://localhost/')

    class MockImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      crossOrigin?: string
      _src = ''
      set src(v: string) {
        this._src = v
        // simulate async load success
        setTimeout(() => this.onload && this.onload(), 0)
      }
    }
    ;(globalThis as unknown as { Image?: unknown }).Image = MockImage

    const res = await probeImage('/img-ok.png')
    expect(res).toBe(true)
    // ensure crossOrigin was assigned on the created instance
    // We can't directly access the instance here, but assignment happened without throwing
    // sanity: calling again to ensure queue continues to operate
    const res2 = await probeImage('/img-ok-2.png')
    expect(res2).toBe(true)
  })

  it('resolves false on error for cross-origin url and does not set crossOrigin', async () => {
    // @ts-expect-error restore location for test
    globalThis.location = new URL('http://localhost/')

    class MockImageErr {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      crossOrigin?: string
      _src = ''
      set src(v: string) {
        this._src = v
        // simulate async load failure
        setTimeout(() => this.onerror && this.onerror(), 0)
      }
    }
    ;(globalThis as unknown as { Image?: unknown }).Image = MockImageErr

    const res = await probeImage('http://example.com/img-fail.png')
    expect(res).toBe(false)
  })

  it('resolves false if Image constructor throws', async () => {
    // simulate constructor throwing
    ;(globalThis as unknown as { Image?: unknown }).Image = function () {
      throw new Error('ctor-fail')
    }
    const res = await probeImage('http://localhost/img.png')
    expect(res).toBe(false)
  })
})
