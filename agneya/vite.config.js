// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
        font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net;
        img-src 'self' data: https: http:;
        connect-src 'self' *;
      `.replace(/\s+/g, ' ').trim()
    }
  }
});