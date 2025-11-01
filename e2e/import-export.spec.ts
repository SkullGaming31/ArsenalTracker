import { test, expect } from '@playwright/test'

test('export import roundtrip via localStorage', async ({ page }) => {
  // load the app root and navigate using the in-app nav (this app doesn't use a router)
  await page.goto('/')
  // wait for nav and click Warframes
  const navWarframes = page.locator('[data-testid="nav-warframes"]')
  await expect(navWarframes).toBeVisible({ timeout: 60000 })
  await navWarframes.click()
  // allow extra time for the page to render Warframe cards and capture the first visible warframe name
  const firstTitle = page.locator('.title h3').first()
  await expect(firstTitle).toBeVisible({ timeout: 60000 })
  // pick the first rendered warframe card to avoid relying on a hardcoded name which can move
  const firstName = (await firstTitle.innerText()).trim()

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
  const navWarframesAgain = page.locator('[data-testid="nav-warframes"]')
  await expect(navWarframesAgain).toBeVisible({ timeout: 60000 })
  await navWarframesAgain.click()
  const cardTestId = `card-${firstName.replace(/\s+/g,'-').toLowerCase()}`
  const firstCard = page.locator(`[data-testid="${cardTestId}"]`)
  await expect(firstCard).toBeVisible({ timeout: 60000 })
  // ensure the first card's neuroptics checkbox is checked
  const neuroCheckbox = firstCard.locator('input[type="checkbox"]').first()
  await expect(neuroCheckbox).toBeChecked({ timeout: 60000 })

  // go to dashboard, read exported localStorage, clear via UI, then restore and verify
  // go back to the dashboard using the UI
  const dashboardBtn = page.locator('button:has-text("Dashboard")')
  await expect(dashboardBtn).toBeVisible({ timeout: 60000 })
  await dashboardBtn.click()
  const overviewH1 = page.locator('h1:has-text("Arsenal Overview")')
  await expect(overviewH1).toBeVisible({ timeout: 60000 })
  const exported = await page.evaluate(() => localStorage.getItem('arsenaltracker.v1'))
  expect(exported).toBeTruthy()

  page.on('dialog', dialog => dialog.accept())
  const clearBtn = page.locator('button:has-text("Clear Local Overrides")')
  await expect(clearBtn).toBeVisible({ timeout: 60000 })
  await clearBtn.click()
  const afterClear = await page.evaluate(() => localStorage.getItem('arsenaltracker.v1'))
  expect(afterClear).toBeTruthy()

  // restore (exported is expected to be truthy from earlier check)
  expect(exported).toBeTruthy()
  // restore via addInitScript so the app picks it up on next load
  await page.context().addInitScript((txt: string) => {
    try { localStorage.setItem('arsenaltracker.v1', txt) } catch { }
  }, exported as string)
  await page.goto('/')
  // navigate back to Warframes and verify restored state
  const navWarframes2 = page.locator('[data-testid="nav-warframes"]')
  await expect(navWarframes2).toBeVisible({ timeout: 60000 })
  await navWarframes2.click()
  const restoredCard = page.locator(`[data-testid="${cardTestId}"]`)
  await expect(restoredCard).toBeVisible({ timeout: 60000 })
  const restoredCheckbox = restoredCard.locator('input[type="checkbox"]').first()
  await expect(restoredCheckbox).toBeChecked({ timeout: 60000 })
})
