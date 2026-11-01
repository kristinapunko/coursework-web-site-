import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    mimeTypes: {
      'text/jsx': 'text/javascript'
    }
  },
  base: '/',
  plugins: [react(),tailwindcss(),],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) return 'react-vendor'
          if (id.includes('@reduxjs') || id.includes('react-redux')) return 'redux-vendor'
          if (id.includes('framer-motion')) return 'motion-vendor'
          if (id.includes('swiper')) return 'swiper-vendor'
          if (id.includes('date-fns') || id.includes('react-datepicker')) return 'date-vendor'
          if (id.includes('react-icons')) return 'icons-vendor'
          return undefined
        },
      },
    },
  },
})
