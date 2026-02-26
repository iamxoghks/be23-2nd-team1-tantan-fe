import path from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  envPrefix: ['VITE_', 'VUE_APP_'],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    port: 3000,
  },
});
