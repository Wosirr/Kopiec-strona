import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url    = process.argv[2] || 'http://localhost:3000';
const label  = process.argv[3] || '';

const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// find next available N
let n = 1;
while (fs.existsSync(path.join(dir, `screenshot-${n}${label ? '-' + label : ''}.png`))) n++;
const outFile = path.join(dir, `screenshot-${n}${label ? '-' + label : ''}.png`);

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 800));

  // Scroll through the entire page to trigger IntersectionObserver reveals
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  const step = 600;
  for (let y = 0; y <= pageHeight; y += step) {
    await page.evaluate(yPos => window.scrollTo(0, yPos), y);
    await new Promise(r => setTimeout(r, 80));
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 600));

  // Force all reveal elements visible (IntersectionObserver may miss some)
  await page.evaluate(() => {
    document.querySelectorAll('.r').forEach(el => el.classList.add('in'));
  });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: outFile, fullPage: true });
  await browser.close();
  console.log(`Saved: ${outFile}`);
})();
