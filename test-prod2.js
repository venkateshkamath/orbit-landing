import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://orbit-xotq.onrender.com/', {waitUntil: 'networkidle0'});
  const rootHtml = await page.evaluate(() => document.getElementById('root').innerHTML);
  console.log('ROOT HTML:', rootHtml.length > 100 ? rootHtml.substring(0, 100) + '...' : rootHtml);
  
  const bodyHtml = await page.evaluate(() => document.body.innerHTML);
  console.log('BODY HTML LENGTH:', bodyHtml.length);
  
  await browser.close();
})();
