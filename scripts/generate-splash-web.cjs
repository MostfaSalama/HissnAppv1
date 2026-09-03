const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// produces public/splash-web.png (optimized web splash) from resources/splash.png

const root = path.join(__dirname, '..');
const src = path.join(root, 'resources', 'splash.png');
const outDir = path.join(root, 'public');
const out = path.join(outDir, 'splash-web.png');

if (!fs.existsSync(src)) {
  console.error('resources/splash.png not found');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const meta = await sharp(src).metadata();
  const size = Math.min(1200, meta.width || 1200, meta.height || 1200);
  await sharp(src)
    .resize({ width: size, height: size, fit: 'inside' })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log('splash-web.png generated');
})();
