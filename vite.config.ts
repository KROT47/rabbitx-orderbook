import eslintPlugin from '@nabla/vite-plugin-eslint';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // legacy(),
    basicSsl(),
    react(),
    svgr(),
    checker({ typescript: true }),
    eslintPlugin(),
  ],
  resolve: {
    alias: {
      // for TypeScript path alias import like : @/x/y/z
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        secure: false,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
});
