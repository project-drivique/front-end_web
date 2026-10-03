import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts'
            }
            if (id.includes('react-icons')) {
              return 'vendor-icons'
            }
            if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react'
            }
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'vendor-i18n'
            }
            if (id.includes('sweetalert2')) {
              return 'vendor-swal'
            }
            if (id.includes('date-fns') || id.includes('axios') || id.includes('zustand')) {
              return 'vendor-utils'
            }
          }
        },
      },
    },
  },
})