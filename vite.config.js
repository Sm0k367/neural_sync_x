import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', 
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Optimizing for 2026 browsers
    target: 'esnext'
  },
  server: {
    port: 3000,
    open: true
  }
});
