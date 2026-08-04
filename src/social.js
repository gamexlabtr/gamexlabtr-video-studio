const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const title = process.env.GAME_TITLE || 'New HTML5 Game';
const category = process.env.GAME_CATEGORY || 'HTML5 Games';
const url = process.env.GAME_URL || 'https://gamexlabtr.com';
const lang = (process.env.SOCIAL_LANGUAGE || 'en').toLowerCase();
const webhook = process.env.MAKE_WEBHOOK || '';

function slugTag(value) {
  return String(value)
    .replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ ]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('');
}

const categoryTag = slugTag(category) || 'HTML5Games';

const captions = {
  tr: `🎮 ${title}\n\nYeni oyun şimdi GamexlabTR'de!\n🌍 Ücretsiz oyna: ${url}\n\n❤️ Her gün yeni oyunlar için sayfamızı beğenmeyi ve takip etmeyi unutmayın!\n\n#GamexlabTR #HTML5Games #ÜcretsizOyunlar #${categoryTag}`,
  en: `🎮 ${title}\n\nA new game is now available on GamexlabTR!\n🌍 Play free: ${url}\n\n❤️ Like and follow for daily new games!\n\n#GamexlabTR #HTML5Games #FreeGames #${categoryTag}`
};

const payload = {
  gameTitle: title,
  category,
  gameUrl: url,
  language: lang,
  caption: captions[lang] || captions.en,
  videoFile: 'gamexlabtr-final.mp4',
  coverFile: 'cover.png',
  createdAt: new Date().toISOString()
};

fs.writeFileSync(path.resolve('output/social.json'), JSON.stringify(payload, null, 2));

if (!webhook) {
  console.log('MAKE_WEBHOOK is empty; social.json was created without sending.');
  process.exit(0);
}

const body = JSON.stringify(payload);
const endpoint = new URL(webhook);
const client = endpoint.protocol === 'https:' ? https : http;

const req = client.request({
  method: 'POST',
  hostname: endpoint.hostname,
  port: endpoint.port || undefined,
  path: endpoint.pathname + endpoint.search,
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
}, res => {
  console.log(`Make webhook response: ${res.statusCode}`);
  res.resume();
});

req.on('error', err => {
  console.error(`Make webhook failed: ${err.message}`);
  process.exitCode = 1;
});

req.write(body);
req.end();
