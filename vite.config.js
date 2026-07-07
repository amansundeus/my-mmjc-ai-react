import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/onemmjc-api': {
        target: 'https://onemmjc.in',
        changeOrigin: true,
        secure: false, // Bypass SSL certificate issues
        rewrite: (path) => path.replace(/^\/onemmjc-api/, '')
      }
    }
  }
})
