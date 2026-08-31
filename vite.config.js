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
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    target: ['es2020', 'chrome87', 'safari14', 'firefox78'],
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/gsap') || id.includes('node_modules/animejs')) {
            return 'vendor-animation';
          }
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three') || id.includes('node_modules/@splinetool')) {
            return 'vendor-3d';
          }
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/react-icons')) {
            return 'vendor-icons';
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
