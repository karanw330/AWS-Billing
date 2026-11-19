import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/\/node_modules\/(recharts|@mantine\/charts|victory-vendor|d3-[^/]+)\//.test(id)) return 'charts';
          if (/\/node_modules\/@mantine\/(core|hooks|dates)\//.test(id)) return 'mantine';
          if (/\/node_modules\/(react|react-dom|react-router|scheduler)\//.test(id)) return 'react';
        },
      },
    },
  },
});
