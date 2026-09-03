const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const srcMorning = path.join(root, 'resources', 'icon-morning.png');
const srcEvening = path.join(root, 'resources', 'icon-evening.png');
const srcNotif = path.join(root, 'resources', 'icon-notification.png');

const densities = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

async function genIcon(src, outName) {
  for (const d of densities) {
    const dir = path.join(root, 'android', 'app', 'src', 'main', 'res', d.dir);
    fs.mkdirSync(dir, { recursive: true });
    const out = path.join(dir, outName);
    await sharp(src).resize(d.size, d.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(out);
    const outRound = path.join(dir, outName.replace('.png', '') + '_round.png');
    await sharp(src).resize(d.size, d.size, { fit: 'cover' }).png().toFile(outRound);
  }
}

async function genNotif() {
  const drawables = [
    { dir: 'drawable-mdpi', size: 24 },
    { dir: 'drawable-hdpi', size: 36 },
    { dir: 'drawable-xhdpi', size: 48 },
    { dir: 'drawable-xxhdpi', size: 72 },
    { dir: 'drawable-xxxhdpi', size: 96 },
    { dir: 'drawable', size: 96 },
  ];
  for (const d of drawables) {
    const dir = path.join(root, 'android', 'app', 'src', 'main', 'res', d.dir);
    fs.mkdirSync(dir, { recursive: true });
    const out = path.join(dir, 'ic_stat_hissn.png');
    await sharp(srcNotif).resize(d.size, d.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).tint({ r: 255, g: 255, b: 255 }).png().toFile(out);
  }
}

(async () => {
  if (fs.existsSync(srcMorning)) await genIcon(srcMorning, 'ic_launcher_morning.png');
  if (fs.existsSync(srcEvening)) await genIcon(srcEvening, 'ic_launcher_evening.png');
  if (fs.existsSync(srcEvening)) await genIcon(srcEvening, 'ic_launcher.png');
  if (fs.existsSync(srcNotif)) await genNotif();
  console.log('icons generated');
})();
