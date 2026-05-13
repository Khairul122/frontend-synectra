import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/gsap')) {
            return 'vendor-gsap';
          }
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/lenis')) {
            return 'vendor-lenis';
          }
          if (id.includes('node_modules/@splinetool')) {
            return 'vendor-spline';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
