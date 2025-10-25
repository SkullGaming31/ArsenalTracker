import { test, expect } from '@playwright/test'

test('export import roundtrip via localStorage', async ({ page }) => {
  // use a known warframe name to avoid flakiness in headless tests
  const firstName = 'Rhino Prime'
  // load the app root and navigate using the in-app nav (this app doesn't use a router)
  await page.goto('/')
  // wait for nav and click Warframes
  await page.waitForSelector('[data-testid="nav-warframes"]', { timeout: 60000 })
  await page.click('[data-testid="nav-warframes"]')
  // allow extra time for the page to render Warframe cards
  await page.waitForSelector('.title h3', { timeout: 60000 })

  // create a versioned payload marking neuroptics for the first warframe
  const payload: { version: number; overrides: Record<string, { neuroptics_collected?: boolean }> } = {
    version: 1,
    overrides: {} as Record<string, { neuroptics_collected?: boolean }>
  }
  payload.overrides[firstName!.trim()] = { neuroptics_collected: true }

  // write payload to localStorage before the app loads so it will be read on initialization
  await page.context().addInitScript((p) => {
    try { localStorage.setItem('arsenaltracker.v1', JSON.stringify(p)) } catch { }
  }, payload)
  await page.goto('/')

  // navigate back to Warframes via the UI and verify the first warframe card shows Neuroptics: true
  await page.waitForSelector('[data-testid="nav-warframes"]', { timeout: 60000 })
  await page.click('[data-testid="nav-warframes"]')
  await page.waitForSelector(`[data-testid="card-${firstName.replace(/\s+/g,'-').toLowerCase()}"]`, { timeout: 60000 })
  // ensure the first card's neuroptics checkbox is checked
  await page.waitForFunction((testId) => {
    const c = document.querySelector(`[data-testid="${testId}"]`)
    if (!c) return false
    const cb = c.querySelector('input[type="checkbox"]')
    return !!(cb && (cb as HTMLInputElement).checked)
  }, `card-${firstName.replace(/\s+/g,'-').toLowerCase()}`, { timeout: 60000 })

  // go to dashboard, read exported localStorage, clear via UI, then restore and verify
  // go back to the dashboard using the UI
  await page.waitForSelector('button:has-text("Dashboard")')
  await page.click('button:has-text("Dashboard")')
  await page.waitForSelector('h1:has-text("Arsenal Overview")')
  const exported = await page.evaluate(() => localStorage.getItem('arsenaltracker.v1'))
  expect(exported).toBeTruthy()

  page.on('dialog', dialog => dialog.accept())
  await page.click('button:has-text("Clear Local Overrides")')
  const afterClear = await page.evaluate(() => localStorage.getItem('arsenaltracker.v1'))
  expect(afterClear).toBeTruthy()

  // restore
  if (!exported) throw new Error('No exported data to restore')
  // restore via addInitScript so the app picks it up on next load
  await page.context().addInitScript((txt) => {
    try { localStorage.setItem('arsenaltracker.v1', txt) } catch { }
  }, exported)
  await page.goto('/')
  // navigate back to Warframes and verify restored state
  await page.waitForSelector('[data-testid="nav-warframes"]')
  await page.click('[data-testid="nav-warframes"]')
  await page.waitForSelector(`[data-testid="card-${firstName.replace(/\s+/g,'-').toLowerCase()}"]`)
  await page.waitForFunction((testId) => {
    const c = document.querySelector(`[data-testid="${testId}"]`)
    if (!c) return false
    const cb = c.querySelector('input[type="checkbox"]')
    return !!(cb && (cb as HTMLInputElement).checked)
  }, `card-${firstName.replace(/\s+/g,'-').toLowerCase()}`, { timeout: 60000 })
})
