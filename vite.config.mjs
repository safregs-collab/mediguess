import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

/** Inject package version into dist/sw.js at build time */
function swVersionPlugin() {
  return {
    name: 'sw-version',
    async closeBundle() {
      const swPath = 'dist/sw.js';
      // Wait for Vite to copy public/ into dist/
      for (let i = 0; i < 20; i++) {
        if (existsSync(swPath)) break;
        await new Promise((r) => setTimeout(r, 100));
      }
      if (!existsSync(swPath)) {
        console.warn('[sw-version] dist/sw.js not found, skipping patch');
        return;
      }
      let content = readFileSync(swPath, 'utf-8');
      content = content.replace(/__DOCW_VERSION__/g, pkg.version);
      writeFileSync(swPath, content);
      console.log(`[sw-version] Injected v${pkg.version} into dist/sw.js`);
    },
  };
}

export default defineConfig({
  plugins: [react(), swVersionPlugin()],
  base: './',
  build: { outDir: 'dist' }
});
