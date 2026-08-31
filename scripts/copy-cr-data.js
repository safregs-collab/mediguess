import { copyFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = join(__dirname, '..', 'src', 'features', 'cr-extractor', 'data');
const destDir = join(__dirname, '..', 'public', 'data');

if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
}

const files = readdirSync(srcDir).filter(f => f.endsWith('.json'));
for (const file of files) {
  copyFileSync(join(srcDir, file), join(destDir, file));
  console.log(`Copied: ${file}`);
}
console.log(`Done. ${files.length} file(s) copied.`);
