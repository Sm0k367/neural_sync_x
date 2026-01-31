import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Ensure the base path is absolute for Vercel routing
  base: '/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000
  }
});
