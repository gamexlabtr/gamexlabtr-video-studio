const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const GAME_URL = process.env.GAME_URL;
const GAME_TITLE = process.env.GAME_TITLE || 'New HTML5 Game';
const RECORD_SECONDS = Math.max(8, Math.min(30, Number(process.env.RECORD_SECONDS || 15)));
const outputDir = path.resolve('output');
const rawDir = path.join(outputDir, 'raw');

if (!GAME_URL) {
  console.error('GAME_URL environment variable is required.');
  process.exit(1);
}

fs.mkdirSync(rawDir, { recursive: true });

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tryClick(page, selectors) {
  for (const selector of selectors) {
    try {
      const loc = page.locator(selector).first();
      if (await loc.isVisible({ timeout: 900 })) {
        await loc.click({ timeout: 2500, force: true });
        console.log(`Clicked: ${selector}`);
        await sleep(1200);
        return true;
      }
    } catch (_) {}
  }
  return false;
}

async function dismissCommonOverlays(page) {
  const selectors = [
    'button:has-text("Accept")',
    'button:has-text("Accept All")',
    'button:has-text("Kabul Et")',
    'button:has-text("Tümünü Kabul Et")',
    'button:has-text("I Agree")',
    '[aria-label="Close"]',
    '[aria-label="Kapat"]',
    '.cookie-accept',
    '#onetrust-accept-btn-handler'
  ];
  await tryClick(page, selectors);
}

async function startGame(page) {
  const selectors = [
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
  ];
  await tryClick(page, selectors);
}

async function performGenericGameplay(page, durationMs) {
  const end = Date.now() + durationMs;
  const keys = ['ArrowRight', 'ArrowUp', 'Space', 'ArrowLeft'];
  let i = 0;

  while (Date.now() < end) {
    try {
      await page.keyboard.down(keys[i % keys.length]);
      await sleep(550);
      await page.keyboard.up(keys[i % keys.length]);
      await page.mouse.move(
        120 + Math.floor(Math.random() * 460),
        260 + Math.floor(Math.random() * 600),
        { steps: 8 }
      );
      await page.mouse.click(
        120 + Math.floor(Math.random() * 460),
        260 + Math.floor(Math.random() * 600)
      );
    } catch (_) {}
    i++;
    await sleep(500);
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
        '--autoplay-policy=no-user-gesture-required',
        '--disable-dev-shm-usage'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 720, height: 1280 },
      recordVideo: {
        dir: rawDir,
        size: { width: 720, height: 1280 }
      },
      userAgent:
        'Mozilla/5.0 (Linux; Android 13; GamexlabTRVideoBot/1.0) AppleWebKit/537.36 Chrome/125 Mobile Safari/537.36'
    });

    const page = await context.newPage();
    page.setDefaultTimeout(8000);

    console.log(`Opening: ${GAME_URL}`);
    await page.goto(GAME_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(7000);

    await dismissCommonOverlays(page);
    await startGame(page);
    await sleep(3000);

    console.log(`Recording approximately ${RECORD_SECONDS} seconds...`);
    await performGenericGameplay(page, RECORD_SECONDS * 1000);

    await page.screenshot({
      path: path.join(outputDir, 'cover.png'),
      fullPage: false
    });

    const video = page.video();
    await context.close();
    const savedPath = await video.path();
    const targetPath = path.join(outputDir, 'gameplay.webm');
    fs.copyFileSync(savedPath, targetPath);

    fs.writeFileSync(
      path.join(outputDir, 'metadata.json'),
      JSON.stringify(
        {
          gameUrl: GAME_URL,
          gameTitle: GAME_TITLE,
          recordedSeconds: RECORD_SECONDS,
          createdAt: new Date().toISOString()
        },
        null,
        2
      )
    );

    console.log(`Gameplay video saved: ${targetPath}`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
})();
