const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const src = path.join(root, 'resources', 'icon-new.png');
const dirs = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

(async () => {
  for (const [dir, size] of Object.entries(dirs)) {
    const outDir = path.join(root, 'android', 'app', 'src', 'main', 'res', dir);
    fs.mkdirSync(outDir, { recursive: true });
    await sharp(src).resize(size, size, { fit: 'cover' }).png().toFile(path.join(outDir, 'ic_launcher_foreground.png'));
    await sharp({ create: { width: size, height: size, channels: 4, background: { r: 11, g: 12, b: 27, alpha: 1 } } })
      .png().toFile(path.join(outDir, 'ic_launcher_background.png'));
    console.log(dir, 'ok');
  }
})();
