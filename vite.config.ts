import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { defineConfig } from 'vite';

const images = new Set<string>();
const assetRoot = resolve('src/assets');
const assetPath = (file: string) =>
  `assets/${relative(assetRoot, file).replaceAll('\\', '/')}`;

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'image-imports',
      enforce: 'pre',
      buildStart() {
        images.clear();
      },
      resolveId(source, importer) {
        if (!source.endsWith('.png') || !importer) return null;
        const file = resolve(dirname(importer), source);
        images.add(file);
        return { id: file, external: true };
      },
      generateBundle() {
        for (const file of images)
          this.emitFile({
            type: 'asset',
            fileName: assetPath(file),
            source: readFileSync(file),
          });
      },
    },
  ],
  base: './',
  publicDir: false,
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input: {
        index: 'src/index.ts',
        style: 'src/styles/gym-experience.css',
      },
      external: (id) => /^(react(?:\/.*)?|@radix-ui\/react-icons)$/.test(id),
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        paths: (id) => (images.has(id) ? `./${assetPath(id)}` : id),
        assetFileNames: (asset) =>
          asset.names.some((name) => name.endsWith('.css'))
            ? 'style.css'
            : 'assets/[name]-[hash][extname]',
      },
    },
  },
});
