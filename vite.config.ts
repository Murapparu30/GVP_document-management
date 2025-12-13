import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'src/main/main.ts',
        vite: {
          build: {
            // Build as ES modules (consistent with package.json type: "module")
            lib: {
              entry: 'src/main/main.ts',
              formats: ['es'],
              fileName: () => 'main.js',
            },
            target: 'node16',
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron', 'sql.js'],
            },
          },
        },
      },
      {
        entry: 'src/main/preload.ts',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            lib: {
              entry: 'src/main/preload.ts',
              formats: ['es'],
              fileName: () => 'preload.js',
            },
            target: 'node16',
            outDir: 'dist-electron',
          },
        },
      },
    ]),
    renderer(),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
