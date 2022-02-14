const puppeteer = require('puppeteer');

const asyncTimeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async (url, width) => {

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.CHROME_BIN || null,
    args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({width: width || 800, height: 800, deviceScaleFactor: width ? 1.6 : 4});
  await page.goto(url, {
    waitUntil: 'networkidle2',
  });
  await asyncTimeout(50);
  // await page.pdf({ path: 'label.pdf', width: '62mm', height: '30mm', landscape: false, margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' } });

  const content = await page.$('body');
  const imageBuffer = await content.screenshot({ omitBackground: true });

  const pages = await browser.pages();
  await Promise.all(pages.map(page =>page.close()));
  await browser.close();

  return imageBuffer;
};