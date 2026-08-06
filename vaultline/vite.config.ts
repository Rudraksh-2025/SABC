import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` is read from BASE_PATH so a sub-path deploy (GitHub Pages project site)
// needs no code change: BASE_PATH=/vaultline/ npm run build
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH ?? '/',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1400,
  },
});
