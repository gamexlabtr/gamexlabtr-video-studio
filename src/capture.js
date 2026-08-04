const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const GAME_URL = process.env.GAME_URL;
const GAME_TITLE = process.env.GAME_TITLE || 'New HTML5 Game';
const secondsRaw = Number(process.env.RECORD_SECONDS || 15);
const RECORD_SECONDS = Math.max(8, Math.min(30, Number.isFinite(secondsRaw) ? secondsRaw : 15));

if (!GAME_URL) {
  console.error('GAME_URL is required.');
  process.exit(1);
}

const outputDir = path.resolve('output');
const rawDir = path.join(outputDir, 'raw');
fs.mkdirSync(rawDir, { recursive: true });

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function clickFirstVisible(page, selectors) {
  for (const selector of selectors) {
    try {
      const el = page.locator(selector).first();
      if (await el.isVisible({ timeout: 800 })) {
        await el.click({ force: true, timeout: 2500 });
        await sleep(1200);
        return selector;
      }
    } catch (_) {}
  }
  return null;
}

async function dismissOverlays(page) {
  await clickFirstVisible(page, [
    '#onetrust-accept-btn-handler',
    'button:has-text("Accept All")',
    'button:has-text("Accept")',
    'button:has-text("Tümünü Kabul Et")',
    'button:has-text("Kabul Et")',
    'button:has-text("I Agree")',
    '[aria-label="Close"]',
    '[aria-label="Kapat"]'
  ]);
}

async function startGame(page) {
  return clickFirstVisible(page, [
    'button:has-text("Play")',
    'button:has-text("PLAY")',
    'button:has-text("Oyna")',
    'button:has-text("Start")',
    'button:has-text("START")',
    '[aria-label*="play" i]',
    '.play-button',
    '.btn-play',
    '#play',
    'canvas'
  ]);
}

async function genericGameplay(page, durationMs) {
  const end = Date.now() + durationMs;
  const keys = ['ArrowRight', 'ArrowUp', 'Space', 'ArrowLeft'];
  let i = 0;

  while (Date.now() < end) {
    const key = keys[i % keys.length];
    try {
      await page.keyboard.down(key);
      await sleep(420);
      await page.keyboard.up(key);

      const x = 120 + Math.floor(Math.random() * 470);
      const y = 260 + Math.floor(Math.random() * 720);
      await page.mouse.move(x, y, { steps: 6 });
      await page.mouse.click(x, y);
    } catch (_) {}
    i += 1;
    await sleep(520);
  }
}

(async () => {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--autoplay-policy=no-user-gesture-required'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 720, height: 1280 },
      recordVideo: {
        dir: rawDir,
        size: { width: 720, height: 1280 }
      }
    });

    const page = await context.newPage();
    page.setDefaultTimeout(8000);

    console.log(`Opening ${GAME_URL}`);
    await page.goto(GAME_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 90000
    });

    await sleep(7000);
    await dismissOverlays(page);
    const clicked = await startGame(page);
    console.log(clicked ? `Clicked ${clicked}` : 'No play button found; continuing.');
    await sleep(3000);

    await genericGameplay(page, RECORD_SECONDS * 1000);

    await page.screenshot({
      path: path.join(outputDir, 'cover.png'),
      fullPage: false
    });

    const video = page.video();
    await context.close();

    const rawVideoPath = await video.path();
    const targetVideoPath = path.join(outputDir, 'gameplay.webm');
    fs.copyFileSync(rawVideoPath, targetVideoPath);

    fs.writeFileSync(
      path.join(outputDir, 'metadata.json'),
      JSON.stringify({
        gameUrl: GAME_URL,
        gameTitle: GAME_TITLE,
        recordSeconds: RECORD_SECONDS,
        createdAt: new Date().toISOString()
      }, null, 2)
    );

    console.log(`Saved ${targetVideoPath}`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
})();
