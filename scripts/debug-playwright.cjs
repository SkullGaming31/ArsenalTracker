const { chromium } = require('playwright');
(async ()=>{
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/warframes');
  await page.waitForSelector('h2:has-text("Warframes")');
  const firstTitle = await page.locator('.title h3').first().textContent();
  console.log('first title:', firstTitle);
  const cards = await page.locator('.card').allTextContents();
  console.log('cards count:', cards.length);
  console.log('first card text slice:', cards[0] ? cards[0].slice(0,200) : '');
  await browser.close();
})();
