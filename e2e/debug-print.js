const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await page.waitForSelector('[data-testid="nav-warframes"]', { timeout: 60000 });
  await page.click('[data-testid="nav-warframes"]');
  const testId = 'card-rhino-prime';
  try {
    await page.waitForSelector(`[data-testid="${testId}"]`, { timeout: 60000 });
    const info = await page.evaluate((testId) => {
      const c = document.querySelector(`[data-testid="${testId}"]`);
      if (!c) return { found: false };
      const inputs = Array.from(c.querySelectorAll('input[type="checkbox"]'));
      return {
        found: true,
        text: c.textContent,
        inputs: inputs.map(i => ({ checked: i.checked, outerHTML: i.outerHTML }))
      };
    }, testId);
    console.log('DEBUG CARD INFO:', JSON.stringify(info, null, 2));
  } catch (e) {
    console.error('DEBUG ERROR', e);
  }
  await browser.close();
})();