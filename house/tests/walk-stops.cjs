/* Walks to all 22 stops in order, in a real (headless) Chrome, and reports whether each one was reached,
   how long it took, and the frame times on the way. Run against a local server:

     npm i puppeteer-core
     node house/tests/walk-stops.cjs http://localhost:8000/house/

   Set CHROME to your Chrome binary if it isn't in the default macOS location. */
const puppeteer = require('puppeteer-core');
const url = process.argv[2] || 'http://localhost:8000/house/';
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', protocolTimeout: 0, defaultViewport: null, args: ['--window-size=1280,860', '--use-angle=metal'] });
  const page = (await browser.pages())[0];
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__house, { timeout: 30000 });
  await page.evaluate(() => { __house.start(); window.__frames = []; let l = performance.now(); const f = n => { __frames.push(n - l); l = n; requestAnimationFrame(f); }; requestAnimationFrame(f); });
  let failed = 0;
  const n = await page.evaluate(() => STOPS.length);
  for (let i = 0; i < n; i++) {
    const r = await page.evaluate(async i => {
      const h = __house, panel = document.querySelector('#panel');
      document.querySelector('#pClose').click();
      await new Promise(r => setTimeout(r, 400));
      __frames.length = 0;
      const t = performance.now();
      h.goTo(i);
      while (performance.now() - t < 60000 && !panel.classList.contains('in')) await new Promise(r => setTimeout(r, 100));
      const d = __frames.slice().sort((a, b) => a - b);
      return { stop: STOPS[i].id, reached: panel.classList.contains('in'), seconds: +((performance.now() - t) / 1000).toFixed(1), medianFps: Math.round(1000 / (d[d.length >> 1] || 16)), worstFrameMs: Math.round(d[d.length - 1] || 0) };
    }, i);
    if (!r.reached) failed++;
    console.log(JSON.stringify(r));
  }
  console.log(failed ? `${failed} stop(s) not reached` : `all ${n} stops reached`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
