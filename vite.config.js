/**
 * vite.config.js
 * Konfigurasi Vite untuk build optimization
 */

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Hapus minify: 'terser', gunakan default esbuild
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three']
        }
      }
    }
  },
  server: {
    port: 3000
  }
});
