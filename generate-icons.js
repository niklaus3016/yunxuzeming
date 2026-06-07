import fs from 'fs';
import path from 'path';

// 创建 assets 目录
const assetsDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log('Created assets directory');
}

// 复制图标文件
const sourceIcon = path.join(path.dirname(new URL(import.meta.url).pathname), 'yunxu512.png');
const destIcon = path.join(assetsDir, 'icon.png');

if (fs.existsSync(sourceIcon)) {
  fs.copyFileSync(sourceIcon, destIcon);
  console.log('Copied icon to assets/icon.png');
} else {
  console.error('Source icon not found:', sourceIcon);
  process.exit(1);
}

// 也创建 splash 图片
const destSplash = path.join(assetsDir, 'splash.png');
fs.copyFileSync(sourceIcon, destSplash);
console.log('Copied splash to assets/splash.png');

console.log('Done! Now run: npx capacitor-assets generate');
