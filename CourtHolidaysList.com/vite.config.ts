import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Split vendor chunks for better caching / Core Web Vitals
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'router'
            if (id.includes('react-helmet-async')) return 'helmet'
            if (id.includes('react-dom') || id.includes('/react/')) {
              return 'react-vendor'
            }
          }
        },
      },
    },
  },
})
