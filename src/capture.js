const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const GAME_URL = process.env.GAME_URL;
const GAME_TITLE = process.env.GAME_TITLE || 'New Game';
const GAME_CATEGORY = process.env.GAME_CATEGORY || 'Games';

const rawSeconds = Number(process.env.RECORD_SECONDS || 30);
const RECORD_SECONDS = Math.max(
  8,
  Math.min(60, Number.isFinite(rawSeconds) ? rawSeconds : 30)
);

if (!GAME_URL) {
  console.error('GAME_URL is required.');
  process.exit(1);
}

const outputDir = path.resolve('output');
const rawDir = path.join(outputDir, 'raw');

fs.mkdirSync(rawDir, { recursive: true });

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function clickFirstVisible(page, selectors) {
  for (const selector of selectors) {
    try {
      const el = page.locator(selector).first();

      if (await el.isVisible({ timeout: 1200 })) {
        await el.click({
          force: true,
          timeout: 5000
        });

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

  const keys = [
    'ArrowRight',
    'ArrowUp',
    'Space',
    'ArrowLeft',
    'ArrowDown'
  ];

  let i = 0;

  while (Date.now() < end) {
    const key = keys[i % keys.length];

    try {
      await page.keyboard.down(key);
      await sleep(420);
      await page.keyboard.up(key);

      const x = 100 + Math.floor(Math.random() * 500);
      const y = 220 + Math.floor(Math.random() * 850);

      await page.mouse.move(x, y, {
        steps: 6
      });

      await page.mouse.click(x, y);
    } catch (_) {}

    i += 1;

    await sleep(520);
  }
}

async function saveCover(page) {
  const coverPath = path.join(
    outputDir,
    'cover.png'
  );

  try {
    console.log('Creating cover screenshot...');

    await page.screenshot({
      path: coverPath,
      fullPage: false,
      animations: 'disabled',
      timeout: 30000
    });

    console.log('Cover screenshot created.');
  } catch (error) {
    /*
     * Cover oluşturulamaması videoyu öldürmemeli.
     * Video workflow'u devam eder.
     */
    console.warn(
      'Cover screenshot failed, continuing without cover:',
      error.message
    );
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
        '--disable-gpu',
        '--autoplay-policy=no-user-gesture-required'
      ]
    });

    const context = await browser.newContext({
      viewport: {
        width: 720,
        height: 1280
      },

      recordVideo: {
        dir: rawDir,

        size: {
          width: 720,
          height: 1280
        }
      }
    });

    const page = await context.newPage();

    /*
     * 8 saniye çok düşüktü.
     * GitHub runner + oyun iframe'leri için yükseltiyoruz.
     */
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(90000);

    console.log(`Opening game: ${GAME_URL}`);

    await page.goto(GAME_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 90000
    });

    /*
     * networkidle kullanmıyoruz.
     * Oyun/reklam/iframe sayfalarında ağ bağlantıları
     * sürekli açık kalabilir.
     */
    await sleep(8000);

    console.log('Dismissing overlays...');
    await dismissOverlays(page);

    console.log('Trying to start game...');
    const startSelector = await startGame(page);

    if (startSelector) {
      console.log(
        `Game start interaction: ${startSelector}`
      );
    } else {
      console.log(
        'No explicit Play button found. Continuing.'
      );
    }

    await sleep(3000);

    console.log(
      `Recording gameplay for ${RECORD_SECONDS} seconds...`
    );

    await genericGameplay(
      page,
      RECORD_SECONDS * 1000
    );

    /*
     * Screenshot hatası artık workflow'u durdurmayacak.
     */
    await saveCover(page);

    const video = page.video();

    /*
     * Playwright video dosyasını context kapanınca finalize eder.
     */
    await context.close();

    if (!video) {
      throw new Error(
        'Playwright did not create a video object.'
      );
    }

    const rawVideoPath = await video.path();

    if (!fs.existsSync(rawVideoPath)) {
      throw new Error(
        `Recorded video not found: ${rawVideoPath}`
      );
    }

    const gameplayPath = path.join(
      outputDir,
      'gameplay.webm'
    );

    fs.copyFileSync(
      rawVideoPath,
      gameplayPath
    );

    console.log(
      `Gameplay video saved: ${gameplayPath}`
    );

    fs.writeFileSync(
      path.join(outputDir, 'metadata.json'),

      JSON.stringify(
        {
          gameUrl: GAME_URL,
          gameTitle: GAME_TITLE,
          category: GAME_CATEGORY,
          recordSeconds: RECORD_SECONDS,
          createdAt: new Date().toISOString()
        },
        null,
        2
      )
    );

    console.log('Capture completed successfully.');

  } catch (error) {
    console.error(
      'Capture failed:',
      error
    );

    process.exitCode = 1;

  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
})();
