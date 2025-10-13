import { test, expect } from '@playwright/test'

test('export import roundtrip via localStorage', async ({ page }) => {
  // go to warframes and read first warframe name
  await page.goto('http://localhost:5173/warframes')
  await page.waitForSelector('.title h3')
  const firstName = await page.locator('.title h3').first().textContent()
  expect(firstName).toBeTruthy()

  // create a versioned payload marking neuroptics for the first warframe
  const payload: { version: number; overrides: Record<string, { neuroptics_collected?: boolean }> } = {
    version: 1,
    overrides: {} as Record<string, { neuroptics_collected?: boolean }>
  }
  payload.overrides[firstName!.trim()] = { neuroptics_collected: true }

  // write payload to localStorage and reload
  await page.evaluate((p) => localStorage.setItem('arsenaltracker.v1', JSON.stringify(p)), payload)
  await page.reload()

  // verify the first warframe card shows Neuroptics: true
  await page.goto('http://localhost:5173/warframes')
  await page.waitForSelector(`.title:has-text("${firstName!.trim()}")`)
  const card = page.locator('.card').filter({ hasText: firstName!.trim() }).first()
  await expect(card.locator('text=Neuroptics: true')).toBeVisible()

  // go to dashboard, read exported localStorage, clear via UI, then restore and verify
  await page.goto('http://localhost:5173/')
  await page.waitForSelector('h1:has-text("Arsenal Overview")')
  const exported = await page.evaluate(() => localStorage.getItem('arsenaltracker.v1'))
  expect(exported).toBeTruthy()

  page.on('dialog', dialog => dialog.accept())
  await page.click('button:has-text("Clear Local Overrides")')
  const afterClear = await page.evaluate(() => localStorage.getItem('arsenaltracker.v1'))
  expect(afterClear).toBeTruthy()

  // restore
  if (!exported) throw new Error('No exported data to restore')
  await page.evaluate((txt: string) => localStorage.setItem('arsenaltracker.v1', txt), exported)
  await page.reload()

  await page.goto('http://localhost:5173/warframes')
  const card2 = page.locator('.card').filter({ hasText: firstName!.trim() }).first()
  await expect(card2.locator('text=Neuroptics: true')).toBeVisible()
})
