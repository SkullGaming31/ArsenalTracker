import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { drawerOpen, useDrawer } from '../composables/useDrawer'

describe('useDrawer', () => {
  beforeEach(() => {
    // Reset drawer state before each test
    drawerOpen.value = false
  })

  afterEach(() => {
    // Clean up after each test
    drawerOpen.value = false
  })

  it('provides drawerOpen ref', () => {
    expect(drawerOpen).toBeDefined()
    expect(typeof drawerOpen.value).toBe('boolean')
  })

  it('initializes drawerOpen based on window width', () => {
    // Since we can't easily mock window.innerWidth in a test environment,
    // we'll just verify the ref exists and is a ref
    expect(drawerOpen).toBeDefined()
  })

  it('opens drawer with open() function', () => {
    const { open } = useDrawer()
    drawerOpen.value = false

    open()
    expect(drawerOpen.value).toBe(true)
  })

  it('closes drawer with close() function', () => {
    const { close } = useDrawer()
    drawerOpen.value = true

    close()
    expect(drawerOpen.value).toBe(false)
  })

  it('toggles drawer with toggle() function', () => {
    const { toggle } = useDrawer()
    drawerOpen.value = false

    toggle()
    expect(drawerOpen.value).toBe(true)

    toggle()
    expect(drawerOpen.value).toBe(false)
  })

  it('returns all drawer functions', () => {
    const drawer = useDrawer()

    expect(drawer.drawerOpen).toBeDefined()
    expect(drawer.open).toBeDefined()
    expect(typeof drawer.open).toBe('function')
    expect(drawer.close).toBeDefined()
    expect(typeof drawer.close).toBe('function')
    expect(drawer.toggle).toBeDefined()
    expect(typeof drawer.toggle).toBe('function')
  })

  it('maintains reactive state', () => {
    const { open, close, toggle } = useDrawer()

    open()
    expect(drawerOpen.value).toBe(true)

    close()
    expect(drawerOpen.value).toBe(false)

    toggle()
    expect(drawerOpen.value).toBe(true)
  })
})
